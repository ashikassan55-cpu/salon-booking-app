-- Adds an optional short bio and a display "suite label" per stylist, both
-- shown on the public Team section. Additive migration: ships separately
-- from the already-applied staff table (20260915100000_staff.sql).
--
-- Both are nullable free text, admin-entered via /admin/staff — no
-- auto-numbering or computed availability logic; if an admin leaves either
-- blank, the public card simply omits that line rather than showing an
-- empty placeholder.

ALTER TABLE staff
  ADD COLUMN bio TEXT,
  ADD COLUMN suite_label TEXT;
