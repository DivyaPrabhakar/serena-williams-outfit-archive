# Serena — The Looks

A gallery of Serena Williams' on-court outfits, with an admin panel for uploading and curating looks.

---

## Hosting (free on Netlify)

### 1. Push this folder to a GitHub repo

```bash
git init
git add .
git commit -m "initial commit"
# create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up (free)
2. Click **"Add new site" → "Import an existing project"**
3. Connect your GitHub account and select your repo
4. Build settings will be auto-detected from `netlify.toml`

### 3. Set your admin password (the important part)

1. In your Netlify site dashboard, go to **Site configuration → Environment variables**
2. Click **"Add a variable"**
3. Key: `ADMIN_PASSWORD`
4. Value: your chosen password (e.g. `my-secret-password-123`)
5. Click **Save**

### 4. Trigger a deploy

Go to **Deploys → Trigger deploy → Deploy site**. Netlify runs `inject-password.sh`, which reads your env var and bakes it into the HTML at build time. The password never appears in your code or git history.

---

## Image uploads (Cloudinary — free tier)

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings → Upload → Upload presets → Add upload preset**
3. Set signing mode to **Unsigned**, save it
4. In the gallery admin panel → Data & Cloudinary: enter your **Cloud name** and **Upload preset name**

Your Cloudinary credentials are saved in the browser's localStorage on your device — not in the code.

---

## Changing your password

1. Go to Netlify → Site configuration → Environment variables
2. Update `ADMIN_PASSWORD`
3. Trigger a new deploy

That's it. The password never touches your code.
