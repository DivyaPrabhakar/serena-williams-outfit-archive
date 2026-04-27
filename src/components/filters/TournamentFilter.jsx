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

export default function TournamentFilter({ tournaments, active, onChange }) {
  const sorted = sortTournaments(tournaments)
  return (
    <div className="flex flex-wrap gap-1.5">
      <FilterBtn active={active === null} onClick={() => onChange(null)}>
        All
      </FilterBtn>
      {sorted.map(t => (
        <FilterBtn
          key={t}
          active={active === t}
          onClick={() => onChange(active === t ? null : t)}
        >
          {t}
        </FilterBtn>
      ))}
    </div>
  )
}
