import {
  GRAND_SLAMS,
  OLYMPICS_YEARS,
  ROUND_SEQUENCE,
  ROUNDS_SINGLES,
  ROUNDS_DOUBLES,
  ROUNDS_MIXED,
  SINGLES_DID_NOT_PLAY,
  SINGLES_NOT_HELD,
  DOUBLES_DID_NOT_PLAY,
  DOUBLES_NOT_HELD,
  MIXED_DID_NOT_PLAY,
  MIXED_NOT_HELD,
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

  const dnpMap  = discipline === 'Singles' ? SINGLES_DID_NOT_PLAY
                : discipline === 'Doubles' ? DOUBLES_DID_NOT_PLAY
                : MIXED_DID_NOT_PLAY

  const nhMap   = discipline === 'Singles' ? SINGLES_NOT_HELD
                : discipline === 'Doubles' ? DOUBLES_NOT_HELD
                : MIXED_NOT_HELD

  if (nhMap[tournament]?.has(y))  return 'not-held'
  if (dnpMap[tournament]?.has(y)) return 'did-not-play'
  return 'played'
}

// Returns number of rounds played (0 if absent, not-held, or no-event)
export function getRoundsForSlot(tournament, year, discipline) {
  if (getSlotStatus(tournament, year, discipline) !== 'played') return 0

  const roundsMap = discipline === 'Singles' ? ROUNDS_SINGLES
                  : discipline === 'Doubles' ? ROUNDS_DOUBLES
                  : ROUNDS_MIXED

  return roundsMap[tournament]?.[Number(year)] ?? 0
}

// Returns round labels for the rounds she actually played, e.g. ['R1','R2','R3','R4','QF']
// Used to populate the admin form round picker for a specific slot
export function getValidRounds(tournament, year, discipline) {
  const n = getRoundsForSlot(tournament, year, discipline)
  return ROUND_SEQUENCE.slice(0, n)
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
  if (SINGLES_NOT_HELD[tournament]?.has(Number(year))) return 'not-held'

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
  return slots
}
