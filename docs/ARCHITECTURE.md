# Architecture

This is the master template for the agency's single-tenant salon/barbershop booking
sites. One deploy = one client, one Supabase project, one Cloudflare Worker. This
document describes how the template itself is built, not any one client's content.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | TypeScript strict mode, React 19 |
| Database / Auth / Storage | Supabase (Postgres) | Single Postgres project per client; RLS on every table |
| Styling | Tailwind CSS v4 | `@theme inline` tokens in `src/app/globals.css`, no `tailwind.config.js` |
| Validation | Zod v4 | Schemas are translator-aware factories (see i18n below) |
| i18n | next-intl v4 | Cookie-based locale, no `[locale]` URL segment |
| Image handling | `browser-image-compression` | Client-side WebP conversion before every upload |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` | Not Vercel — chosen for this agency's hosting stack |

## Directory structure

```
src/
  app/
    admin/
      (shell)/          # authenticated admin routes, share AdminSidebar + fonts
        page.tsx         # dashboard (KPIs + bookings table)
        services/        # services CRUD
        staff/           # staff CRUD (schedule + per-service pricing)
        gallery/         # gallery image CRUD
        hero/            # hero slideshow CRUD
        settings/        # site_settings CRUD (single row)
      login/             # outside the (shell) group — no sidebar, no admin fonts
    rate/[token]/         # public review page, outside the admin middleware entirely
    page.tsx              # public homepage (Hero, Services, Gallery, Team, Testimonials, Booking)
  components/
    admin/                # admin-only components
    booking/              # booking form + its Server Actions
    review/                # review form (used by /rate/[token])
    layout/, home/, services/, gallery/, team/, testimonials/  # public site sections
  lib/
    supabase/             # client.ts (browser), server.ts (SSR/cookies), database.types.ts
    validation/            # Zod schema factories, one file per form
    settings.ts            # getSiteSettings() — cached per-request fetch of the single site_settings row
    site-config.ts         # fallback defaults, used only before the site_settings migration/seed exists
    timezone.ts             # fixed-offset (Asia/Dubai, +04:00) booking date/time math
    availability.ts         # per-stylist slot computation + conflict checking
    calendar.ts             # calendar grid/date-matrix helpers (locale-aware weekday labels live in the component)
    currency.ts             # formatCurrency() — AED via Intl.NumberFormat("en-AE", ...)
    image-compression.ts    # wraps browser-image-compression with per-surface presets
  i18n/
    request.ts              # SUPPORTED_LOCALES, loadMessages() — merges every messages/*/*.json partial
  middleware.ts              # Supabase-auth-only; gates /admin/*, zero i18n logic
messages/
  en/, ar/                   # one JSON partial per feature area, merged at request time
supabase/
  migrations/                 # applied in filename (timestamp) order, additive only — never edit an applied migration
docs/                          # this file and its siblings
```

## Data model

Every table lives in one Supabase project, RLS-enabled, `anon` role for the public
site and `authenticated` role for the single admin user (public sign-up is disabled,
so "authenticated" only ever means the salon owner).

- **`services`** — name, description, price, duration_minutes, image_url.
- **`staff`** — name, role, photo_url, `schedule` (JSONB, 7-entry weekly hours), `is_active` (soft-delete only — no hard delete; reviews reference staff with `ON DELETE RESTRICT`).
- **`staff_services`** — join table: which services a stylist performs, with an optional `custom_price` override (`NULL` = use the base `services.price`).
- **`bookings`** — customer name/phone, `service_id`/`staff_id` (both `ON DELETE SET NULL`) plus `*_snapshot` columns (name, price, duration) so historical bookings stay accurate even after a service/stylist is edited or deleted. Also carries `review_token` (opaque UUID) and `reviewed_at`.
- **`reviews`** — one row per booking (`booking_id UNIQUE`), rating 1-5, optional comment. A `staff_ratings` view aggregates average rating + count per stylist.
- **`gallery`** — general portfolio images, independent of services.
- **`hero_slides`** — homepage banner slideshow images, `sort_order` for admin-controlled ordering, optional per-slide `caption` (overrides the site tagline while showing).
- **`site_settings`** — single editable row: name, tagline, contact info, WhatsApp number, address, social links, `accent_color` (hex, drives the public site's CTA color with an auto-computed contrasting text color), `working_hours` (JSONB, same shape as `staff.schedule` — the one source of truth for both the footer display and the booking calendar's open-day/slot logic).

**Storage**: one bucket, `gallery`, shared by every image type via path prefixes
(`services/`, `staff/`, `hero/`, and bare gallery uploads) — no per-feature bucket, no
extra storage policies needed per feature.

**Why RPC functions for reviews**: the public `/rate/[token]` page must look up one
booking by an opaque token without ever granting a blanket anon `SELECT` on
`bookings` (which would leak every customer's name and phone number). `SECURITY
DEFINER` functions (`get_booking_for_review`, `submit_review`) bypass RLS internally
but only ever touch the one row matching the token passed as an argument — the
parameter list is the security boundary, not a policy.

## Internationalization (English / Arabic)

- **Cookie-based, no `[locale]` routing.** `next-intl` resolves the active locale
  from the `NEXT_LOCALE` cookie in `src/i18n/request.ts` (default `"en"`). This was a
  deliberate choice over locale-prefixed routes: ~30 call sites (`redirect()`,
  `revalidatePath()` across every `actions.ts`, plus `middleware.ts`) use bare
  hardcoded paths, and a single-location salon site with one admin user gets no real
  benefit from per-locale URLs. The tradeoff: `src/middleware.ts` needed **zero
  changes** — it stays exactly the Supabase-auth logic above.
- **Message files**: `messages/{en,ar}/<feature>.json`, one partial per feature area
  (`public-hero`, `public-booking`, `admin-services`, `validation`, …). Each file's
  top-level key is the namespace passed to `useTranslations("Namespace")` (Client
  Components) or `getTranslations("Namespace")` (Server Components/Actions).
  `loadMessages()` in `src/i18n/request.ts` imports and merges every partial for the
  active locale — adding a new namespace means adding it to that one `Promise.all`.
- **RTL strategy**: physical Tailwind utilities are converted to logical
  equivalents throughout (`pl-*`→`ps-*`, `text-left`→`text-start`, `left-*`→`start-*`,
  `border-l`→`border-s`, etc.), so `<html dir="rtl">` flips layout with zero
  conditional className logic. The one deliberate exception is centering transforms
  (`left-1/2 -translate-x-1/2`), which are direction-agnostic math and must not be
  touched. Directional glyphs (literal `←`/`→` characters, not icons) get
  `rtl:-scale-x-100`.
- **Fonts**: both language's fonts load unconditionally via `next/font/google` (a
  Next.js constraint — font loading can't be conditional), and the actual switch is a
  pure CSS `[dir="rtl"]` override of the `--font-sans`/`--font-admin-body`/
  `--font-admin-display` variables in `globals.css`, so it can never drift out of
  sync with the real resolved direction. Public site: Geist ↔ Noto Sans Arabic.
  Admin: Archivo Narrow/Inter ↔ Cairo (display)/IBM Plex Sans Arabic (body).
- **What stays untranslated by design**: admin-entered content (service names,
  descriptions, staff names/roles) is arbitrary text the salon owner typed in
  whatever language they used — there is no UI-chrome translation layer that can
  translate someone's actual business data. An Arabic-mode visitor gets Arabic
  labels/buttons/headings around English (or Arabic) service names, exactly as
  entered in `/admin`.
- **Validation messages**: Zod schemas needing translated error messages are
  factory functions (`createXSchema(t)`) that take a translator scoped to the
  `Validation` namespace, called fresh per Server Action invocation. Schemas with no
  custom messages (`working-hours.ts`, `staff-service.ts`) are left as plain static
  exports — no factory indirection where there's nothing to translate.

## Admin vs. public design systems

Deliberately separate CSS token sets in `globals.css` (`--background`/`--foreground`/…
for the public site, `--admin-bg`/`--admin-ink`/… for `/admin/*`) so restyling one
never bleeds into the other. The admin visual language ("Atelier": black/white
Utilitarian Modernism, sharp 4px shapes, zero shadows) was adopted from a Stitch
design export; anything Stitch invented with no real backing data (staff "tiers",
station assignment, fake POS sync, CSV export) was deliberately dropped rather than
built as decoration.

## Deployment

Cloudflare Workers via `@opennextjs/cloudflare` (not Vercel). See
[DEPLOYMENT_AND_SETUP_GUIDE.md](./DEPLOYMENT_AND_SETUP_GUIDE.md) for the full,
step-by-step process for spinning up a new client on this template.
