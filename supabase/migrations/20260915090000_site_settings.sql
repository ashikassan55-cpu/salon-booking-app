-- Site Settings — single editable row backing the admin "Site Settings" screen.
-- Additive migration: the initial schema (20260914120000) is already applied
-- to the live project, so this ships separately rather than editing it.

CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  address TEXT NOT NULL,
  instagram_url TEXT,
  facebook_url TEXT,
  accent_color TEXT NOT NULL DEFAULT '#ffffff' CHECK (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  -- One entry per weekday (0=Sunday..6=Saturday): { weekday, open, startHour, startMinute, endHour, endMinute }.
  -- Single source of truth for both the public footer display and the
  -- booking calendar's open-day/time-slot logic.
  working_hours JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public needs to read this to render the header/hero/footer and the
-- booking calendar's real hours. Only the admin can change it.
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can update site settings" ON site_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Seed the single row with the current static site-config.ts values as a
-- starting point — the admin can edit all of it from here on.
INSERT INTO site_settings (
  name, tagline, contact_email, contact_phone, whatsapp_number, address,
  instagram_url, facebook_url, accent_color, working_hours
) VALUES (
  'Salon Name',
  'Book your next appointment in seconds.',
  'hello@example.com',
  '+1 (800) 123 456 789',
  '971501404437',
  '27 Division St, New York, NY 10002, USA',
  NULL,
  NULL,
  '#ffffff',
  '[
    {"weekday": 0, "open": false, "startHour": 0, "startMinute": 0, "endHour": 0, "endMinute": 0},
    {"weekday": 1, "open": true, "startHour": 9, "startMinute": 0, "endHour": 18, "endMinute": 0},
    {"weekday": 2, "open": true, "startHour": 9, "startMinute": 0, "endHour": 18, "endMinute": 0},
    {"weekday": 3, "open": true, "startHour": 9, "startMinute": 0, "endHour": 18, "endMinute": 0},
    {"weekday": 4, "open": true, "startHour": 9, "startMinute": 0, "endHour": 18, "endMinute": 0},
    {"weekday": 5, "open": true, "startHour": 9, "startMinute": 0, "endHour": 18, "endMinute": 0},
    {"weekday": 6, "open": true, "startHour": 10, "startMinute": 0, "endHour": 16, "endMinute": 0}
  ]'::jsonb
);
