const TOURNAMENT_ORDER = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open', 'Olympics']

function sortedTournamentKeys(obj) {
  return Object.keys(obj).sort((a, b) => {
    const ai = TOURNAMENT_ORDER.indexOf(a)
    const bi = TOURNAMENT_ORDER.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

function TournamentGroup({ name, count, children }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-ink mb-1.5">
        {name}
        <span className="text-muted font-normal ml-1.5">({count})</span>
      </p>
      {children}
    </div>
  )
}

function MissingButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-2 py-1 text-xs text-muted hover:text-ink hover:bg-dark3 rounded transition-colors leading-snug"
    >
      {label}
    </button>
  )
}

function CondensedContent({ items, onHighlight }) {
  const byTournament = {}
  for (const item of items) {
    if (!byTournament[item.tournament]) byTournament[item.tournament] = []
    byTournament[item.tournament].push(item)
  }
  const tournaments = sortedTournamentKeys(byTournament)
  const total = items.length

  return (
    <>
      <p className="text-[10px] text-muted mb-4 flex-shrink-0">
        {total} missing across {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
      </p>
      {tournaments.map(t => {
        const tItems = byTournament[t].slice().sort((a, b) => a.year - b.year)
        return (
          <TournamentGroup key={t} name={t} count={tItems.length}>
            {tItems.map(item => (
              <MissingButton
                key={`${item.year}_${item.tournament}`}
                label={`${item.year} · ${item.tournament}`}
                onClick={() => onHighlight(item)}
              />
            ))}
          </TournamentGroup>
        )
      })}
    </>
  )
}

function ExpandedContent({ items, onHighlight }) {
  // Group: tournament → discipline → items
  const byTournament = {}
  for (const item of items) {
    if (!byTournament[item.tournament]) byTournament[item.tournament] = {}
    if (!byTournament[item.tournament][item.discipline]) {
      byTournament[item.tournament][item.discipline] = []
    }
    byTournament[item.tournament][item.discipline].push(item)
  }
  const tournaments = sortedTournamentKeys(byTournament)
  const total = items.length

  return (
    <>
      <p className="text-[10px] text-muted mb-4 flex-shrink-0">
        {total} missing round{total !== 1 ? 's' : ''} across {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
      </p>
      {tournaments.map(t => {
        const disciplineMap = byTournament[t]
        const tTotal = Object.values(disciplineMap).reduce((s, arr) => s + arr.length, 0)
        return (
          <TournamentGroup key={t} name={t} count={tTotal}>
            {Object.keys(disciplineMap).map(d => {
              const dItems = disciplineMap[d]
                .slice()
                .sort((a, b) => a.year - b.year || a.roundNumber - b.roundNumber)
              return (
                <div key={d} className="ml-3 mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted/50 mb-1">{d}</p>
                  {dItems.map(item => (
                    <MissingButton
                      key={`${item.year}_${item.tournament}_${item.discipline}_${item.roundNumber}`}
                      label={`${item.year} · ${item.round}`}
                      onClick={() => onHighlight(item)}
                    />
                  ))}
                </div>
              )
            })}
          </TournamentGroup>
        )
      })}
    </>
  )
}

export default function MissingPanel({ mode, condensedItems, expandedItems, onHighlight, onClose }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-dark2 border-t border-dark3 flex flex-col"
      style={{ height: '42vh', minHeight: 240 }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-dark3 flex-shrink-0">
        <h3 className="font-playfair text-base text-gold">Still hunting</h3>
        <button
          onClick={onClose}
          className="text-muted hover:text-ink text-xl leading-none transition-colors"
          aria-label="Close missing panel"
        >
          ×
        </button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {mode === 'condensed' ? (
          condensedItems.length === 0 ? (
            <p className="text-sm text-gold">All tournaments documented!</p>
          ) : (
            <CondensedContent items={condensedItems} onHighlight={onHighlight} />
          )
        ) : (
          expandedItems.length === 0 ? (
            <p className="text-sm text-gold">All rounds documented!</p>
          ) : (
            <ExpandedContent items={expandedItems} onHighlight={onHighlight} />
          )
        )}
      </div>
    </div>
  )
}
