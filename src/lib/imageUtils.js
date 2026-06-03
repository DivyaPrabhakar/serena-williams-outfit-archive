export const BLOCKED_DOMAINS = [
  'facebook.com', 'fb.com', 'fbcdn.net',
  'instagram.com', 'cdninstagram.com', 'instagr.am',
]

export function isBlockedUrl(url) {
  try {
    const host = new URL(url).hostname
    return BLOCKED_DOMAINS.some(d => host === d || host.endsWith('.' + d))
  } catch {
    return false
  }
}

export function isGettyEmbed(val) {
  return typeof val === 'string' && val.trimStart().startsWith('<') && val.includes('gettyimages')
}

export function isGettyLandscape(embedCode) {
  const w = embedCode.match(/w:'(\d+)px'/)
  const h = embedCode.match(/h:'(\d+)px'/)
  return w && h && parseInt(w[1]) > parseInt(h[1])
}

// The single canonical Getty CMS loader (kept out of stored data; re-added at render).
const GETTY_LOADER =
  "<script src='//embed.gettyimages.com/embed-cms.js' charset='utf-8' async></script>"

// Strip ONLY the external embed-cms.js loader; keep the <a> anchor and the inline
// gie.widgets.load config (needed by isGettyEmbed / isGettyLandscape / the admin
// "asset #N" hint). Leaves non-Getty values untouched.
export function normalizeGettyEmbed(val) {
  if (!isGettyEmbed(val)) return val
  return val
    .replace(/<script[^>]*\bsrc=['"]\/\/embed\.gettyimages\.com\/embed-cms\.js['"][^>]*>\s*<\/script>/gi, '')
    .trim()
}

// Build the iframe body content: clean embed + exactly one loader. Safe for both
// already-normalized rows and legacy rows that still contain the loader.
export function gettyEmbedForIframe(val) {
  return normalizeGettyEmbed(val) + GETTY_LOADER
}
