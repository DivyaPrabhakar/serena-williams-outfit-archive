export const TOURNAMENT_ORDER = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open', 'Olympics']

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
