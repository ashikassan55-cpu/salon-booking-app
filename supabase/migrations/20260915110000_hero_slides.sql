-- Homepage hero background slideshow — previously deferred (the hero only
-- had a plain gradient background, no image upload UI existed anywhere).
-- Additive migration: ships separately from every previously-applied one.

-- sort_order drives display order; the admin can reorder slides with
-- up/down controls that swap adjacent sort_order values. caption is
-- optional per-slide text that replaces the site tagline while that slide
-- is showing — NULL falls back to the salon's normal tagline.
CREATE TABLE hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view hero slides" ON hero_slides
  FOR SELECT TO anon USING (true);
CREATE POLICY "Admin can manage hero slides" ON hero_slides
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Hero images reuse the existing 'gallery' storage bucket with a hero/
-- path prefix (same convention as services/ and staff/) — no new bucket
-- or storage policies needed.
