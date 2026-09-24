export const TOURNAMENT_ORDER = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open', 'Olympics']

// Single source of truth for the gallery's groupBy options — shared by
// GroupingPanel (the option list) and FilterBar (the "View by: <label>"
// summary) so their labels can't drift out of sync with each other.
export const GROUPING_OPTIONS = [
  { value: 'year', label: 'Year' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'color', label: 'Color' },
  { value: 'color-group', label: 'Color group' },
  { value: 'brand', label: 'Brand' },
]

export const GROUPING_LABELS = Object.fromEntries(
  GROUPING_OPTIONS.map(({ value, label }) => [value, label])
)

export function sortTournaments(tournaments) {
  return [...tournaments].sort((a, b) => {
    const ai = TOURNAMENT_ORDER.indexOf(a)
    const bi = TOURNAMENT_ORDER.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.localeCompare(b)
  })
}
