import { useMemo, useRef } from 'react'
import { ACTIVE_YEARS, DISCIPLINES } from '../lib/constants'
import {
  getRoundsForSlot,
  getRoundLabel,
  getCombinedSlotStatus,
  slotsForYear,
} from '../lib/rounds'

export function useMissingOutfits(outfits, mode) {
  const highlightTimerRef = useRef(null)

  const condensedMissing = useMemo(() => {
    if (!outfits.length) return []
    const outfitKeys = new Set(outfits.map(o => `${o.year}_${o.tournament}`))
    const items = []
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        if (
          !outfitKeys.has(`${year}_${tournament}`) &&
          getCombinedSlotStatus(tournament, year) === 'played'
        ) {
          items.push({ year, tournament })
        }
      }
    }
    return items
  }, [outfits])

  const expandedMissing = useMemo(() => {
    if (!outfits.length) return []
    const outfitKeys = new Set(
      outfits.map(o => `${o.year}_${o.tournament}_${o.discipline}_${o.roundNumber}`),
    )
    const items = []
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        for (const discipline of DISCIPLINES) {
          const rounds = getRoundsForSlot(tournament, year, discipline)
          for (let r = 1; r <= rounds; r++) {
            if (!outfitKeys.has(`${year}_${tournament}_${discipline}_${r}`)) {
              items.push({ year, tournament, discipline, roundNumber: r, round: getRoundLabel(r) })
            }
          }
        }
      }
    }
    return items
  }, [outfits])

  const missingCount = mode === 'condensed' ? condensedMissing.length : expandedMissing.length

  function handleHighlight(item) {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)

    document
      .querySelectorAll('.slot-highlight')
      .forEach(el => el.classList.remove('slot-highlight'))

    const id = item.roundNumber
      ? `slot-${item.year}-${item.tournament}-${item.discipline}-${item.roundNumber}`
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

  return { condensedMissing, expandedMissing, missingCount, handleHighlight }
}
