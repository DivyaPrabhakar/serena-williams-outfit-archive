import { sortTournaments } from '../../lib/filterUtils'
import { outfitSlotKey } from '../../lib/slots'
import SidePanel from '../filters/SidePanel'
import AnchorListItem from '../filters/AnchorListItem'

function TournamentGroup({ name, count, children }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-ink mb-1.5 px-4">
        {name}
        <span className="text-muted font-normal ml-1.5">({count})</span>
      </p>
      {children}
    </div>
  );
}

function ExpandedContent({ items, onHighlight }) {
  const byTournament = {};
  for (const item of items) {
    if (!byTournament[item.tournament]) byTournament[item.tournament] = {};
    if (!byTournament[item.tournament][item.discipline]) {
      byTournament[item.tournament][item.discipline] = [];
    }
    byTournament[item.tournament][item.discipline].push(item);
  }
  const tournaments = sortTournaments(Object.keys(byTournament));
  const total = items.length;

  return (
    <>
      <p className="text-sm text-muted mb-4 px-4 flex-shrink-0">
        {total} missing round{total !== 1 ? "s" : ""} across{" "}
        {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""}
      </p>
      {tournaments.map((t) => {
        const disciplineMap = byTournament[t];
        const tTotal = Object.values(disciplineMap).reduce(
          (s, arr) => s + arr.length,
          0,
        );
        return (
          <TournamentGroup key={t} name={t} count={tTotal}>
            {Object.keys(disciplineMap).map((d) => {
              const dItems = disciplineMap[d]
                .slice()
                .sort(
                  (a, b) => a.year - b.year || a.roundNumber - b.roundNumber,
                );
              return (
                <div key={d} className="ml-3 mb-2">
                  <p className="text-sm uppercase tracking-widest text-muted/50 mb-1 px-4">
                    {d}
                  </p>
                  {dItems.map((item) => (
                    <AnchorListItem
                      key={outfitSlotKey(item)}
                      onClick={() => onHighlight(item)}
                    >
                      {item.year} · {item.round}
                    </AnchorListItem>
                  ))}
                </div>
              );
            })}
          </TournamentGroup>
        );
      })}
    </>
  );
}

export default function MissingPanel({ expandedItems, onHighlight, onClose }) {
  return (
    <SidePanel title="Outfits yet to find" onClose={onClose} bodyClassName="py-4">
      {expandedItems.length === 0 ? (
        <p className="text-sm text-brand px-4">All rounds documented!</p>
      ) : (
        <ExpandedContent items={expandedItems} onHighlight={onHighlight} />
      )}
    </SidePanel>
  );
}
