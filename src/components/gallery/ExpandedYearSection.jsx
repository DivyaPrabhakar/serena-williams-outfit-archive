import { DISCIPLINES } from '../../lib/constants'
import { getRoundsForSlot, getSlotStatus, getRoundLabel, getCombinedSlotStatus, getRoundNumbers } from '../../lib/rounds'
import { CARD_WIDTHS, isKnownForYear, getYearSubtitle } from '../../lib/galleryUtils'
import { getSortedColors } from '../../lib/colorUtils'
import DisciplineBlock from './DisciplineBlock'
import StickyGroupHeader from './StickyGroupHeader'
import ColorSwatch from '../ColorSwatch'

// For tournaments in the participation constants (grand slams + Olympics)
function ExpandedTournamentBlock({ tournament, year, outfitMap, settings, sortBy, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const disciplineBlocks = DISCIPLINES.flatMap(discipline => {
    const roundCount = getRoundsForSlot(tournament, year, discipline)

    if (roundCount > 0) {
      const slots = getRoundNumbers(tournament, year, discipline).map(roundNumber => {
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

  const playedBlocks = disciplineBlocks.filter(d => d.status === 'played')
  const dimBlocks = disciplineBlocks.filter(d => d.status !== 'played')

  const hasVisibleContent =
    playedBlocks.some(({ slots }) => slots.some(s => s.outfit !== null) || settings.showEmptySlots) ||
    (settings.showDimSlots && dimBlocks.length > 0)
  if (!hasVisibleContent) return null

  const totalSlots = playedBlocks.reduce((sum, d) => sum + d.slots.length, 0)
  const found = playedBlocks.reduce(
    (sum, d) => sum + d.slots.filter(s => s.outfit !== null).length, 0
  )
  const stats = `${totalSlots} outfit${totalSlots !== 1 ? 's' : ''} · ${found} found`

  const tournamentColors = getSortedColors(
    playedBlocks.flatMap(d => d.slots.flatMap(s => s.outfit?.colors ?? []))
  )

  const stacked = settings.hideGetty || settings.layout === 'vertical'

  // Only disciplines with visible content get a column, so the equal-width grid
  // divides evenly across what actually renders (2 disciplines → halves, 3 → thirds).
  const visibleBlocks = playedBlocks.filter(
    ({ slots }) => slots.some(s => s.outfit !== null) || settings.showEmptySlots
  )

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="w-0.5 h-4 bg-gold flex-shrink-0 rounded-full" />
        <span className="text-base uppercase tracking-widest text-gold font-medium">{tournament}</span>
        {!settings.hideGetty && <span className="text-xs uppercase tracking-widest text-gold/60">{year} · {stats}</span>}
        {tournamentColors.length > 0 && (
          <div className="flex gap-1 ml-1">
            {tournamentColors.map(color => (
              <ColorSwatch
                key={color}
                color={color}
                className="w-5 h-5 rounded-sm ring-1 ring-white/20 flex-shrink-0"
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Played disciplines — side by side they divide the width into equal columns
          (1/N each); stacked they each span the full width. */}
      <div
        className={stacked ? 'flex flex-col gap-3 items-start pl-3 mb-4' : 'grid gap-3 items-start pl-3 mb-4'}
        style={stacked ? undefined : { gridTemplateColumns: `repeat(${visibleBlocks.length}, minmax(0, 1fr))` }}
      >
        {visibleBlocks.map(({ discipline, slots }) => {
          const orderedSlots = sortBy === 'filled-first'
            ? [...slots.filter(s => s.outfit !== null), ...slots.filter(s => s.outfit === null)]
            : slots
          const items = orderedSlots
            .filter(({ outfit }) => outfit || settings.showEmptySlots)
            .map(({ roundNumber, outfit }) => ({
              key: roundNumber,
              outfit,
              emptyLabel: `${discipline} ${getRoundLabel(roundNumber)}`,
              slotId: `slot-${year}-${tournament}-${discipline}-${roundNumber}`,
            }))
          return (
            <DisciplineBlock
              key={discipline}
              discipline={discipline}
              items={items}
              cardWidth={cardWidth}
              fillWidth
              settings={settings}
              onOpenLightbox={onOpenLightbox}
            />
          )
        })}
      </div>

      {/* Non-played disciplines — consolidated into one line */}
      {settings.showDimSlots && dimBlocks.length > 0 && (
        <div className="pl-3 mb-2">
          <span className="text-xs text-muted/50 uppercase tracking-widest">
            Did not play · {dimBlocks.map(d => d.discipline).join(' · ')}
          </span>
        </div>
      )}
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
  const stats = `${found} outfit${found !== 1 ? 's' : ''} · ${found} found`

  const tournamentColors = getSortedColors(outfits.flatMap(o => o.colors ?? []))

  const stacked = settings.hideGetty || settings.layout === 'vertical'
  const disciplineEntries = Object.entries(byDiscipline)

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="w-0.5 h-4 bg-gold flex-shrink-0 rounded-full" />
        <span className="text-base uppercase tracking-widest text-gold font-medium">{tournament}</span>
        {!settings.hideGetty && <span className="text-xs uppercase tracking-widest text-gold/60">{year} · {stats}</span>}
        {tournamentColors.length > 0 && (
          <div className="flex gap-1 ml-1">
            {tournamentColors.map(color => (
              <ColorSwatch
                key={color}
                color={color}
                className="w-5 h-5 rounded-sm ring-1 ring-white/20 flex-shrink-0"
                title={color}
              />
            ))}
          </div>
        )}
      </div>
      <div
        className={stacked ? 'flex flex-col gap-3 items-start pl-3' : 'grid gap-3 items-start pl-3'}
        style={stacked ? undefined : { gridTemplateColumns: `repeat(${disciplineEntries.length}, minmax(0, 1fr))` }}
      >
        {disciplineEntries.map(([discipline, dOutfits]) => {
          const sorted = [...dOutfits].sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0))
          const items = sorted.map(outfit => ({ key: outfit.id, outfit }))
          return (
            <DisciplineBlock
              key={discipline}
              discipline={discipline}
              items={items}
              cardWidth={cardWidth}
              fillWidth
              settings={settings}
              onOpenLightbox={onOpenLightbox}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function ExpandedYearSection({ year, outfitMap, tournaments, yearOutfits, settings, sortBy, onOpenLightbox }) {
  const subtitle = getYearSubtitle(yearOutfits, tournaments)

  const blocks = tournaments.flatMap(tournament => {
    if (!isKnownForYear(tournament, year)) {
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
            <span className="w-0.5 h-4 bg-dark3 flex-shrink-0 rounded-full" />
            <span className="text-base uppercase tracking-widest text-muted/40 font-medium">
              {tournament}
            </span>
            <span className="text-xs uppercase tracking-widest text-muted/30">{year} · Not held</span>
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
        sortBy={sortBy}
        onOpenLightbox={onOpenLightbox}
      />
    )]
  })

  if (blocks.length === 0) return null

  return (
    <section id={`year-${year}`} className="mb-14">
      <StickyGroupHeader className="mb-7" id={`nav-year-${year}`} label={String(year)} title={String(year)} subtitle={settings.hideGetty ? null : subtitle} />
      {blocks}
    </section>
  )
}
