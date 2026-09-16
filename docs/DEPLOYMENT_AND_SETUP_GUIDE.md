# Deployment & Setup Guide

Step-by-step process for spinning up a **new client** from this master template.
Each client gets their own Supabase project, their own GitHub repo (or branch),
and their own Cloudflare Worker — this template is never shared live across
clients.

## Prerequisites

- Node.js (matching the version this repo was built against; check `package.json`
  engines if one is added later — currently unpinned, use a current LTS)
- A Supabase account (free tier is enough for a single-location salon)
- A Cloudflare account with Workers enabled
- A GitHub account/repo for the client (recommended, not strictly required)
- The client's actual business details ready: salon name, tagline, contact email/
  phone, WhatsApp number, address, working hours, brand color hex, service list,
  staff list + photos, gallery/hero photos

## 1. Create the Supabase project

1. Create a new Supabase project (pick a region close to the client).
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**
   — these go in `.env.local` in step 3.
3. Run every file in `supabase/migrations/` **in filename order** (they're
   timestamp-prefixed and additive — never edit an already-applied one). Either:
   - **Supabase Dashboard → SQL Editor**: paste and run each file's contents in
     order, one at a time, or
   - **Supabase CLI**: `supabase link --project-ref <ref>` then `supabase db push`
     (if the CLI is set up for this repo — no `supabase/config.toml` ships with the
     template yet, so `link` first).
4. **Storage**: create a bucket named exactly `gallery` and mark it **public**.
   This one bucket serves every image type (gallery, services, staff, hero) via
   path prefixes — no other buckets needed. (A private bucket will make
   `getPublicUrl()` serve broken image links — this bit the original build once,
   confirm public before moving on.)
5. **Auth**: in **Authentication → Providers**, confirm email/password is enabled
   and **public sign-up is disabled** (this app assumes exactly one authenticated
   user — the salon owner — can ever exist). Create that one admin user manually:
   **Authentication → Users → Add user** (or invite by email), using the client's
   real login email.
6. (Optional) Run `supabase/seed.sql` for placeholder services to test the booking
   flow before the client's real services are entered — delete or skip this for a
   real launch and enter real services through `/admin/services` instead.
7. The `site_settings` migration seeds one placeholder row (`Salon Name`,
   `hello@example.com`, a generic UAE WhatsApp number, `#ffffff` accent, Mon-Fri
   9-6 / Sat 10-4 / Sun closed). Everything in it is editable later through
   `/admin/settings` — no need to hand-edit the seed before running it, unless
   pre-filling saves the client a step.

## 2. Local environment

1. Clone the repo, `npm install`.
2. Copy `.env.local.example` → `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<from step 1.2>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from step 1.2>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   `NEXT_PUBLIC_SITE_URL` is used to build the absolute `/rate/[token]` review link
   sent to customers over WhatsApp — it **must** be updated to the real production
   URL before going live (step 4.5).
3. `npm run dev`, confirm `/` loads real (seeded or empty) data and `/admin/login`
   signs in with the admin user created in step 1.5.
4. Log into `/admin` yourself once and walk every settings screen — this is faster
   and safer than hand-editing SQL:
   - **Site Settings**: salon name, tagline, contact info, WhatsApp number (digits
     only, no `+` or leading `0` — see the field's own helper text), address,
     working hours, social links, brand accent color.
   - **Services**: enter the client's real service list (delete the seed data if
     you ran it).
   - **Staff**: add real stylists — name, role, photo, weekly schedule, which
     services they perform (with any price overrides).
   - **Gallery** / **Hero**: upload real photos.
5. Run `npx tsc --noEmit` and `npx eslint .` — both should be clean before
   deploying.

## 3. Cloudflare / OpenNext deployment

1. In `wrangler.jsonc`, set `"name"` to the client's own Worker name (currently
   `"salon-booking-app"` — this becomes part of the default
   `<name>.<account>.workers.dev` URL, so pick something client-appropriate before
   first deploy if that default URL will be user-facing).
2. **`compatibility_date` gotcha**: keep it a real past date (the template ships
   `"2024-09-23"`). Do not "helpfully" bump it to today's date without checking —
   a compatibility date that is in the future relative to the installed `wrangler`
   version's release fails with "Compatibility date is in the future and
   unsupported." This bit the original build once; there's no reason to change it
   at all unless a specific newer Workers runtime feature is needed.
3. Cloudflare Workers env vars (**Cloudflare Dashboard → your Worker → Settings →
   Variables**, or via `wrangler secret put` / `.dev.vars` for local `wrangler
   dev`): the same three `NEXT_PUBLIC_*` values from `.env.local`, with
   `NEXT_PUBLIC_SITE_URL` set to the **real production URL** this time (the custom
   domain if one exists, otherwise the `workers.dev` URL).
4. Build and deploy:
   ```
   npm run deploy
   ```
   (runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`). For a
   local production-mode preview first: `npm run preview`.
5. Confirm live: visit the deployed URL, confirm the homepage loads real Supabase
   data, `/admin/login` works, and `/admin` correctly redirects to login when
   signed out.
6. If using a custom domain: attach it in the Cloudflare dashboard, then update
   `NEXT_PUBLIC_SITE_URL` to match and redeploy (this value only affects the
   `/rate/[token]` link text sent over WhatsApp — nothing else depends on it).

## 4. Pre-launch checklist

- [ ] Real services entered (seed data removed if it was used)
- [ ] Real staff entered with correct weekly schedules and service pricing
- [ ] Site Settings fully filled in with the client's real info, including a brand
      accent color that has readable contrast (the live preview shows this)
- [ ] Real gallery photos uploaded
- [ ] Hero slideshow has at least one real image (falls back to a plain gradient
      otherwise — fine as an interim state, not a great first impression)
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real production URL (affects the review
      link text sent over WhatsApp)
- [ ] WhatsApp number in Site Settings is the client's real number, digits only
- [ ] One real end-to-end test booking submitted, confirming the WhatsApp redirect
      message is correct
- [ ] One test review submitted via a real booking's `/rate/[token]` link,
      confirming it appears on that stylist's Team card
- [ ] Toggle EN ⇄ AR on both the public site and `/admin` — confirm real content
      (not tofu boxes, not English leaking through) in both directions, on mobile
      and desktop
- [ ] `npx tsc --noEmit` and `npx eslint .` both clean on the exact commit being
      deployed

## Troubleshooting notes

- **ESLint reporting tens of thousands of errors in `.open-next/*`**: that
  directory is Cloudflare build output (bundled Next.js/OpenNext internals), not
  source — confirm `eslint.config.mjs`'s `ignores` array includes `.open-next/**`,
  `.wrangler/**`, `cloudflare-env.d.ts`.
- **A dev-server error that clears after restarting**: stale webpack manifests or
  a bad RSC-bundle reference after heavy hot-reload sessions look like a real bug
  but usually aren't — clear `.next/` and restart before assuming it's a code
  issue.
- **A screenshot/browser-preview tool showing stale content after a locale
  toggle**: re-check with a DOM query (`document.documentElement.dir/lang`) or
  `get_page_text` rather than trusting a single screenshot — this template's own
  build process hit this exact false alarm more than once.
