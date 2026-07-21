import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
// Static import so esbuild inlines the outfits JSON when Vite loads this config
// (a runtime dynamic import would hit Node's JSON import-assertion requirement).
import { allOutfitPaths, allTournamentYearPaths } from './src/lib/slugs.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Absolute origin for sitemap/robots. Override with VITE_SITE_URL in Netlify env.
// Keep this fallback in sync with SITE_URL in src/lib/seo.jsx.
const SITE_URL = (
  process.env.VITE_SITE_URL || 'https://serena-williams-fitdex.com'
).replace(/\/$/, '')

// Concrete paths to statically pre-render (dynamic route params can't be crawled
// automatically). /admin is intentionally excluded — it stays client-only.
function ssgPaths() {
  return ['/', '/about', ...allTournamentYearPaths(), ...allOutfitPaths()]
}

function writeSitemapAndRobots() {
  const urls = ssgPaths()
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n') +
    `\n</urlset>\n`
  writeFileSync(resolve(__dirname, 'dist/sitemap.xml'), sitemap)

  const robots =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /admin\n` +
    `\nSitemap: ${SITE_URL}/sitemap.xml\n`
  writeFileSync(resolve(__dirname, 'dist/robots.txt'), robots)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  ssgOptions: {
    includedRoutes: () => ssgPaths(),
    onFinished: () => writeSitemapAndRobots(),
  },
})
