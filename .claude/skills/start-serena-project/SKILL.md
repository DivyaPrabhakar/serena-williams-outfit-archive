---
name: start-serena-project
description: Start the Serena Williams Fit-dex gallery locally with working data (Netlify Dev, not plain Vite). Use when the user wants to run, start, or resume working on the serena-gallery project locally.
---

This project (`/Users/divyaprabhakar/projects/serena-gallery`) is a React + Vite site. The gallery and admin panel do **not** talk to Supabase directly from the browser — they call a Netlify serverless function at `/.netlify/functions/outfits` (see `src/lib/api.js` and `netlify/functions/outfits.js`), which is the only thing holding the Supabase service-role key and doing reads/writes. That function itself is backed by a **remote/cloud Supabase project** (not a local Supabase stack — there is no `supabase/` CLI folder here, and none should be assumed).

**This means plain `npm run dev` (bare Vite) is NOT enough** — it serves the frontend fine, but any request to `/.netlify/functions/outfits` 404s, and the gallery shows "Failed to load outfits". Always use Netlify Dev instead, which wraps Vite and also runs the functions locally.

## Steps

1. **Dependencies.** Check `node_modules` is present and not stale — this repo has previously had `node_modules` drift out of sync with `package.json` (missing `vite-react-ssg`), which breaks startup with a dependency-resolution error. If it fails complaining a package can't be resolved, run `npm install` and retry.

2. **Env vars.** Confirm `.env.local` exists (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`, `VITE_SUPABASE_ADMIN_TOKEN`, `VITE_GA_MEASUREMENT_ID`). If missing, tell the user to copy `.env.local.example` and fill in credentials — never fabricate values. Netlify Dev auto-injects `.env.local` into both the Vite process and the local functions runtime; no separate `.env` or `netlify link` is needed for this to work unlinked.

3. **Start Netlify Dev in the background**: `cd /Users/divyaprabhakar/projects/serena-gallery && npx netlify dev`. It boots the underlying Vite server on 5173 and then serves everything through its own proxy — **the real URL to use is the one Netlify Dev prints, normally http://localhost:8888/** (viewer) and **http://localhost:8888/admin** (admin panel, requires `VITE_SUPABASE_ADMIN_TOKEN` to log in). Do not tell the user to use :5173 directly — it won't have working data.

4. **Confirm it's actually working**: `curl -s http://localhost:8888/.netlify/functions/outfits | wc -c` should return a large nonzero byte count (real outfit rows as JSON), and the terminal output should show `Loaded function outfits` and a `200` response logged. If you get a 404 or connection refused, Netlify Dev likely isn't up yet or died — check its background output.

5. Report the URL to the user, and mention the admin panel's Cloudinary image-upload needs `localStorage` credentials set once per browser (see README's "Cloudinary setup" section) if they haven't done that before.

## Also useful

`npm run snapshot` (runs `scripts/fetch-outfits.mjs`) independently fetches every outfit row straight from Supabase into `src/generated/outfits.json` — this is what SSG builds use to seed the first paint, and running it is a fast way to sanity-check the Supabase credentials in isolation from Netlify Dev. `npm run build` runs this automatically via its `prebuild` hook.

## What NOT to do

- Don't start plain `npm run dev` / `vite` and call it done — it looks like it's running fine but the gallery will show "Failed to load outfits" the moment the page tries to fetch real data. Always use `netlify dev`.
- Don't install the Supabase CLI, run `supabase init`, or try to start a local Supabase/Docker stack unless the user explicitly asks for a local (non-remote) backend — that's a distinct, bigger ask (Docker must be running, and a fresh local Postgres starts empty; getting the real schema/data into it means pulling from the remote project first).
