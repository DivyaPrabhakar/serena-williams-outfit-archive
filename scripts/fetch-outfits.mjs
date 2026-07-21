// Build-time data snapshot for static generation.
//
// vite-react-ssg needs the outfit list available synchronously at build time so
// it can enumerate every per-outfit / per-tournament URL and render real HTML for
// each. This script pulls the current rows from Supabase and writes them to
// src/generated/outfits.json, which the pages import for the server render + first
// paint. At runtime the client still refetches live data via fetchOutfits(), so
// end-users always see the latest — only the pre-rendered snapshot lags until the
// next build (a Netlify build hook keeps it fresh; see netlify/functions/outfits.js).
//
// Resilient by design: if credentials are missing or the fetch fails, we keep any
// existing snapshot (or write an empty list) rather than breaking the build.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_FILE = resolve(__dirname, '../src/generated/outfits.json')

// Load VITE_SUPABASE_* from .env.local when present (local dev). On Netlify the
// vars are already in process.env, so this is a best-effort convenience only.
function loadDotEnvLocal() {
  const envPath = resolve(__dirname, '../.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
}

function writeSnapshot(rows) {
  mkdirSync(dirname(OUT_FILE), { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(rows, null, 0) + '\n')
}

function keepExistingOrEmpty(reason) {
  if (existsSync(OUT_FILE)) {
    console.warn(`[fetch-outfits] ${reason} — keeping existing snapshot.`)
    return
  }
  console.warn(`[fetch-outfits] ${reason} — writing empty snapshot.`)
  writeSnapshot([])
}

async function main() {
  loadDotEnvLocal()
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_KEY
  if (!url || !key) {
    keepExistingOrEmpty('VITE_SUPABASE_URL / VITE_SUPABASE_KEY not set')
    return
  }
  try {
    const res = await fetch(`${url}/rest/v1/outfits?select=*&order=year.asc,created_at.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!res.ok) {
      keepExistingOrEmpty(`Supabase responded ${res.status}`)
      return
    }
    const rows = await res.json()
    if (!Array.isArray(rows)) {
      keepExistingOrEmpty('Unexpected Supabase response shape')
      return
    }
    writeSnapshot(rows)
    console.log(`[fetch-outfits] wrote ${rows.length} rows to src/generated/outfits.json`)
  } catch (err) {
    keepExistingOrEmpty(`fetch failed: ${err.message}`)
  }
}

main()
