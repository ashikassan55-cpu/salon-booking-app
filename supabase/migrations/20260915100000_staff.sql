-- Staff / Stylists — real, DB-backed replacement for the static mockTeam data.
-- Additive migration: init_schema (20260914120000) and site_settings
-- (20260915090000) are already applied to the live project, so this ships
-- separately rather than editing either.

-- ============================================================
-- 1. Tables
-- ============================================================

-- is_active is the only supported "removal" path from the admin UI (no hard
-- delete) — a stylist with existing reviews cannot be hard-deleted anyway
-- (see reviews.staff_id ON DELETE RESTRICT in the reviews migration), so
-- deactivating keeps historical bookings/reviews intact while hiding them
-- from the public site and the booking flow.
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  -- One entry per weekday (0=Sunday..6=Saturday): { weekday, open, startHour,
  -- startMinute, endHour, endMinute } — identical shape to
  -- site_settings.working_hours, so this stylist's own weekly schedule
  -- (rather than the salon-wide default) drives their bookable slots.
  schedule JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Which services a stylist performs, and optionally what they charge for it.
-- custom_price NULL means "use services.price as-is" — most stylists won't
-- need an override, only ones whose rate genuinely differs from the base
-- listed price.
CREATE TABLE staff_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  custom_price NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (staff_id, service_id)
);

-- ============================================================
-- 2. Row Level Security
-- ============================================================

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

-- Public only ever needs to see active stylists (the public Team section and
-- the booking flow's stylist picker both filter to is_active = true).
CREATE POLICY "Public can view active staff" ON staff
  FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Admin can manage staff" ON staff
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public booking flow needs pricing, but only for stylists it's allowed to see.
CREATE POLICY "Public can view active staff pricing" ON staff_services
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.id = staff_services.staff_id AND staff.is_active
    )
  );
CREATE POLICY "Admin can manage staff pricing" ON staff_services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 3. Storage
-- Staff headshots reuse the existing 'gallery' bucket with a staff/ path
-- prefix (mirroring how service images already use a services/ prefix in
-- the same bucket) — no new bucket or storage policies needed.
-- ============================================================
