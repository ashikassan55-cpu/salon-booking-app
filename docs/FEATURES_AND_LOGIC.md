# Features & Business Logic

What the app actually does, and the non-obvious rules behind it. For schema and
stack details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Public site

### Hero
A rotating slideshow (autoplay ~6s, dot navigation) driven by `hero_slides`
(admin-managed, `sort_order` controlled). Falls back to a plain gradient background
if zero slides exist. Each slide can carry its own `caption`, which replaces the
site's normal tagline only while that slide is showing (`NULL` = show the tagline).

### Services
Read-only list from `services`, ordered by `created_at`. Price/duration formatting
goes through `formatCurrency()` (AED) and locale-aware duration strings.

### Gallery
Full-bleed photo grid (`gallery` table), admin-uploaded, auto-compressed to WebP
client-side before upload.

### Team
Real, DB-backed stylists (`staff`, filtered to `is_active = true`). Each card shows a
live `★ avg (N reviews)` badge sourced from the `staff_ratings` view — no badge at
all for a stylist with zero reviews (never a fake "0.0"). Clicking a card opens a
profile modal with Profile / Services / Reviews tabs; a handful of stats
(appointments completed, clients served) are deterministic filler seeded from the
stylist's own id (same stylist always shows the same numbers, not re-rolled per
page load) since no real counters exist in the schema for those yet.

### Testimonials
Static content (`messages/*/public-testimonials.json`), not database-backed — there
is no `testimonials` table. Deliberately out of scope; treated as marketing copy the
agency edits per client alongside the rest of the message files.

### Booking flow
One consolidated page, no multi-step wizard (explicit "reduce clicking fatigue"
requirement): **service → stylist → date/time → name/phone → submit.**

- Picking a service defaults the stylist picker to **"Any Professional"**.
- **Availability** (`src/lib/availability.ts`) is computed per stylist: their own
  weekly `schedule` minus any of their existing (non-cancelled) bookings that would
  overlap the requested slot, in salon-local time (fixed `+04:00` Dubai offset — see
  `src/lib/timezone.ts`). "Any Professional" shows the **union** of every eligible
  stylist's open slots for a given day (a slot is shown if at least one eligible
  stylist is free then).
- **"Any Professional" resolution** happens twice: once client-side while browsing
  (informational), and again authoritatively inside the `submitBooking` Server
  Action at submit time. The action re-fetches real eligibility and existing
  bookings, filters to stylists actually free at the exact chosen instant, sorts by
  **effective price** (custom price if set, else the base service price) then by
  stylist seniority (`created_at`), and assigns the cheapest available one. A
  named-stylist booking that loses a same-slot race hard-fails with a "just taken"
  error; "Any Professional" instead silently falls through to the next-cheapest
  still-free stylist rather than failing the customer's booking outright.
- **Effective price** = `custom_price ?? service.price` (`getEffectivePrice()`) —
  most stylists have no override and just use the service's base price.
- On success, the booking is inserted with `*_snapshot` columns (service name/price/
  duration, stylist name) captured at booking time, then the customer is redirected
  to a `wa.me` deep link with a prefilled WhatsApp confirmation message (their own
  locale's wording and date/time formatting — see the i18n note below).
- Every field is re-validated server-side with Zod before touching the database;
  the client-supplied price is **never** trusted (the service is looked up fresh
  server-side).

### Review flow (`/rate/[token]`)
Outside the admin middleware entirely — a public page gated purely by an opaque,
unguessable `review_token` on the booking row. States: link not found / already
reviewed / not yet completed / ready to review. Submission goes through the
`submit_review` RPC function (not a direct table write), which atomically checks
status + not-already-reviewed and returns a structured `{ok, error_code}` rather
than a raw Postgres error. A 4-5 star review shows an optional "share this on Google
Reviews" prompt if the admin has set `site_settings.google_review_url`.

## Admin panel (`/admin/*`)

Gated by `src/middleware.ts` (Supabase Auth session check) — everything under
`/admin` except `/admin/login` requires a signed-in user. There is exactly one
admin user per deployment (the salon owner); public sign-up is disabled in Supabase
Auth.

- **Dashboard** — KPI cards (bookings today/this week/this month, estimated revenue
  from confirmed+completed bookings only, average ticket, popular services, status
  breakdown) computed by fetching all bookings and reducing in JS (fine at this
  scale; would move to DB-side aggregation if a client's booking volume grew large).
  Below that, a filterable bookings table (status + date, via URL search params —
  no client JS needed for filtering) with one-click status actions (Confirm /
  Complete / Cancel) and, per completed+unreviewed booking, a "Send Review" WhatsApp
  link to the *customer's* number (normalized via `src/lib/phone.ts`'s UAE helper).
- **Services** — full CRUD via a table + slide-over drawer, with the same
  image-compression-preview pattern used everywhere else.
- **Staff** — CRUD for stylists: name/role/photo, a shared `WeeklyScheduleEditor`
  (identical component/shape to the site-wide Working Hours editor), and a
  `ServicePricingPicker` (checkbox per service + optional custom price). No hard
  delete — only deactivate/reactivate (`is_active`), since a stylist with existing
  reviews can't be hard-deleted anyway (`reviews.staff_id ON DELETE RESTRICT`).
- **Gallery** / **Hero** — upload with live client-side WebP compression (progress +
  before/after size), optional caption, delete (removes both the DB row and the
  actual Storage object, recovering the storage path from the stored public URL).
  Hero additionally supports up/down reordering (swaps adjacent `sort_order`
  values).
- **Site Settings** — the single `site_settings` row: Business Info, Working Hours
  (drives both the public footer display and the booking calendar's open-day/slot
  logic — one source of truth, not two hand-synced structures), Social Links, and
  Brand Color (a live color preview; the public site's CTA buttons read this
  directly, with an auto-computed contrasting text color so an admin can't
  accidentally pick a color that makes button text unreadable).
- **Login** — email/password against Supabase Auth; redirects to `/admin` on
  success, back to `/admin/login` if already authenticated and visiting it directly.

## Image pipeline

Every upload surface (Services, Staff photos, Gallery, Hero) runs the same
client-side flow before the file ever reaches the server: `compressImageToWebp()`
(`src/lib/image-compression.ts`) converts to WebP and resizes, with per-surface
presets — Gallery/Services cap at 1200px (portfolio/thumbnail use), Hero uses a
dedicated 1920px-wide preset with a 2MB hard cap (full-bleed banner use, generic
1200px was visibly too small for that). The compressed file is what actually
uploads to the shared `gallery` Storage bucket, under a path prefix per feature
(`services/`, `staff/`, `hero/`, or bare for gallery uploads).

## Internationalization behavior (English / Arabic)

See [ARCHITECTURE.md](./ARCHITECTURE.md#internationalization-english--arabic) for
the technical mechanism. Behaviorally worth knowing:

- The language switcher (public header + admin sidebar) sets a cookie and calls
  `router.refresh()` — no page reload, no lost form state on the page you're on.
- The customer-facing WhatsApp booking confirmation and its date/time formatting
  follow **the customer's** locale at booking time (whatever the public site was set
  to when they submitted). The admin's own booking-table date/time display always
  stays in a consistent format regardless of the admin's own locale toggle — the two
  are intentionally decoupled (`formatInSalonTimezone()` takes an optional locale
  parameter, defaulted for the admin's own internal display, passed explicitly only
  from the customer-facing WhatsApp message).
- Admin-entered business data (service names, descriptions, staff names/roles) is
  never auto-translated — it renders exactly as typed, in whichever language the
  admin used, regardless of the visitor's selected site language. A later,
  explicitly separate feature (not yet built) would add `name_ar`/`description_ar`
  columns per service with an admin "Auto-Translate" button, for salons that want
  bilingual service names too.
