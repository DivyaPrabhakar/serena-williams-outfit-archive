import { COLOR_MAP } from '../../lib/constants'
import { slotsForYear } from '../../lib/rounds'
import { sortTournaments } from '../../lib/filterUtils'
import ExpandedYearSection from './ExpandedYearSection'
import GroupSection from './GroupSection'

export default function GalleryGrid({ outfits, groupBy = 'year', sortBy = 'chronological', settings, onOpenLightbox }) {
  if (groupBy !== 'year') {
    return (
      <GroupedGallery
        outfits={outfits}
        groupBy={groupBy}
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

function GroupedGallery({ outfits, groupBy, settings, onOpenLightbox }) {
  let groups = []

  if (groupBy === 'tournament') {
    const map = {}
    for (const o of outfits) {
      if (!map[o.tournament]) map[o.tournament] = []
      map[o.tournament].push(o)
    }
    const sorted = sortTournaments(Object.keys(map))
    groups = sorted.map(t => ({ key: t, label: t, outfits: map[t] }))
  } else if (groupBy === 'color') {
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
