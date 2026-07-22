import { useState } from 'react'
import { filterByQuery } from '../../lib/adminUtils'
import { useRowSelection } from '../../hooks/useRowSelection'
import TabSearch from './TabSearch'
import OutfitRow from './OutfitRow'
import SelectionBar from './SelectionBar'
import ListHeader from './ListHeader'

export default function OutfitAuditPanel({ outfits, onEdit, onDelete, onDeleteMany, filter, countSuffix, emptyMessage, renderExtra }) {
  const [search, setSearch] = useState('')
  const list    = outfits.filter(filter)
  const visible = filterByQuery(list, search)
  const { selected, toggle, clear, allSelected, toggleAll, removeSelected } =
    useRowSelection(visible.map(o => o.id), onDeleteMany)

  return (
    <div className="flex flex-col gap-3">
      <TabSearch value={search} onChange={setSearch} />
      <ListHeader
        shown={visible.length}
        total={list.length}
        suffix={countSuffix}
        selectable={visible.length > 0}
        allSelected={allSelected}
        onToggleAll={toggleAll}
      />
      <SelectionBar count={selected.size} onDelete={removeSelected} onClear={clear} />
      {list.length === 0 ? (
        <p className="text-[#555] text-sm">{emptyMessage}</p>
      ) : visible.length === 0 ? (
        <p className="text-[#555] text-sm">No results.</p>
      ) : (
        <div className="flex flex-col gap-px">
          {visible.map(o => (
            <OutfitRow key={o.id} o={o} onEdit={onEdit} onDelete={onDelete}
              selectable selected={selected.has(o.id)} onToggleSelect={toggle}>
              {renderExtra?.(o)}
            </OutfitRow>
          ))}
        </div>
      )}
    </div>
  )
}
