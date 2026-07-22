import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
// Static import so esbuild inlines the outfits JSON when Vite loads this config
// (a runtime dynamic import would hit Node's JSON import-assertion requirement).
import { allOutfitPaths, allTournamentYearPaths, allTournamentHubPaths } from './src/lib/slugs.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Absolute origin for sitemap/robots. Override with VITE_SITE_URL in Netlify env.
// Keep this fallback in sync with SITE_URL in src/lib/seo.jsx.
const SITE_URL = (
  process.env.VITE_SITE_URL || 'https://serena-williams-fitdex.com'
).replace(/\/$/, '')

// Concrete paths to statically pre-render (dynamic route params can't be crawled
// automatically). /admin is intentionally excluded — it stays client-only.
function ssgPaths() {
  return [
    '/',
    '/about',
    '/methodology',
    ...allTournamentHubPaths(),
    ...allTournamentYearPaths(),
    ...allOutfitPaths(),
  ]
}

// AI crawlers/assistants we explicitly welcome (in addition to `User-agent: *`).
// Each still re-states `Disallow: /admin` since a named block overrides `*`.
const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
  'Bingbot',
]

function writeSeoFiles() {
  const urls = ssgPaths()
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n') +
    `\n</urlset>\n`
  writeFileSync(resolve(__dirname, 'dist/sitemap.xml'), sitemap)

  const robots =
    `User-agent: *\nAllow: /\nDisallow: /admin\n\n` +
    AI_BOTS.map(
      (bot) => `User-agent: ${bot}\nAllow: /\nDisallow: /admin\n`,
    ).join('\n') +
    `\nSitemap: ${SITE_URL}/sitemap.xml\n`
  writeFileSync(resolve(__dirname, 'dist/robots.txt'), robots)

  // llms.txt convention: H1 title, one-line blockquote summary, H2 sections of
  // descriptive links. Links use SITE_URL so they point at real pages, not root.
  const llms =
    `# Serena Williams Fit-dex\n\n` +
    `> A Pokédex-style catalog of every on-court outfit Serena Williams has ` +
    `worn — browsable tournament by tournament and round by round, from 1995 ` +
    `to today.\n\n` +
    `## Key pages\n` +
    `- [Archive catalog (tournament & era index)](${SITE_URL}/): the full ` +
    `filterable gallery of outfits, grouped by tournament, year, discipline, ` +
    `and round.\n` +
    `- [About the archive / methodology](${SITE_URL}/methodology): how the ` +
    `found/unfound cataloging works and how Getty images are embedded ` +
    `compliantly.\n` +
    `- [About & credits](${SITE_URL}/about): the story behind the project and ` +
    `creator.\n\n` +
    `## Full index\n` +
    `- [Sitemap](${SITE_URL}/sitemap.xml): every individual tournament-year ` +
    `index page and outfit page in the archive.\n\n` +
    `## Optional\n` +
    `<!-- Archive stats page — add once the stats page ships:\n` +
    `- [Archive stats](${SITE_URL}/stats): live found/unfound counts and ` +
    `coverage. -->\n`
  writeFileSync(resolve(__dirname, 'dist/llms.txt'), llms)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  ssgOptions: {
    includedRoutes: () => ssgPaths(),
    onFinished: () => writeSeoFiles(),
  },
})
