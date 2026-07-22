import { filterByQuery } from '../../lib/adminUtils'
import { useRowSelection } from '../../hooks/useRowSelection'
import OutfitRow from './OutfitRow'
import SelectionBar from './SelectionBar'

const ROUND_ORDER = ['R1', 'R2', 'R3', 'R4', 'QF', 'SF', 'F']

export default function EntriesList({ outfits, onEdit, onDelete, onDeleteMany, search = '', onSearchChange }) {
  const { selected, toggle, setAll, clear } = useRowSelection()
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

  const allSelected = filtered.length > 0 && filtered.every(o => selected.has(o.id))

  const handleBulkDelete = async () => {
    await onDeleteMany([...selected])
    clear()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange?.(e.target.value)}
        placeholder="Search by tournament, year, discipline, round…"
        className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
      />

      {/* Count + select-all */}
      <div className="flex items-center gap-3">
        <p className="text-xs text-[#8A877F] tracking-wide uppercase">
          {filtered.length} / {outfits.length} entries
        </p>
        {filtered.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs text-[#8A877F] cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={e => setAll(filtered.map(o => o.id), e.target.checked)}
              className="w-4 h-4 accent-[#C9A84C] cursor-pointer"
            />
            Select all
          </label>
        )}
      </div>

      <SelectionBar count={selected.size} onDelete={handleBulkDelete} onClear={clear} />

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-[#555] text-sm py-4">
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
                      className="text-[10px] text-[#555] border border-[#252525] px-1.5 py-0.5"
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
