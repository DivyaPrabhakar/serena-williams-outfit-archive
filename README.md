# Serena Williams Fit-dex

A gallery cataloguing every Serena Williams tournament outfit, organized by year, tournament, discipline, and round. Built with React + Vite, Supabase, Cloudinary, and deployed on Netlify.

---

## Local dev setup

**1. Install dependencies**

```bash
npm install
```

**2. Set up environment variables**

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your Supabase credentials and admin token (see comments in the file). Never commit `.env.local` — it is gitignored.

**3. Start the dev server**

```bash
npm run dev
```

The app runs at `http://localhost:5173`. The gallery viewer is at `/` and the admin panel is at `/admin`.

> **Note:** The admin panel's image upload requires Cloudinary credentials stored in `localStorage`. See [Cloudinary setup](#cloudinary-setup) below.

---

## Deployment (Netlify)

**1. Connect the repo**

In the Netlify dashboard, create a new site from your Git repository. Netlify will auto-detect the build settings from `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`

**2. Add environment variables**

In **Site settings → Environment variables**, add the following (mark all as **secret**):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_KEY` | Your Supabase anon (public) key |
| `VITE_SUPABASE_ADMIN_TOKEN` | Admin password — must match your Supabase RLS policy |

> `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are baked into the client bundle at build time. The Supabase anon key is safe to expose — access is controlled by Row Level Security policies on the database, not by keeping the key secret.
>
> `VITE_SUPABASE_ADMIN_TOKEN` is **not** baked into the bundle. It is entered by the admin at login, held in React state for that session only, and sent as a request header to write operations where it is validated server-side.

**3. Deploy**

Trigger a deploy from the Netlify dashboard, or push to your main branch if continuous deployment is enabled.

The `[[redirects]]` rule in `netlify.toml` ensures React Router's client-side routes (e.g. `/admin`) work correctly after a hard refresh.

---

## Changing the admin password

The admin password is the value of `VITE_SUPABASE_ADMIN_TOKEN`. To rotate it:

1. **Generate a new token** — `openssl rand -base64 32`
2. **Update Netlify** — In Site settings → Environment variables, update `VITE_SUPABASE_ADMIN_TOKEN` to the new value.
3. **Update Supabase RLS** — In your Supabase project, go to Table Editor → `outfits` → RLS policies and update the policy that checks the admin token to use the new value.
4. **Redeploy** — Trigger a new deploy in Netlify so the updated env var is available to the Netlify function.

---

## Cloudinary setup

Images are uploaded to Cloudinary via an unsigned upload preset. Credentials are stored in `localStorage` on the admin's browser (not in env vars or the bundle).

**Steps:**

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. In the Cloudinary dashboard, go to **Settings → Upload → Upload presets** and click **Add upload preset**.
   - Set **Signing mode** to `Unsigned`.
   - Configure any folder, transformations, or restrictions you want.
   - Save and note the **Preset name**.
3. Note your **Cloud name** from the dashboard home page.
4. In your browser, open the Fit-dex admin panel (`/admin`), open the browser console, and run:

```js
localStorage.setItem('cl_cloud', 'your-cloud-name')
localStorage.setItem('cl_preset', 'your-unsigned-preset-name')
```

5. Reload the page. The image upload widget in the Add Outfit form will now work.

These values are stored only in your browser's `localStorage` and are never sent to any server other than Cloudinary's upload API.
