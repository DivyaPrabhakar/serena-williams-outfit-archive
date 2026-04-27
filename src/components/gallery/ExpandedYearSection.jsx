import { GRAND_SLAMS, DISCIPLINES } from '../../lib/constants'
import { getRoundsForSlot, getSlotStatus, getRoundLabel, getCombinedSlotStatus } from '../../lib/rounds'
import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'
import DimSlot from './DimSlot'

const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }
const KNOWN_TOURNAMENTS = new Set([...GRAND_SLAMS, 'Olympics'])

// For tournaments in the participation constants (grand slams + Olympics)
function ExpandedTournamentBlock({ tournament, year, outfitMap, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const disciplineBlocks = DISCIPLINES.flatMap(discipline => {
    const roundCount = getRoundsForSlot(tournament, year, discipline)

    if (roundCount > 0) {
      const slots = Array.from({ length: roundCount }, (_, i) => {
        const roundNumber = i + 1
        const outfit = outfitMap.get(`${year}_${tournament}_${discipline}_${roundNumber}`) ?? null
        return { roundNumber, outfit }
      })
      return [{ discipline, slots, status: 'played' }]
    }

    const status = getSlotStatus(tournament, year, discipline)
    if (status === 'did-not-play' || status === 'not-held') {
      return [{ discipline, slots: [], status }]
    }
    return []
  })

  if (disciplineBlocks.length === 0) return null

  const hasVisibleContent = disciplineBlocks.some(({ slots, status }) =>
    status === 'played'
      ? slots.some(s => s.outfit !== null) || settings.showEmptySlots
      : settings.showDimSlots
  )
  if (!hasVisibleContent) return null

  const totalSlots = disciplineBlocks.reduce((sum, d) => sum + d.slots.length, 0)
  const found = disciplineBlocks.reduce(
    (sum, d) => sum + d.slots.filter(s => s.outfit !== null).length, 0
  )
  const header = `${tournament} ${year} · ${totalSlots} outfit${totalSlots !== 1 ? 's' : ''} · ${found} found`

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-0.5 h-3.5 bg-gold flex-shrink-0 rounded-full" />
        <span className="text-[10px] uppercase tracking-widest text-gold font-medium">{header}</span>
      </div>

      {disciplineBlocks.map(({ discipline, slots, status }) => {
        const visible =
          status === 'played'
            ? slots.some(s => s.outfit !== null) || settings.showEmptySlots
            : settings.showDimSlots
        if (!visible) return null

        return (
          <div key={discipline} className="mb-4 pl-3">
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-[10px] uppercase tracking-widest text-muted">{discipline}</span>
              <div className="flex-1 h-px bg-dark3" />
            </div>

            {status !== 'played' ? (
              <div style={{ width: cardWidth }}>
                <DimSlot
                  label={status === 'not-held' ? 'Not held' : `Did not play · ${discipline}`}
                />
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory">
                {slots.map(({ roundNumber, outfit }) => {
                  if (!outfit && !settings.showEmptySlots) return null
                  return (
                    <div
                      key={roundNumber}
                      id={`slot-${year}-${tournament}-${discipline}-${roundNumber}`}
                      className="flex-none snap-start"
                      style={{ width: cardWidth }}
                    >
                      {outfit ? (
                        <OutfitCard
                          outfit={outfit}
                          settings={settings}
                          onClick={() => onOpenLightbox(outfit)}
                        />
                      ) : (
                        <EmptySlot label={`${discipline} ${getRoundLabel(roundNumber)}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// For tournaments not in the participation constants — show what's logged, no empty slots
function UnknownTournamentBlock({ tournament, year, outfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  if (outfits.length === 0) return null

  const byDiscipline = {}
  for (const o of outfits) {
    const d = o.discipline ?? 'Singles'
    if (!byDiscipline[d]) byDiscipline[d] = []
    byDiscipline[d].push(o)
  }

  const found = outfits.length
  const header = `${tournament} ${year} · ${found} outfit${found !== 1 ? 's' : ''} · ${found} found`

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-0.5 h-3.5 bg-gold flex-shrink-0 rounded-full" />
        <span className="text-[10px] uppercase tracking-widest text-gold font-medium">{header}</span>
      </div>
      {Object.entries(byDiscipline).map(([discipline, dOutfits]) => {
        const sorted = [...dOutfits].sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0))
        return (
          <div key={discipline} className="mb-4 pl-3">
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-[10px] uppercase tracking-widest text-muted">{discipline}</span>
              <div className="flex-1 h-px bg-dark3" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory">
              {sorted.map(outfit => (
                <div key={outfit.id} className="flex-none snap-start" style={{ width: cardWidth }}>
                  <OutfitCard outfit={outfit} settings={settings} onClick={() => onOpenLightbox(outfit)} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ExpandedYearSection({ year, outfitMap, tournaments, yearOutfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const outfitCount = yearOutfits.length
  const majorsWithOutfits = GRAND_SLAMS.filter(t => yearOutfits.some(o => o.tournament === t)).length
  const showMajorsStat = tournaments.length > 1 && tournaments.some(t => GRAND_SLAMS.includes(t))
  const subtitle = [
    `${outfitCount} outfit${outfitCount !== 1 ? 's' : ''}`,
    showMajorsStat ? `${majorsWithOutfits} of 4 majors` : null,
  ].filter(Boolean).join(' · ')

  const blocks = tournaments.flatMap(tournament => {
    if (!KNOWN_TOURNAMENTS.has(tournament)) {
      const tOutfits = yearOutfits.filter(o => o.tournament === tournament)
      return [(
        <UnknownTournamentBlock
          key={tournament}
          tournament={tournament}
          year={year}
          outfits={tOutfits}
          settings={settings}
          onOpenLightbox={onOpenLightbox}
        />
      )]
    }

    const combinedStatus = getCombinedSlotStatus(tournament, year)

    if (combinedStatus === 'not-held') {
      if (!settings.showDimSlots) return []
      return [(
        <div key={`${tournament}_not-held`} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-0.5 h-3.5 bg-dark3 flex-shrink-0 rounded-full" />
            <span className="text-[10px] uppercase tracking-widest text-muted/40 font-medium">
              {tournament} {year}
            </span>
          </div>
          <div className="pl-3" style={{ width: cardWidth }}>
            <DimSlot label="Not held" />
          </div>
        </div>
      )]
    }

    return [(
      <ExpandedTournamentBlock
        key={tournament}
        tournament={tournament}
        year={year}
        outfitMap={outfitMap}
        settings={settings}
        onOpenLightbox={onOpenLightbox}
      />
    )]
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
