# Serena — The Looks

A gallery of Serena Williams' on-court outfits with an admin panel for curating looks. Powered by Supabase (database) and Cloudinary (image hosting). Hosted free on Netlify.

---

## Architecture

- **Frontend**: Single `index.html` static file
- **Database**: Supabase (Postgres) — all credentials are server-side only
- **API**: Netlify serverless function (`netlify/functions/outfits.js`) — proxies all database calls, credentials never reach the browser
- **Images**: Cloudinary free tier

---

## Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/serena-gallery.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitHub
2. Select your repo
3. Build settings are auto-detected from `netlify.toml`

### 3. Set environment variables

In Netlify: **Site configuration → Environment variables** — add all four:

| Key | Value | Secret? |
|-----|-------|---------|
| `ADMIN_PASSWORD` | Your chosen admin password | ✅ Yes |
| `SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `SUPABASE_KEY` | Your Supabase anon key | ✅ Yes |
| `SUPABASE_ADMIN_TOKEN` | Your secret write token | ✅ Yes |

Mark all four as **Secret** in Netlify.

### 4. Deploy

Go to **Deploys → Trigger deploy → Deploy site**.

The build injects only `ADMIN_PASSWORD` into the HTML.
All Supabase credentials stay server-side in the Netlify function — they never appear in any file or in the browser.

---

## Changing your password or rotating credentials

Update the value in Netlify → Environment variables, then trigger a new deploy.

---

## Image uploads (Cloudinary)

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Settings → Upload → Add upload preset → set to **Unsigned**
3. In the gallery admin panel → Data & Cloudinary: enter your Cloud name and preset name

Cloudinary credentials are saved in the browser's localStorage on your device only.
