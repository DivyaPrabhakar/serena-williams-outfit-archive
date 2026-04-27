import { GRAND_SLAMS } from '../../lib/constants'
import { getCombinedSlotStatus } from '../../lib/rounds'
import FeatureBreak from './FeatureBreak'
import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'
import DimSlot from './DimSlot'

const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }

export default function CondensedYearSection({ year, tournaments, yearOutfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const outfitCount = yearOutfits.length
  const majorsWithOutfits = GRAND_SLAMS.filter(t => yearOutfits.some(o => o.tournament === t)).length
  const showMajorsStat = tournaments.length > 1 && tournaments.some(t => GRAND_SLAMS.includes(t))
  const subtitle = [
    `${outfitCount} outfit${outfitCount !== 1 ? 's' : ''}`,
    showMajorsStat ? `${majorsWithOutfits} of 4 majors` : null,
  ].filter(Boolean).join(' · ')

  const blocks = tournaments.flatMap(tournament => {
    const tOutfits = yearOutfits.filter(o => o.tournament === tournament)

    if (tOutfits.length > 1) {
      const slots = tOutfits.map(o => ({ type: 'outfit', outfit: o }))
      const label = `${tournament} ${year} · ${tOutfits.length} outfits`
      return [(
        <FeatureBreak
          key={tournament}
          tournament={tournament}
          year={year}
          discipline={null}
          slots={slots}
          settings={settings}
          onOpenLightbox={onOpenLightbox}
          headerLabel={label}
        />
      )]
    }

    if (tOutfits.length === 1) {
      return [(
        <div key={tournament} className="mb-6" style={{ width: cardWidth }}>
          <OutfitCard
            outfit={tOutfits[0]}
            settings={settings}
            onClick={() => onOpenLightbox(tOutfits[0])}
          />
        </div>
      )]
    }

    // No outfits — check combined status
    const status = getCombinedSlotStatus(tournament, year)

    if (status === 'played') {
      if (!settings.showEmptySlots) return []
      return [(
        <div key={tournament} className="mb-6">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-0.5 h-3.5 bg-gold flex-shrink-0 rounded-full" />
            <span className="text-[10px] uppercase tracking-widest text-gold font-medium">
              {tournament} {year}
            </span>
          </div>
          <div id={`slot-${year}-${tournament}`} style={{ width: cardWidth }}>
            <EmptySlot label={tournament} />
          </div>
        </div>
      )]
    }

    if (status !== 'no-event' && settings.showDimSlots) {
      const label = status === 'not-held' ? 'Not held' : 'Did not play'
      return [(
        <div key={tournament} className="mb-6">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-0.5 h-3.5 bg-dark3 flex-shrink-0 rounded-full" />
            <span className="text-[10px] uppercase tracking-widest text-muted/40 font-medium">
              {tournament} {year}
            </span>
          </div>
          <div style={{ width: cardWidth }}>
            <DimSlot label={label} />
          </div>
        </div>
      )]
    }

    return []
  })

  if (blocks.length === 0) return null

  return (
    <section id={`year-${year}`} className="mb-14">
      <div className="mb-7">
        <h2 className="font-playfair text-4xl text-ink leading-none">{year}</h2>
        <p className="text-sm text-muted mt-1.5">{subtitle}</p>
      </div>
      {blocks}
    </section>
  )
}
