import { sortTournaments } from '../../lib/filterUtils'
import FilterBtn from './FilterBtn'

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
