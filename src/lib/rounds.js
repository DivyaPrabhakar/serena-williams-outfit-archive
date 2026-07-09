import {
  GRAND_SLAMS,
  OLYMPICS_YEARS,
  ROUND_SEQUENCE,
  DISCIPLINE_DATA,
  NON_SLAM_ROUNDS_SINGLES,
  NON_SLAM_ROUNDS_DOUBLES,
} from './constants'

// ── Round label ↔ number conversions ─────────────────────────────────────

export function getRoundLabel(roundNumber) {
  return ROUND_SEQUENCE[roundNumber - 1] ?? null
}

export function getRoundNumber(roundLabel) {
  const n = ROUND_SEQUENCE.indexOf(roundLabel)
  return n === -1 ? null : n + 1
}

// ── Per-slot helpers ──────────────────────────────────────────────────────

// Returns 'played' | 'did-not-play' | 'not-held' | 'no-event'
export function getSlotStatus(tournament, year, discipline) {
  const y = Number(year)

  // Mixed was never offered at the Olympics
  if (discipline === 'Mixed' && tournament === 'Olympics') return 'no-event'

  const data = DISCIPLINE_DATA[discipline]
  if (data.notHeld[tournament]?.has(y))    return 'not-held'
  if (data.didNotPlay[tournament]?.has(y)) return 'did-not-play'
  return 'played'
}

// Returns number of rounds played (0 if absent, not-held, or no-event)
export function getRoundsForSlot(tournament, year, discipline) {
  if (getSlotStatus(tournament, year, discipline) !== 'played') return 0

  const y = Number(year)
  const data = DISCIPLINE_DATA[discipline]

  const explicit = data.nonSlamExplicit?.[tournament]?.[y]
  if (explicit) return explicit.length

  return data.rounds[tournament]?.[y] ?? data.nonSlamRounds?.[tournament]?.[y] ?? 0
}

// Returns the 1-based ROUND_SEQUENCE indices for each round to display.
// Handles non-contiguous draws (e.g. 96-draw with no R4, or seeded bye in R1).
export function getRoundNumbers(tournament, year, discipline) {
  const explicit = DISCIPLINE_DATA[discipline].nonSlamExplicit?.[tournament]?.[Number(year)]
  if (explicit) return explicit

  const n = getRoundsForSlot(tournament, year, discipline)
  return Array.from({ length: n }, (_, i) => i + 1)
}

// Returns round labels for the rounds she actually played, e.g. ['R1','R2','R3','R4','QF']
// Used to populate the admin form round picker for a specific slot
export function getValidRounds(tournament, year, discipline) {
  return getRoundNumbers(tournament, year, discipline).map(n => ROUND_SEQUENCE[n - 1])
}

// ── Combined (all-discipline) slot status ─────────────────────────────────

// Returns 'played' | 'did-not-play' | 'not-held'
// 'played'       — she competed in at least one discipline
// 'not-held'     — the event itself was cancelled (Wimbledon 2020)
// 'did-not-play' — event was held but she entered no discipline
export function getCombinedSlotStatus(tournament, year) {
  // Event-level cancellation — use singles as the authoritative source
  // (Doubles NOT_HELD for Olympics covers non-Olympic years, which is a
  //  different kind of "not held" and not relevant here)
  if (DISCIPLINE_DATA.Singles.notHeld[tournament]?.has(Number(year))) return 'not-held'

  for (const discipline of ['Singles', 'Doubles', 'Mixed']) {
    if (getSlotStatus(tournament, year, discipline) === 'played') return 'played'
  }

  return 'did-not-play'
}

// ── Year slot list ────────────────────────────────────────────────────────

// Returns the tournaments to show for a given year
export function slotsForYear(year) {
  const slots = [...GRAND_SLAMS]
  if (OLYMPICS_YEARS.has(Number(year))) slots.push('Olympics')
  const y = Number(year)
  const nonSlamTournaments = new Set([
    ...Object.keys(NON_SLAM_ROUNDS_SINGLES),
    ...Object.keys(NON_SLAM_ROUNDS_DOUBLES),
  ])
  for (const t of nonSlamTournaments) {
    if ((NON_SLAM_ROUNDS_SINGLES[t]?.[y] ?? 0) > 0 || (NON_SLAM_ROUNDS_DOUBLES[t]?.[y] ?? 0) > 0) {
      slots.push(t)
    }
  }
  return slots
}
