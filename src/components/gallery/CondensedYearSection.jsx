import { GRAND_SLAMS } from '../../lib/constants'
import { getCombinedSlotStatus } from '../../lib/rounds'
import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'
import DimSlot from './DimSlot'

const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }
const KNOWN_TOURNAMENTS = new Set([...GRAND_SLAMS, 'Olympics'])

export default function CondensedYearSection({ year, tournaments, yearOutfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const outfitsByTournament = {}
  for (const o of yearOutfits) {
    if (!outfitsByTournament[o.tournament]) outfitsByTournament[o.tournament] = []
    outfitsByTournament[o.tournament].push(o)
  }

  // Build a flat list of slots in tournament order (known grand slams first, then others alphabetically)
  const slots = []
  for (const tournament of tournaments) {
    const tOutfits = outfitsByTournament[tournament] ?? []
    const isKnown = KNOWN_TOURNAMENTS.has(tournament)

    if (tOutfits.length > 0) {
      for (const outfit of tOutfits) {
        slots.push({ type: 'outfit', outfit })
      }
    } else if (isKnown) {
      const status = getCombinedSlotStatus(tournament, year)
      if (status === 'played' && settings.showEmptySlots) {
        slots.push({ type: 'empty', tournament, id: `slot-${year}-${tournament}` })
      } else if (status !== 'played' && status !== 'no-event' && settings.showDimSlots) {
        slots.push({ type: 'dim', label: status === 'not-held' ? 'Not held' : 'Did not play' })
      }
    }
  }

  if (slots.length === 0) return null

  const outfitCount = yearOutfits.length
  const majorsWithOutfits = GRAND_SLAMS.filter(t => yearOutfits.some(o => o.tournament === t)).length
  const showMajorsStat = tournaments.length > 1 && tournaments.some(t => GRAND_SLAMS.includes(t))
  const subtitle = [
    `${outfitCount} outfit${outfitCount !== 1 ? 's' : ''}`,
    showMajorsStat ? `${majorsWithOutfits} of 4 majors` : null,
  ].filter(Boolean).join(' · ')

  return (
    <section id={`year-${year}`} className="mb-14">
      <div className="mb-7">
        <h2 className="font-playfair text-4xl text-ink leading-none">{year}</h2>
        <p className="text-sm text-muted mt-1.5">{subtitle}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory">
        {slots.map((slot, i) => (
          <div
            key={i}
            id={slot.type === 'empty' ? slot.id : undefined}
            className="flex-none snap-start"
            style={{ width: cardWidth }}
          >
            {slot.type === 'outfit' && (
              <OutfitCard outfit={slot.outfit} settings={settings} onClick={() => onOpenLightbox(slot.outfit)} />
            )}
            {slot.type === 'empty' && (
              <EmptySlot label={slot.tournament} />
            )}
            {slot.type === 'dim' && (
              <DimSlot label={slot.label} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
