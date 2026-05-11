import { GRAND_SLAMS, NON_SLAM_ROUNDS_SINGLES, NON_SLAM_ROUNDS_DOUBLES } from './constants'

export const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }
export const SLAM_TOURNAMENTS = new Set([...GRAND_SLAMS, 'Olympics'])

export function isKnownForYear(tournament, year) {
  if (SLAM_TOURNAMENTS.has(tournament)) return true
  const y = Number(year)
  return (NON_SLAM_ROUNDS_SINGLES[tournament]?.[y] != null) ||
         (NON_SLAM_ROUNDS_DOUBLES[tournament]?.[y] != null)
}
