import { useState } from 'react'
import { filterByQuery } from '../../lib/adminUtils'
import TabSearch from './TabSearch'
import OutfitRow from './OutfitRow'

export default function OutfitAuditPanel({ outfits, onEdit, onDelete, filter, countSuffix, emptyMessage, renderExtra }) {
  const [search, setSearch] = useState('')
  const list    = outfits.filter(filter)
  const visible = filterByQuery(list, search)

  return (
    <div className="flex flex-col gap-3">
      <TabSearch value={search} onChange={setSearch} />
      <p className="text-xs text-[#8A877F] uppercase tracking-wide">
        {visible.length} / {list.length} {countSuffix}
      </p>
      {list.length === 0 ? (
        <p className="text-[#555] text-sm">{emptyMessage}</p>
      ) : visible.length === 0 ? (
        <p className="text-[#555] text-sm">No results.</p>
      ) : (
        <div className="flex flex-col gap-px">
          {visible.map(o => (
            <OutfitRow key={o.id} o={o} onEdit={onEdit} onDelete={onDelete}>
              {renderExtra?.(o)}
            </OutfitRow>
          ))}
        </div>
      )}
    </div>
  )
}
