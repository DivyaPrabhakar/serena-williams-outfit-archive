import { DISCIPLINES, GRAND_SLAMS, NON_SLAM_ROUNDS_SINGLES, NON_SLAM_ROUNDS_DOUBLES } from './constants'

export const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }
export const SLAM_TOURNAMENTS = new Set([...GRAND_SLAMS, 'Olympics'])

// Canonical outfit order within a tournament/year: by discipline, then round.
// Shared so every gallery page lists outfits the same way.
export function sortByDisciplineRound(outfits) {
  return [...outfits].sort((a, b) => {
    const da = DISCIPLINES.indexOf(a.discipline)
    const db = DISCIPLINES.indexOf(b.discipline)
    if (da !== db) return da - db
    return (a.roundNumber ?? 0) - (b.roundNumber ?? 0)
  })
}

// First real photograph URL for OG/social images — Getty embeds are stored as HTML
// blobs (starting with '<') and can't be used as an image URL, so skip them.
export function firstPhotoUrl(outfits) {
  return outfits.find((o) => o.imageUrl && !o.imageUrl.trimStart().startsWith('<'))?.imageUrl
}

// Build a DOM-safe, stable anchor id for a gallery group section so the left
// jump-nav can register it and scroll to it.
export function groupNavId(prefix, key) {
  const safe = String(key).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${prefix}-${safe || 'none'}`
}

// Year-heading subtitle, e.g. "3 outfits · 2 of 4 majors". The majors stat is
// only shown when more than one tournament is in view and at least one is a slam.
export function getYearSubtitle(yearOutfits, tournaments) {
  const outfitCount = yearOutfits.length
  const majorsWithOutfits = GRAND_SLAMS.filter(t => yearOutfits.some(o => o.tournament === t)).length
  const showMajorsStat = tournaments.length > 1 && tournaments.some(t => GRAND_SLAMS.includes(t))
  return [
    `${outfitCount} outfit${outfitCount !== 1 ? 's' : ''}`,
    showMajorsStat ? `${majorsWithOutfits} of 4 majors` : null,
  ].filter(Boolean).join(' · ')
}

export function isKnownForYear(tournament, year) {
  if (SLAM_TOURNAMENTS.has(tournament)) return true
  const y = Number(year)
  return (NON_SLAM_ROUNDS_SINGLES[tournament]?.[y] != null) ||
         (NON_SLAM_ROUNDS_DOUBLES[tournament]?.[y] != null)
}
