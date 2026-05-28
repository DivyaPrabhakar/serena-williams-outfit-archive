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
