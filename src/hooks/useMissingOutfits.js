import { useMemo, useRef } from 'react'
import { ACTIVE_YEARS, DISCIPLINES, TOTAL_MATCHES } from '../lib/constants'
import {
  getRoundNumbers,
  getRoundLabel,
  getCombinedSlotStatus,
  slotsForYear,
} from '../lib/rounds'
import {
  slotKey,
  tournamentKey,
  slotDomId,
  distinctSlotCount,
} from '../lib/slots'

export function useMissingOutfits(outfits, mode) {
  const highlightTimerRef = useRef(null)

  const condensedMissing = useMemo(() => {
    const outfitKeys = new Set(outfits.map(o => tournamentKey(o.year, o.tournament)))
    const items = []
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        if (
          !outfitKeys.has(tournamentKey(year, tournament)) &&
          getCombinedSlotStatus(tournament, year) === 'played'
        ) {
          items.push({ year, tournament })
        }
      }
    }
    return items
  }, [outfits])

  const expandedMissing = useMemo(() => {
    const outfitKeys = new Set(
      outfits.map(o => slotKey(o.year, o.tournament, o.discipline, o.roundNumber)),
    )
    const items = []
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        for (const discipline of DISCIPLINES) {
          for (const r of getRoundNumbers(tournament, year, discipline)) {
            if (!outfitKeys.has(slotKey(year, tournament, discipline, r))) {
              items.push({ year, tournament, discipline, roundNumber: r, round: getRoundLabel(r) })
            }
          }
        }
      }
    }
    return items
  }, [outfits])

  const totalCondensed = useMemo(() => {
    let total = 0
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        if (getCombinedSlotStatus(tournament, year) === 'played') total++
      }
    }
    return total
  }, [])

  const totalExpanded = useMemo(() => {
    let total = 0
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        for (const discipline of DISCIPLINES) {
          total += getRoundNumbers(tournament, year, discipline).length
        }
      }
    }
    return total
  }, [])

  const missingCount = mode === 'condensed' ? condensedMissing.length : expandedMissing.length
  const totalCount = mode === 'condensed' ? totalCondensed : totalExpanded

  // Numerator for the progress indicator: unique outfit entries in the fitdex,
  // deduped by slot key (same key format used for expandedMissing above).
  const foundCount = useMemo(() => distinctSlotCount(outfits), [outfits])

  function handleHighlight(item) {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)

    document
      .querySelectorAll('.slot-highlight')
      .forEach(el => el.classList.remove('slot-highlight'))

    const id = item.roundNumber
      ? slotDomId(item.year, item.tournament, item.discipline, item.roundNumber)
      : `slot-${item.year}-${item.tournament}`

    const el     = document.getElementById(id)
    const yearEl = document.getElementById(`year-${item.year}`)

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('slot-highlight')
      highlightTimerRef.current = setTimeout(
        () => el.classList.remove('slot-highlight'),
        2700,
      )
    } else if (yearEl) {
      yearEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return { condensedMissing, expandedMissing, missingCount, foundCount, totalCount, totalMatches: TOTAL_MATCHES, handleHighlight }
}
