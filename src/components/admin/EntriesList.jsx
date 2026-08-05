import { filterByQuery } from '../../lib/adminUtils'
import { useRowSelection } from '../../hooks/useRowSelection'
import OutfitRow from './OutfitRow'
import SelectionBar from './SelectionBar'
import ListHeader from './ListHeader'
import TabSearch from './TabSearch'

const ROUND_ORDER = ['R1', 'R2', 'R3', 'R4', 'QF', 'SF', 'F']

export default function EntriesList({ outfits, onEdit, onDelete, onDeleteMany, search = '', onSearchChange }) {
  const filtered = filterByQuery(outfits, search)
    .sort((a, b) => {
      const tCmp = (a.tournament ?? '').localeCompare(b.tournament ?? '')
      if (tCmp !== 0) return tCmp
      const yCmp = (a.year ?? 0) - (b.year ?? 0)
      if (yCmp !== 0) return yCmp
      const aRound = ROUND_ORDER.indexOf(a.round ?? '')
      const bRound = ROUND_ORDER.indexOf(b.round ?? '')
      return (aRound === -1 ? 99 : aRound) - (bRound === -1 ? 99 : bRound)
    })

  const { selected, toggle, clear, allSelected, toggleAll, removeSelected } =
    useRowSelection(filtered.map(o => o.id), onDeleteMany)

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <TabSearch value={search} onChange={v => onSearchChange?.(v)} />

      {/* Count + select-all */}
      <ListHeader
        shown={filtered.length}
        total={outfits.length}
        suffix="entries"
        selectable={filtered.length > 0}
        allSelected={allSelected}
        onToggleAll={toggleAll}
      />

      <SelectionBar count={selected.size} onDelete={removeSelected} onClear={clear} />

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-dim text-sm py-4">
          {search.trim() ? 'No results.' : 'No outfits added yet.'}
        </p>
      ) : (
        <div className="flex flex-col gap-px">
          {filtered.map(o => (
            <OutfitRow
              key={o.id}
              o={o}
              onEdit={onEdit}
              onDelete={onDelete}
              selectable
              selected={selected.has(o.id)}
              onToggleSelect={toggle}
            >
              {o.colors?.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {o.colors.map(c => (
                    <span
                      key={c}
                      className="text-[10px] text-dim border-2 border-white px-1.5 py-0.5"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </OutfitRow>
          ))}
        </div>
      )}
    </div>
  )
}
