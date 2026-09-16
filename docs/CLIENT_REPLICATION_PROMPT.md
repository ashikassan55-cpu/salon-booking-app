# Client Replication Prompt

Copy the prompt below, fill in every `<...>` placeholder with the new client's real
details, and paste it as the first message to Claude Code in a **fresh clone of
this template repo** (new Supabase project + new Cloudflare Worker per the
[Deployment & Setup Guide](./DEPLOYMENT_AND_SETUP_GUIDE.md) — never point a second
client at the first client's live Supabase project).

Fill in as much as you actually have; leave a placeholder as `<TBD>` rather than
guessing, and Claude Code will ask you for it rather than inventing a value.

---

## Prompt template

```
You are customizing an existing, fully-built salon/barbershop booking template
for a new client. Read docs/ARCHITECTURE.md and docs/FEATURES_AND_LOGIC.md first
to understand what already exists — this is a CONFIGURATION AND CONTENT task, not
a rebuild. Do not re-architect, do not add new database tables or features unless
I explicitly ask, and do not change the i18n/RTL system, the booking logic, or the
admin panel's structure. If something in this brief implies a feature that isn't
in the existing template, stop and ask me before building it.

## Client
- Business name: <e.g. "The Gentlemen's Quarter">
- Tagline: <short one-liner>
- Business type: <barbershop / salon / spa — confirms which service language fits>
- Timezone: <e.g. Asia/Dubai — confirm if it's a DST-observing timezone, since the
  current fixed-offset date math (src/lib/timezone.ts) assumes it is NOT>
- Contact email: <>
- Contact phone (displayed): <>
- WhatsApp number (bookings + reviews go here — digits only, no + or leading 0): <>
- Physical address: <>
- Instagram URL: <optional>
- Facebook URL: <optional>
- Google Business review URL: <optional — shown to customers after a 4-5 star review>
- Brand accent color (hex): <e.g. #111111 — used for every "Book Now" CTA;
  pick something with enough contrast against white AND black text, since the
  admin auto-computes one or the other>

## Languages
- [ ] English only
- [ ] English + Arabic (full RTL support, already built into this template —
      if selected, all content below should be provided in both languages, or
      tell Claude Code to translate it and you'll review before launch)

## Working hours (per weekday, or say "same every weekday except Friday/Sunday" etc.)
- Sunday: <open/closed, hours>
- Monday: <>
- Tuesday: <>
- Wednesday: <>
- Thursday: <>
- Friday: <>
- Saturday: <>

## Services (name, price, duration in minutes, short description, optional photo)
1. <name> — <price> — <duration> min — <description>
2. ...
(Add as many as needed. Prices in the client's local currency — confirm if this
should stay AED or if src/lib/currency.ts needs a different Intl currency code.)

## Staff (name, role/title, photo, weekly schedule if different from the salon default,
which services they perform, and any per-service price override)
1. <name> — <role> — schedule: <same as salon default, or list exceptions> —
   performs: <service names> — price overrides: <none, or list>
2. ...

## Photos
- Gallery images: <describe what you're providing, or say "I'll upload these
  myself through /admin/gallery once it's live">
- Hero slideshow images: <same — recommended 1920×1080px per the admin uploader's
  own guidance>
- Staff photos: <same>

## Anything explicitly different from the existing template
List anything you know should NOT match the default template behavior (a
different booking flow step, a field that shouldn't be required, extra info
needed at booking time, etc.) — be explicit, since the default assumption is
"behaves exactly like the existing template."

## Deployment
- Supabase project: <new project ref, or "not created yet — set one up">
- Cloudflare Worker name: <client-appropriate name for wrangler.jsonc>
- Custom domain: <if any, or "workers.dev subdomain is fine for now">
- GitHub repo: <link, or "not created yet">

Once you have everything above, walk through docs/DEPLOYMENT_AND_SETUP_GUIDE.md
step by step: apply the migrations to the new Supabase project, seed Site
Settings/Services/Staff either via SQL or by using the real /admin UI yourself
(prefer the UI — it's what the client will use too, so it's the best test of it),
upload photos, then deploy to Cloudflare. Verify a real end-to-end test booking
through to the WhatsApp redirect before calling it done, and run
npx tsc --noEmit / npx eslint . clean before every deploy.
```

---

## Notes for whoever fills this in (not part of the prompt itself)

- **Never mention "demo," "template," or "placeholder" anywhere the end client
  will see it** — that includes the deployed site, admin panel copy, and any
  screenshots shared with them.
- **One Supabase project and one Cloudflare Worker per client, always.** This
  template is the source you clone from, never a shared live backend.
- If the client wants Arabic, budget for a genuine review pass on the Arabic
  wording before real customer traffic — Claude Code will produce natural,
  correct Modern Standard Arabic, but a native-speaker spot-check (the client
  themselves, often) is worth the time before launch.
- If the client's timezone observes DST, flag it explicitly — `src/lib/
  timezone.ts` currently uses a fixed UTC offset (correct for Dubai, which has
  no DST) and would need a real IANA-timezone-aware date library swapped in
  first.
