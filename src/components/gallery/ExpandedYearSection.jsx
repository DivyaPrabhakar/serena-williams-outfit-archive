import { GRAND_SLAMS, DISCIPLINES, COLOR_MAP } from '../../lib/constants'
import { getRoundsForSlot, getSlotStatus, getRoundLabel, getCombinedSlotStatus, getRoundNumbers } from '../../lib/rounds'
import { CARD_WIDTHS, SLAM_TOURNAMENTS, isKnownForYear } from '../../lib/galleryUtils'
import { getSortedColors } from '../../lib/colorUtils'
import DisciplineBlock from './DisciplineBlock'
import StickyGroupHeader from './StickyGroupHeader'

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

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="w-0.5 h-4 bg-gold flex-shrink-0 rounded-full" />
        <span className="text-base uppercase tracking-widest text-gold font-medium">{tournament}</span>
        <span className="text-xs uppercase tracking-widest text-gold/60">{year} · {stats}</span>
        {tournamentColors.length > 0 && (
          <div className="flex gap-1 ml-1">
            {tournamentColors.map(color => (
              <div
                key={color}
                className="w-5 h-5 rounded-sm ring-1 ring-white/20 flex-shrink-0"
                style={{ background: COLOR_MAP[color] }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Played disciplines — tinted blocks that flow side by side */}
      <div className="flex flex-wrap gap-3 items-start pl-3 mb-4">
        {playedBlocks.map(({ discipline, slots }) => {
          const visible = slots.some(s => s.outfit !== null) || settings.showEmptySlots
          if (!visible) return null
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

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="w-0.5 h-4 bg-gold flex-shrink-0 rounded-full" />
        <span className="text-base uppercase tracking-widest text-gold font-medium">{tournament}</span>
        <span className="text-xs uppercase tracking-widest text-gold/60">{year} · {stats}</span>
        {tournamentColors.length > 0 && (
          <div className="flex gap-1 ml-1">
            {tournamentColors.map(color => (
              <div
                key={color}
                className="w-5 h-5 rounded-sm ring-1 ring-white/20 flex-shrink-0"
                style={{ background: COLOR_MAP[color] }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 items-start pl-3">
        {Object.entries(byDiscipline).map(([discipline, dOutfits]) => {
          const sorted = [...dOutfits].sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0))
          const items = sorted.map(outfit => ({ key: outfit.id, outfit }))
          return (
            <DisciplineBlock
              key={discipline}
              discipline={discipline}
              items={items}
              cardWidth={cardWidth}
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
  const outfitCount = yearOutfits.length
  const majorsWithOutfits = GRAND_SLAMS.filter(t => yearOutfits.some(o => o.tournament === t)).length
  const showMajorsStat = tournaments.length > 1 && tournaments.some(t => GRAND_SLAMS.includes(t))
  const subtitle = [
    `${outfitCount} outfit${outfitCount !== 1 ? 's' : ''}`,
    showMajorsStat ? `${majorsWithOutfits} of 4 majors` : null,
  ].filter(Boolean).join(' · ')

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
      <StickyGroupHeader className="mb-7" id={`nav-year-${year}`} label={String(year)} title={String(year)} subtitle={subtitle} />
      {blocks}
    </section>
  )
}
