// Absolute origin for canonical / OG / sitemap URLs. Override per-environment with
// VITE_SITE_URL (Netlify env). Keep the fallback in sync with vite.config.js.
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://serena-williams-fitdex.com'
).replace(/\/$/, '')

export const absoluteUrl = (path = '/') =>
  SITE_URL + (path.startsWith('/') ? path : `/${path}`)
