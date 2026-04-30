const TOURNAMENT_ORDER = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open', 'Olympics']

function sortTournaments(tournaments) {
  return [...tournaments].sort((a, b) => {
    const ai = TOURNAMENT_ORDER.indexOf(a)
    const bi = TOURNAMENT_ORDER.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.localeCompare(b)
  })
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-gold text-dark' : 'bg-dark3 text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function FilterPanel({
  tournaments,
  activeTournament,
  onTournamentChange,
  years,
  activeYear,
  onYearChange,
  onClose,
}) {
  const sortedTournaments = sortTournaments(tournaments)
  const sortedYears = [...years].sort((a, b) => a - b)
  const hasActive = activeTournament !== null || activeYear !== null

  return (
    <div className="fixed right-0 top-20 bottom-0 z-[45] w-72 bg-dark2 border-l border-dark3 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark3 flex-shrink-0">
          <h3 className="font-playfair text-gold text-base">Filters</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none"
            aria-label="Close filters"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-3">Tournament</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterBtn active={activeTournament === null} onClick={() => onTournamentChange(null)}>
                All
              </FilterBtn>
              {sortedTournaments.map(t => (
                <FilterBtn
                  key={t}
                  active={activeTournament === t}
                  onClick={() => onTournamentChange(activeTournament === t ? null : t)}
                >
                  {t}
                </FilterBtn>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-3">Year</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterBtn active={activeYear === null} onClick={() => onYearChange(null)}>
                All
              </FilterBtn>
              {sortedYears.map(y => (
                <FilterBtn
                  key={y}
                  active={activeYear === y}
                  onClick={() => onYearChange(activeYear === y ? null : y)}
                >
                  {y}
                </FilterBtn>
              ))}
            </div>
          </div>
        </div>

        {hasActive && (
          <div className="px-5 py-4 border-t border-dark3 flex-shrink-0">
            <button
              onClick={() => { onTournamentChange(null); onYearChange(null) }}
              className="w-full py-2 rounded text-xs font-medium bg-dark3 text-muted hover:text-ink transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
    </div>
  )
}
