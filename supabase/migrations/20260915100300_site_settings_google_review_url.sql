-- Adds an optional Google Reviews link, shown to customers who leave a 4-5
-- star review on the public /rate/[token] page as a "share this publicly"
-- prompt. Additive migration: ships separately from the already-applied
-- site_settings table (20260915090000).

-- No CHECK constraint, matching the existing unconstrained instagram_url /
-- facebook_url columns — Zod validates URL shape at the application layer.
ALTER TABLE site_settings ADD COLUMN google_review_url TEXT;
