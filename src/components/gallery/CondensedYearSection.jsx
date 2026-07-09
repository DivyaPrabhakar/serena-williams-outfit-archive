import { getCombinedSlotStatus } from '../../lib/rounds'
import { CARD_WIDTHS, isKnownForYear, getYearSubtitle } from '../../lib/galleryUtils'
import { getSortedColors } from '../../lib/colorUtils'
import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'
import ColorSwatch from '../ColorSwatch'

export default function CondensedYearSection({ year, tournaments, yearOutfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const outfitsByTournament = {}
  for (const o of yearOutfits) {
    if (!outfitsByTournament[o.tournament]) outfitsByTournament[o.tournament] = []
    outfitsByTournament[o.tournament].push(o)
  }

  const slots = []
  for (const tournament of tournaments) {
    const tOutfits = outfitsByTournament[tournament] ?? []
    const known = isKnownForYear(tournament, year)

    if (tOutfits.length > 0) {
      for (const outfit of tOutfits) {
        slots.push({ type: 'outfit', outfit })
      }
    } else if (known && getCombinedSlotStatus(tournament, year) === 'played' && settings.showEmptySlots) {
      slots.push({ type: 'empty', tournament, id: `slot-${year}-${tournament}` })
    }
  }

  if (slots.length === 0) return null

  const subtitle = getYearSubtitle(yearOutfits, tournaments)

  const yearColors = getSortedColors(yearOutfits.flatMap(o => o.colors ?? []))

  return (
    <section id={`year-${year}`} className="mb-14">
      <div className="mb-7">
        <div className="flex items-center gap-3">
          <h2 className="font-playfair text-5xl text-ink leading-none">{year}</h2>
          {yearColors.length > 0 && (
            <div className="flex gap-1">
              {yearColors.map(color => (
                <ColorSwatch
                  key={color}
                  color={color}
                  className="w-5 h-5 rounded-sm ring-1 ring-white/25 flex-shrink-0"
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted mt-1.5">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot, i) => (
          <div
            key={i}
            id={slot.type === 'empty' ? slot.id : undefined}
            style={{ width: cardWidth }}
          >
            {slot.type === 'outfit' && (
              <OutfitCard outfit={slot.outfit} settings={settings} onClick={() => onOpenLightbox(slot.outfit)} />
            )}
            {slot.type === 'empty' && (
              <EmptySlot label={slot.tournament} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
