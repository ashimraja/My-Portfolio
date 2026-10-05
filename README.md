# Portfolio — React + Vite + TypeScript + Tailwind + Framer Motion

```
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Editing content

Two ways, both feed the same shape of data (`src/types/index.ts → SiteContent`):

1. **Cloud dashboard (recommended)** — open `/admin`, sign in, edit text and images, press **Save**. Changes show on the live site on the next page load, no redeploy.
2. **Code defaults** — `src/data/*`. These are the fallback when the cloud isn’t configured/reachable and the starting point for the dashboard.

### One-time cloud setup (free Supabase)

1. Create a project at supabase.com. Copy the **Project URL** and **anon public key** (Project Settings → API).
2. SQL Editor → paste `supabase/schema.sql` (replace every `you@example.com` with your admin email) → Run.
3. Authentication → Users → **Add user** (your email + a password). Then Authentication → Sign In / Providers → turn **off** “Allow new users to sign up”.
4. Copy `.env.example` → `.env` and fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Add the same two variables to your host (e.g. Vercel → Settings → Environment Variables) and redeploy.
5. Open `/admin`, sign in, press **Publish all content** once. Done.

Security: the anon key is public by design. Only the admin email can write (row-level security in `schema.sql`); everyone can read content and insert contact messages.

## Project layout

- `src/content/` — loads cloud content (plain `fetch`, cached in localStorage) and merges it over the defaults.
- `src/admin/` + `src/pages/Admin/` — the dashboard (lazy-loaded; the Supabase SDK is not in the public bundle). Forms are generated from `src/admin/schema.ts`: add a field there and it appears in the dashboard.
- Contact form → `messages` table → dashboard “Messages”.
- Images uploaded in the dashboard are shrunk to WebP in the browser and stored in the public `portfolio` bucket.

## Contact form email

Each message is (1) saved to the `messages` table (dashboard → Messages) and (2) emailed through Formspree. The Formspree form URL is a content field: dashboard → Contact & footer → “Email form endpoint”.
