import { COLOR_MAP, DISCIPLINES } from '../../lib/constants'
import { getSortedColors } from '../../lib/colorUtils'
import { slotsForYear, getRoundsForSlot, getRoundLabel, getRoundNumbers } from '../../lib/rounds'
import { sortTournaments } from '../../lib/filterUtils'
import { CARD_WIDTHS, isKnownForYear } from '../../lib/galleryUtils'
import ExpandedYearSection from './ExpandedYearSection'
import GroupSection from './GroupSection'
import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'

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

        return (
          <section key={tournament} className="mb-14">
            <div className="mb-7">
              <h2 className="font-playfair text-5xl text-ink leading-none">{tournament}</h2>
              <p className="text-sm text-muted mt-1.5">
                {tournamentOutfits.length} outfit{tournamentOutfits.length !== 1 ? 's' : ''}
              </p>
            </div>

            {years.map(year => {
              if (!isKnownForYear(tournament, year)) {
                const yearOutfits = tournamentOutfits
                  .filter(o => o.year === year)
                  .sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0))
                return (
                  <div key={year} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs uppercase tracking-widest text-gold/60">{year}</span>
                      <div className="flex-1 h-px bg-dark3" />
                    </div>
                    <div className="flex flex-wrap gap-2 pl-3 pb-1.5">
                      {yearOutfits.map(outfit => (
                        <div key={outfit.id} className="flex-none" style={{ width: cardWidth }}>
                          <OutfitCard outfit={outfit} settings={settings} onClick={() => onOpenLightbox(outfit)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              const disciplineBlocks = DISCIPLINES.flatMap(discipline => {
                const slots = getRoundNumbers(tournament, year, discipline).map(roundNumber => {
                  const outfit = outfitMap.get(`${year}_${tournament}_${discipline}_${roundNumber}`) ?? null
                  return { roundNumber, outfit }
                })
                if (slots.length === 0) return []
                const visible = slots.some(s => s.outfit !== null) || settings.showEmptySlots
                if (!visible) return []
                return [{ discipline, slots }]
              })

              if (disciplineBlocks.length === 0) return null

              return (
                <div key={year} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs uppercase tracking-widest text-gold/60">{year}</span>
                    <div className="flex-1 h-px bg-dark3" />
                  </div>
                  {disciplineBlocks.map(({ discipline, slots }) => {
                    const orderedSlots = sortBy === 'filled-first'
                      ? [...slots.filter(s => s.outfit !== null), ...slots.filter(s => s.outfit === null)]
                      : slots
                    return (
                      <div key={discipline} className="mb-4 pl-3">
                        <div className="flex items-center gap-3 mb-2.5">
                          <span className="text-xs uppercase tracking-widest text-muted">{discipline}</span>
                          <div className="flex-1 h-px bg-dark3" />
                        </div>
                        <div className="flex flex-wrap gap-2 pb-1.5">
                          {orderedSlots.map(({ roundNumber, outfit }) => {
                            if (!outfit && !settings.showEmptySlots) return null
                            return (
                              <div key={roundNumber} className="flex-none" style={{ width: cardWidth }}>
                                {outfit ? (
                                  <OutfitCard outfit={outfit} settings={settings} onClick={() => onOpenLightbox(outfit)} />
                                ) : (
                                  <EmptySlot label={`${discipline} ${getRoundLabel(roundNumber)}`} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
