import { COLOR_MAP, DISCIPLINES } from '../../lib/constants'
import { getSortedColors } from '../../lib/colorUtils'
import { slotsForYear, getRoundLabel, getRoundNumbers } from '../../lib/rounds'
import { sortTournaments } from '../../lib/filterUtils'
import { CARD_WIDTHS, isKnownForYear, groupNavId } from '../../lib/galleryUtils'
import ExpandedYearSection from './ExpandedYearSection'
import GroupSection from './GroupSection'
import DisciplineBlock from './DisciplineBlock'
import StickyGroupHeader from './StickyGroupHeader'

export default function GalleryGrid({ outfits, groupBy = 'year', sortBy = 'chronological', settings, onOpenLightbox }) {
  if (groupBy !== 'year') {
    return (
      <GroupedGallery
        outfits={outfits}
        groupBy={groupBy}
        sortBy={sortBy}
        settings={settings}
        onOpenLightbox={onOpenLightbox}
      />
    )
  }

  const outfitMap = new Map(
    outfits.map(o => [`${o.year}_${o.tournament}_${o.discipline}_${o.roundNumber}`, o])
  )
  const years = [...new Set(outfits.map(o => o.year))].sort((a, b) => a - b)

  function tournamentsForYear(year) {
    const known = slotsForYear(year)
    const extra = [...new Set(outfits.filter(o => o.year === year).map(o => o.tournament))]
      .filter(t => !known.includes(t))
      .sort((a, b) => a.localeCompare(b))
    return [...known, ...extra]
  }

  function outfitsForYear(year) {
    return outfits.filter(o => o.year === year)
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
      {years.map(year => (
        <ExpandedYearSection
          key={year}
          year={year}
          outfitMap={outfitMap}
          tournaments={tournamentsForYear(year)}
          yearOutfits={outfitsForYear(year)}
          settings={settings}
          sortBy={sortBy}
          onOpenLightbox={onOpenLightbox}
        />
      ))}
    </div>
  )
}

function GroupedGallery({ outfits, groupBy, sortBy, settings, onOpenLightbox }) {
  if (groupBy === 'tournament') {
    return (
      <TournamentGroupedGallery
        outfits={outfits}
        sortBy={sortBy}
        settings={settings}
        onOpenLightbox={onOpenLightbox}
      />
    )
  }

  let groups = []

  if (groupBy === 'color') {
    const colorOrder = Object.keys(COLOR_MAP)
    const map = {}
    for (const o of outfits) {
      for (const c of (o.colors ?? [])) {
        if (!map[c]) map[c] = []
        map[c].push(o)
      }
    }
    groups = colorOrder
      .filter(c => map[c]?.length > 0)
      .map(c => ({ key: c, label: c, color: COLOR_MAP[c], outfits: map[c] }))
  } else if (groupBy === 'color-group') {
    const colorOrder = Object.keys(COLOR_MAP)
    const map = {}
    for (const o of outfits) {
      const sortedColors = getSortedColors(o.colors ?? [])
      const key = sortedColors.join('|') || '__none__'
      if (!map[key]) map[key] = { colors: sortedColors, outfits: [] }
      map[key].outfits.push(o)
    }
    const sortedEntries = Object.entries(map).sort(([, a], [, b]) => {
      for (let i = 0; i < Math.max(a.colors.length, b.colors.length); i++) {
        const ai = a.colors[i] != null ? colorOrder.indexOf(a.colors[i]) : Infinity
        const bi = b.colors[i] != null ? colorOrder.indexOf(b.colors[i]) : Infinity
        if (ai !== bi) return ai - bi
      }
      return 0
    })
    groups = sortedEntries.map(([key, { colors, outfits: g }]) => ({
      key,
      label: colors.length > 0 ? colors.join(' · ') : 'No color',
      colors,
      outfits: g,
    }))
  } else if (groupBy === 'brand') {
    const map = {}
    for (const o of outfits) {
      const brand = o.brand ?? '__none__'
      if (!map[brand]) map[brand] = []
      map[brand].push(o)
    }
    const sorted = Object.keys(map).filter(b => b !== '__none__').sort()
    if (map['__none__']) sorted.push('__none__')
    groups = sorted.map(b => ({
      key: b,
      label: b === '__none__' ? 'No brand listed' : b,
      outfits: map[b],
    }))
  }

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 text-muted text-sm">
        No outfits found
      </div>
    )
  }

  return (
    <div>
      {groups.map(g => (
        <GroupSection
          key={g.key}
          navId={groupNavId('group', g.key)}
          label={g.label}
          color={g.color}
          outfits={g.outfits}
          settings={settings}
          onOpenLightbox={onOpenLightbox}
        />
      ))}
    </div>
  )
}

function TournamentGroupedGallery({ outfits, sortBy, settings, onOpenLightbox }) {
  const outfitMap = new Map(
    outfits.map(o => [`${o.year}_${o.tournament}_${o.discipline}_${o.roundNumber}`, o])
  )
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const map = {}
  for (const o of outfits) {
    if (!map[o.tournament]) map[o.tournament] = []
    map[o.tournament].push(o)
  }
  const sorted = sortTournaments(Object.keys(map))

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 text-muted text-sm">
        No outfits found
      </div>
    )
  }

  return (
    <div>
      {sorted.map(tournament => {
        const tournamentOutfits = map[tournament]
        const years = [...new Set(tournamentOutfits.map(o => o.year))].sort((a, b) => a - b)

        // Build one set of discipline blocks per tournament, spanning all years.
        // Each round slot is unique per year+round; placeholders are year-labeled.
        const disciplineBlocks = DISCIPLINES.flatMap(discipline => {
          const slots = []
          const captured = new Set()
          for (const year of years) {
            if (!isKnownForYear(tournament, year)) continue
            for (const roundNumber of getRoundNumbers(tournament, year, discipline)) {
              const outfit = outfitMap.get(`${year}_${tournament}_${discipline}_${roundNumber}`) ?? null
              if (outfit) captured.add(outfit.id)
              slots.push({ year, roundNumber, outfit })
            }
          }
          // Don't drop logged outfits from unknown years or anomalous rounds.
          for (const o of tournamentOutfits) {
            if ((o.discipline ?? 'Singles') !== discipline) continue
            if (captured.has(o.id)) continue
            slots.push({ year: o.year, roundNumber: o.roundNumber ?? 0, outfit: o })
          }
          if (slots.length === 0) return []
          const visible = slots.some(s => s.outfit !== null) || settings.showEmptySlots
          if (!visible) return []
          slots.sort((a, b) => (a.year - b.year) || ((a.roundNumber ?? 0) - (b.roundNumber ?? 0)))
          return [{ discipline, slots }]
        })

        return (
          <section key={tournament} className="mb-14">
            <StickyGroupHeader
              className="mb-7"
              id={groupNavId('tournament', tournament)}
              label={tournament}
              title={tournament}
              subtitle={settings.hideGetty ? null : `${tournamentOutfits.length} outfit${tournamentOutfits.length !== 1 ? 's' : ''}`}
            />

            <div
              className={settings.hideGetty ? 'flex flex-col gap-3 items-start pl-3' : 'grid gap-3 items-start pl-3'}
              style={settings.hideGetty ? undefined : { gridTemplateColumns: `repeat(${disciplineBlocks.length}, minmax(0, 1fr))` }}
            >
              {disciplineBlocks.map(({ discipline, slots }) => {
                const orderedSlots = sortBy === 'filled-first'
                  ? [...slots.filter(s => s.outfit !== null), ...slots.filter(s => s.outfit === null)]
                  : slots
                const items = orderedSlots
                  .filter(({ outfit }) => outfit || settings.showEmptySlots)
                  .map(({ year, roundNumber, outfit }) => ({
                    key: outfit ? outfit.id : `${year}-${roundNumber}`,
                    outfit,
                    emptyLabel: `${year} ${getRoundLabel(roundNumber)}`,
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
          </section>
        )
      })}
    </div>
  )
}
