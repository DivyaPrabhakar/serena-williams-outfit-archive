import { GRAND_SLAMS, DISCIPLINES } from '../../lib/constants'
import { getRoundsForSlot, getSlotStatus, getRoundLabel, getCombinedSlotStatus } from '../../lib/rounds'
import FeatureBreak from './FeatureBreak'
import DimSlot from './DimSlot'

const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }

export default function YearSection({ year, outfitMap, tournaments, yearOutfits, settings, onOpenLightbox }) {
  const outfitCount = yearOutfits.length
  const majorsWithOutfits = GRAND_SLAMS.filter(t =>
    yearOutfits.some(o => o.tournament === t)
  ).length

  const showMajorsStat = tournaments.length > 1 && tournaments.some(t => GRAND_SLAMS.includes(t))
  const subtitle = [
    `${outfitCount} outfit${outfitCount !== 1 ? 's' : ''}`,
    showMajorsStat ? `${majorsWithOutfits} of 4 majors` : null,
  ].filter(Boolean).join(' · ')

  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const blocks = tournaments.flatMap(tournament => {
    const combinedStatus = getCombinedSlotStatus(tournament, year)

    // Whole tournament was cancelled — one consolidated dim slot
    if (combinedStatus === 'not-held') {
      if (!settings.showDimSlots) return []
      return [(
        <div key={`${tournament}_not-held`} className="mb-6">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-0.5 h-3.5 bg-dark3 flex-shrink-0 rounded-full" />
            <span className="text-[10px] uppercase tracking-widest text-muted/40 font-medium">
              {tournament} {year}
            </span>
          </div>
          <div style={{ width: cardWidth }}>
            <DimSlot label="Not held" />
          </div>
        </div>
      )]
    }

    return DISCIPLINES.flatMap(discipline => {
      const roundCount = getRoundsForSlot(tournament, year, discipline)

      if (roundCount > 0) {
        const slots = Array.from({ length: roundCount }, (_, i) => {
          const roundNumber = i + 1
          const mapKey = `${year}_${tournament}_${discipline}_${roundNumber}`
          const outfit = outfitMap.get(mapKey)
          return outfit
            ? { type: 'outfit', outfit }
            : { type: 'empty', label: getRoundLabel(roundNumber) }
        })
        // Skip if no visible slots (all empty and showEmptySlots is off)
        const hasOutfits = slots.some(s => s.type === 'outfit')
        if (!hasOutfits && !settings.showEmptySlots) return []
        return [(
          <FeatureBreak
            key={`${tournament}_${discipline}`}
            tournament={tournament}
            year={year}
            discipline={discipline}
            slots={slots}
            settings={settings}
            onOpenLightbox={onOpenLightbox}
          />
        )]
      }

      const status = getSlotStatus(tournament, year, discipline)
      if (status === 'did-not-play' && settings.showDimSlots) {
        return [(
          <div key={`${tournament}_${discipline}_dnp`} className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-0.5 h-3.5 bg-dark3 flex-shrink-0 rounded-full" />
              <span className="text-[10px] uppercase tracking-widest text-muted/30 font-medium">
                {tournament} {year} · {discipline}
              </span>
            </div>
            <div style={{ width: cardWidth }}>
              <DimSlot label={`Did not play · ${discipline}`} />
            </div>
          </div>
        )]
      }

      return []
    })
  })

  if (blocks.length === 0) return null

  return (
    <section className="mb-14">
      <div className="mb-7">
        <h2 className="font-playfair text-4xl text-ink leading-none">{year}</h2>
        <p className="text-sm text-muted mt-1.5">{subtitle}</p>
      </div>
      {blocks}
    </section>
  )
}
