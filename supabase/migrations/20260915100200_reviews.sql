-- Customer review system: a reviews table plus two token-gated RPC
-- functions that let an anonymous visitor look up and review their own
-- completed booking, without ever exposing the bookings table itself to
-- the public.
--
-- Why RPC functions instead of a plain RLS policy: the public /rate/[token]
-- page needs to find one booking by an opaque token. A table-level RLS
-- policy can't condition on "the caller happens to know a specific value" —
-- USING clauses filter rows independent of the caller's own WHERE, so even
-- a policy scoped like `USING (review_token = ...)` isn't expressible
-- without also granting a blanket anon SELECT on bookings, which would let
-- anyone holding the public anon key dump every customer's name and phone
-- number via the REST API. A SECURITY DEFINER function sidesteps this: it
-- runs with the function owner's privileges (bypassing RLS internally) but
-- only ever returns/touches the one row matching the exact token passed as
-- its argument — the parameter list is the security boundary, not a policy.
-- This also avoids needing a service-role key (which the user would have to
-- generate and paste into .env.local themselves).

-- ============================================================
-- 1. Tables
-- ============================================================

-- staff_id is NOT NULL + ON DELETE RESTRICT: a stylist can't be hard-deleted
-- once they have any reviews (protects review history). Deactivating
-- (staff.is_active = false) is the supported way to remove a stylist from
-- the public site instead.
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read (powers the stylist rating badge); no anon INSERT policy at
-- all — every insert goes through submit_review() below.
CREATE POLICY "Public can view reviews" ON reviews
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can manage reviews" ON reviews
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 2. Token-gated RPC functions
-- ============================================================

-- Looks up a booking by its review token for the public /rate/[token] page.
-- Returns zero rows if the token doesn't exist (the page shows "link not
-- found"); returns the booking's current state otherwise so the page can
-- distinguish "already reviewed" from "not yet completed" from "ready".
CREATE FUNCTION get_booking_for_review(p_token UUID)
RETURNS TABLE (
  booking_id UUID,
  service_name TEXT,
  staff_name TEXT,
  status TEXT,
  reviewed_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT id, service_name_snapshot, staff_name_snapshot, status, reviewed_at
  FROM bookings
  WHERE review_token = p_token;
$$;

-- Records a review for the booking matching p_token, iff it's completed and
-- not already reviewed. Returns {ok, error_code} rather than raising, so the
-- calling Server Action can map error_code to a friendly message without
-- ever needing to parse a raw Postgres error string.
--
-- SELECT ... FOR UPDATE + reviews.booking_id UNIQUE together make a
-- double-submit (e.g. a double-click) resolve to a clean 'already_reviewed'
-- result instead of a raw unique-constraint violation.
CREATE FUNCTION submit_review(p_token UUID, p_rating INTEGER, p_comment TEXT)
RETURNS TABLE (ok BOOLEAN, error_code TEXT)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE review_token = p_token FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_found';
    RETURN;
  END IF;

  IF v_booking.status <> 'completed' THEN
    RETURN QUERY SELECT false, 'not_completed';
    RETURN;
  END IF;

  IF v_booking.reviewed_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 'already_reviewed';
    RETURN;
  END IF;

  IF v_booking.staff_id IS NULL THEN
    RETURN QUERY SELECT false, 'no_stylist';
    RETURN;
  END IF;

  INSERT INTO reviews (booking_id, staff_id, rating, comment)
  VALUES (v_booking.id, v_booking.staff_id, p_rating, p_comment);

  UPDATE bookings SET reviewed_at = now() WHERE id = v_booking.id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION get_booking_for_review(UUID) TO anon;
GRANT EXECUTE ON FUNCTION submit_review(UUID, INTEGER, TEXT) TO anon;

-- ============================================================
-- 3. Ratings aggregate view
-- ============================================================

-- security_invoker means this view respects the querying role's own RLS
-- (reviews' own SELECT policy) rather than running as the view owner —
-- good hygiene even though reviews SELECT is already public.
CREATE VIEW staff_ratings WITH (security_invoker = true) AS
  SELECT
    staff_id,
    ROUND(AVG(rating), 2) AS avg_rating,
    COUNT(*) AS review_count
  FROM reviews
  GROUP BY staff_id;
