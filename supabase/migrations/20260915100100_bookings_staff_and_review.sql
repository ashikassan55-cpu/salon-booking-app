-- Adds stylist assignment and review-request tracking to bookings.
-- Additive migration: ships separately from the already-applied init_schema.

-- staff_id: which stylist is assigned to this booking (ON DELETE SET NULL —
-- same "preserve historical booking records" reasoning already used for
-- service_id). staff_name_snapshot mirrors service_name_snapshot: captures
-- the stylist's name at booking time so it displays correctly even if the
-- stylist is later renamed or deactivated, and so the admin bookings table
-- and the review-request flow never need to join staff for display.
-- Nullable at the DB level only to avoid a backfill for existing rows —
-- application code always populates it for every new booking going forward.
--
-- review_token: opaque, unguessable id used by the public /rate/[token]
-- page to look up this exact booking without any table-wide SELECT policy
-- on bookings (see the SECURITY DEFINER functions in the reviews migration).
-- reviewed_at: set once the customer actually submits a review; NULL means
-- either not yet completed or a review request hasn't been acted on yet.
--
-- service_duration_snapshot: the original schema never captured how long a
-- booking's service takes (only name/price snapshots) — with real per-
-- stylist availability now depending on knowing exactly how long each
-- existing booking occupies that stylist's calendar, this needs its own
-- snapshot for the same "stay correct even if the service is edited/deleted
-- later" reason service_price_snapshot already exists. Defaults to 30 for
-- any pre-existing rows (this template has no production bookings yet);
-- every new booking going forward sets it explicitly.
ALTER TABLE bookings
  ADD COLUMN staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  ADD COLUMN staff_name_snapshot TEXT,
  ADD COLUMN service_duration_snapshot INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN review_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  ADD COLUMN reviewed_at TIMESTAMPTZ;

-- No RLS changes needed: bookings already has "Public can create bookings"
-- (anon INSERT) and "Admin can manage bookings" (authenticated FOR ALL),
-- both of which already cover these new columns. Deliberately no new anon
-- SELECT policy is added here — see the reviews migration for why a plain
-- SELECT-by-token policy would leak the whole table.
