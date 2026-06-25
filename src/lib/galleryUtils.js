import { GRAND_SLAMS, NON_SLAM_ROUNDS_SINGLES, NON_SLAM_ROUNDS_DOUBLES } from './constants'

export const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }
export const SLAM_TOURNAMENTS = new Set([...GRAND_SLAMS, 'Olympics'])

// Build a DOM-safe, stable anchor id for a gallery group section so the left
// jump-nav can register it and scroll to it.
export function groupNavId(prefix, key) {
  const safe = String(key).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${prefix}-${safe || 'none'}`
}

export function isKnownForYear(tournament, year) {
  if (SLAM_TOURNAMENTS.has(tournament)) return true
  const y = Number(year)
  return (NON_SLAM_ROUNDS_SINGLES[tournament]?.[y] != null) ||
         (NON_SLAM_ROUNDS_DOUBLES[tournament]?.[y] != null)
}
