# Catalog & Inventory App

Minimal, mobile-first catalog + inventory tool for a single manufacturer/owner:
one admin login to add products and record sales, and one public catalog link
to share in WhatsApp groups. See `docs/PLAN.md`-equivalent context in the
original planning conversation for the full rationale.

## Stack

React + Vite (static site) → GitHub Pages, Supabase (Postgres + Auth + Storage).
No paid services required.

## One-time setup

### 1. Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the files in `supabase/migrations/` **in order**
   (0001, 0002, 0003), then optionally `supabase/seed.sql`.
3. Go to **Authentication → Providers → Email** and turn **off** "Allow new
   users to sign up" — this app has exactly one admin, created manually.
4. Go to **Authentication → Users → Add user** and create the owner's login
   (email + password).
5. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public key**.

### 2. Local environment

Copy `.env.example` to `.env` and fill in the two values from step above:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The anon key is safe to expose in a static frontend — every table is
protected by Row Level Security (see `supabase/migrations/0003_rls_and_grants.sql`).

### 3. Run locally

```
npm install
npm run dev
```

Catalog: `http://localhost:5173/#/`
Admin: `http://localhost:5173/#/admin/login`

### 4. Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Repo **Settings → Secrets and variables → Actions**, add repository
   secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as
   `.env`).
4. Push to `main` — `.github/workflows/deploy.yml` builds and deploys
   automatically. The catalog link to circulate on WhatsApp is the resulting
   `https://<user>.github.io/<repo>/#/` URL.

## Notes

- Product codes (`PREFIX-###`) are generated server-side per product type
  and can never collide, even from two devices at once.
- Stock only ever changes through the `record_sale` database function, so
  quantity can never go negative regardless of how many devices are logged
  in as the admin.
- `price_acquired` (cost price) is never sent to the public catalog — it's
  excluded at the database level via the `products_public` view, not just
  hidden in the UI.
- Product photos are cropped to a fixed aspect ratio and re-encoded as WebP
  in the browser before upload, keeping storage use small even with 1000+
  images.
