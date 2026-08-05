# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Serena Williams Fit-dex" — a gallery cataloguing every Serena Williams tournament outfit, organized
by year, tournament, discipline, and round. React + Vite (via `vite-react-ssg`, statically
pre-rendered), Supabase (data), Cloudinary (images), Netlify (hosting + serverless functions).

## Commands

```
npm install
npm run dev       # vite dev server at localhost:5173 — viewer at /, admin at /admin
npm run lint       # eslint .
npm run build      # prebuild (fetch-outfits snapshot) + vite-react-ssg build -> dist/
npm run preview
npm run snapshot   # node scripts/fetch-outfits.mjs — refresh src/generated/outfits.json manually
```

There is no test suite in this repo. Local dev needs `.env.local` (copy from `.env.example`) with
`VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY`; the admin panel's Cloudinary upload additionally needs
`cl_cloud` / `cl_preset` set in browser `localStorage` (see README "Cloudinary setup").

## Architecture

**Static-first, live-admin.** The public site is fully prerendered by `vite-react-ssg`
(`vite.config.js` → `ssgOptions.includedRoutes`) using a build-time snapshot
(`src/generated/outfits.json`, written by `scripts/fetch-outfits.mjs`/`prebuild`). At runtime the
client still refetches live data via `fetchOutfits()` (`src/lib/api.js`), so visitors always see
current data even though the prerendered HTML lags until the next build. `/admin` is deliberately
excluded from prerendering (client-only, noindex) and is rewritten to the SPA shell by a
`netlify.toml` redirect.

**Routes are data**, not JSX-in-a-router: `src/routes.jsx` exports a plain route tree consumed by
`vite-react-ssg`, which owns the router. Route ordering matters — static routes (`/about`,
`/admin`, `/404`) must precede the `:tournamentHub` single-segment param, and are listed before it
for that reason.

**URLs are derived, not stored.** There's no slug column in the database — `src/lib/slugs.js`
computes stable tournament/outfit slugs from the build snapshot (`src/lib/snapshot.js`) alone,
including deterministic `-2`/`-3` suffixes for path collisions (duplicate rows, null rounds).
`vite.config.js` imports this module directly (not dynamically) specifically so esbuild can inline
the JSON snapshot into the Vite config at load time.

**All Supabase credentials are split across three trust tiers:**
- Browser (`src/lib/supabase.js`, build snapshot script): anon key only (`VITE_SUPABASE_KEY`) —
  safe to expose; access is gated by RLS, not secrecy.
- Netlify function (`netlify/functions/outfits.js`): holds `SUPABASE_SERVICE_KEY` (service role,
  bypasses RLS) server-side only, used for every write. The browser never sees it.
- Admin auth is a single shared password (`VITE_SUPABASE_ADMIN_TOKEN`), entered at `/admin` login,
  kept only in React state for the session, and sent as the `x-admin-token` header — validated
  against the function's env var, not baked into the client bundle.

**Rebuilds are batched, not per-write.** Writes through `outfits.js` don't trigger a Netlify build
directly — they bump a `pending_count` on a single-row `build_state` table (`recordChange`). A
scheduled function (`netlify/functions/rebuild-scheduler.js`, hourly cron) atomically claims
pending changes and fires the Netlify build hook only if something is actually pending, so a whole
cataloguing session produces one rebuild instead of one per edit. The admin panel can also force an
immediate rebuild ("Rebuild now") or auto-flush on tab close (`ifPending`, via `sendBeacon`-style
`keepalive` fetch) — see `RebuildStatusPanel` / `triggerRebuildOnUnload` in `src/lib/api.js`.

**SEO/crawler output is generated at build time**, not stored as static files in the repo:
`vite.config.js`'s `writeSeoFiles()` (run from `ssgOptions.onFinished`) writes `dist/sitemap.xml`,
`dist/robots.txt` (with explicit allow-rules for named AI crawlers alongside `User-agent: *`), and
`dist/llms.txt` after the SSG pass, and normalizes the prerendered 404 output to `dist/404.html` so
the `netlify.toml` catch-all redirect always has a target to serve.

**Netlify redirect order is load-bearing** (`netlify.toml`): canonical-domain 301 → `/admin` SPA
rewrite → catch-all 404, in that exact order, because Netlify stops at the first match and a
prerendered route wins over a redirect only if it comes first.