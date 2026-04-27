import { ACTIVE_YEARS, OLYMPICS_YEARS, DISCIPLINES, GRAND_SLAMS } from '../../lib/constants'
import { getRoundsForSlot, getCombinedSlotStatus, slotsForYear } from '../../lib/rounds'
import CondensedYearSection from './CondensedYearSection'
import ExpandedYearSection from './ExpandedYearSection'

const KNOWN_TOURNAMENTS = new Set([...GRAND_SLAMS, 'Olympics'])

export default function GalleryGrid({ outfits, activeTournament, activeYear, settings, mode, onOpenLightbox }) {
  const outfitMap = new Map(
    outfits.map(o => [`${o.year}_${o.tournament}_${o.discipline}_${o.roundNumber}`, o])
  )

  let years
  if (activeYear) {
    years = [activeYear]
  } else if (activeTournament) {
    if (KNOWN_TOURNAMENTS.has(activeTournament)) {
      years = ACTIVE_YEARS.filter(y => {
        if (activeTournament === 'Olympics' && !OLYMPICS_YEARS.has(y)) return false
        const played = DISCIPLINES.some(d => getRoundsForSlot(activeTournament, y, d) > 0)
        const notHeld = getCombinedSlotStatus(activeTournament, y) === 'not-held'
        return played || notHeld
      })
    } else {
      years = [...new Set(outfits.filter(o => o.tournament === activeTournament).map(o => o.year))].sort((a, b) => a - b)
    }
  } else {
    years = [...new Set(outfits.map(o => o.year))].sort((a, b) => a - b)
  }

  function tournamentsForYear(year) {
    if (activeTournament) return [activeTournament]
    const known = slotsForYear(year)
    const extra = [...new Set(outfits.filter(o => o.year === year).map(o => o.tournament))]
      .filter(t => !known.includes(t))
      .sort((a, b) => a.localeCompare(b))
    return [...known, ...extra]
  }

  function outfitsForYear(year) {
    return outfits.filter(o =>
      o.year === year && (!activeTournament || o.tournament === activeTournament)
    )
  }

  if (years.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 text-muted text-sm">
        No outfits found
      </div>
    )
  }

  return (
    <div>
      {years.map(year => {
        const props = {
          key: year,
          year,
          outfitMap,
          tournaments: tournamentsForYear(year),
          yearOutfits: outfitsForYear(year),
          settings,
          onOpenLightbox,
        }
        return mode === 'expanded'
          ? <ExpandedYearSection {...props} />
          : <CondensedYearSection {...props} />
      })}
    </div>
  )
}
