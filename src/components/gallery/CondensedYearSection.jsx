import { GRAND_SLAMS, NON_SLAM_ROUNDS_SINGLES, NON_SLAM_ROUNDS_DOUBLES, COLOR_MAP } from '../../lib/constants'
import { getCombinedSlotStatus } from '../../lib/rounds'
import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'
import DimSlot from './DimSlot'

const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }
const SLAM_TOURNAMENTS = new Set([...GRAND_SLAMS, 'Olympics'])

function isKnownForYear(tournament, year) {
  if (SLAM_TOURNAMENTS.has(tournament)) return true
  const y = Number(year)
  return (NON_SLAM_ROUNDS_SINGLES[tournament]?.[y] != null) ||
         (NON_SLAM_ROUNDS_DOUBLES[tournament]?.[y] != null)
}

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
    } else if (known) {
      const status = getCombinedSlotStatus(tournament, year)
      if (status === 'played' && settings.showEmptySlots) {
        slots.push({ type: 'empty', tournament, id: `slot-${year}-${tournament}` })
      } else if (status !== 'played' && status !== 'no-event' && settings.showDimSlots) {
        slots.push({
          type: 'dim',
          tournament,
          label: status === 'not-held' ? 'Not held' : 'Did not play',
        })
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

  const colorOrder = Object.keys(COLOR_MAP)
  const yearColors = [...new Set(yearOutfits.flatMap(o => o.colors ?? []))]
    .filter(c => c in COLOR_MAP)
    .sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b))

  return (
    <section id={`year-${year}`} className="mb-14">
      <div className="mb-7">
        <div className="flex items-center gap-3">
          <h2 className="font-playfair text-5xl text-ink leading-none">{year}</h2>
          {yearColors.length > 0 && (
            <div className="flex gap-1">
              {yearColors.map(color => (
                <div
                  key={color}
                  className="w-5 h-5 rounded-sm ring-1 ring-white/25 flex-shrink-0"
                  style={{ background: COLOR_MAP[color] }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
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
              <DimSlot tournament={slot.tournament} label={slot.label} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
