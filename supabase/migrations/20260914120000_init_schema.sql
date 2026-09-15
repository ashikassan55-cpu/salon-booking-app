-- Salon Booking App - Initial Schema
-- gen_random_uuid() is built into Postgres core (13+); no extension needed on Supabase.

-- ============================================================
-- 1. Tables
-- ============================================================

CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- service_id is nullable on purpose: ON DELETE SET NULL preserves historical
-- booking records if the referenced service is later deleted or replaced.
-- service_name_snapshot / service_price_snapshot capture the service's name
-- and price at booking time, so revenue/analytics stay accurate even after
-- the service is later edited or deleted (when service_id would go NULL).
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name_snapshot TEXT NOT NULL,
  service_price_snapshot NUMERIC NOT NULL,
  service_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- General portfolio / before-after / banner images, independent of services.
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Row Level Security
-- ============================================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Services: public read-only, admin (the sole authenticated user) full control.
-- NOTE: this assumes public sign-up is disabled in Supabase Auth, so
-- "authenticated" can only ever mean the salon owner/admin.
CREATE POLICY "Public can view services" ON services
  FOR SELECT TO anon USING (true);
CREATE POLICY "Admin can manage services" ON services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bookings: public can only insert, admin can view/update/delete.
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin can manage bookings" ON bookings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Gallery: same public read-only / admin-managed pattern as services.
CREATE POLICY "Public can view gallery" ON gallery
  FOR SELECT TO anon USING (true);
CREATE POLICY "Admin can manage gallery" ON gallery
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 3. Storage Policies ('gallery' bucket)
-- NOTE: the bucket itself must still be created via the Supabase dashboard
-- or Storage API — it is not created by SQL migrations.
-- ============================================================

CREATE POLICY "Public can view gallery bucket images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gallery');

CREATE POLICY "Admin can upload gallery bucket images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Admin can update gallery bucket images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Admin can delete gallery bucket images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery');
