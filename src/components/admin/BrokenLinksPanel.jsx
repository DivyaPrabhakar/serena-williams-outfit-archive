import { useState, useEffect } from 'react'
import { isGettyEmbed } from '../../lib/imageUtils'
import { filterByQuery } from '../../lib/adminUtils'
import { useRowSelection } from '../../hooks/useRowSelection'
import TabSearch from './TabSearch'
import OutfitRow from './OutfitRow'
import SelectionBar from './SelectionBar'
import ListHeader from './ListHeader'

function checkImageUrl(url) {
  if (!url) return Promise.resolve(false)
  if (isGettyEmbed(url)) return Promise.resolve(true)
  return new Promise(resolve => {
    const img = new Image()
    img.onload  = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
    setTimeout(() => resolve(false), 15_000)
  })
}

export default function BrokenLinksPanel({ outfits, onEdit, onDelete, onDeleteMany }) {
  const [status,  setStatus]  = useState({})
  const [checked, setChecked] = useState(0)
  const [running, setRunning] = useState(false)
  const [search,  setSearch]  = useState('')
  const { selected, toggle, setAll, clear } = useRowSelection()

  const run = () => {
    setStatus({})
    setChecked(0)
    setSearch('')
    clear()
    setRunning(true)
    outfits.forEach(o => {
      checkImageUrl(o.imageUrl).then(ok => {
        setStatus(prev => ({ ...prev, [o.id]: ok ? 'ok' : 'broken' }))
        setChecked(n => n + 1)
      })
    })
  }

  useEffect(() => {
    if (running && checked >= outfits.length) setRunning(false)
  }, [checked, outfits.length, running])

  const done    = !running && checked > 0
  const broken  = outfits.filter(o => status[o.id] === 'broken')
  const visible = filterByQuery(broken, search)
  const allSelected = visible.length > 0 && visible.every(o => selected.has(o.id))

  const handleBulkDelete = async () => {
    await onDeleteMany([...selected])
    clear()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={run}
          disabled={running}
          className="text-xs border border-[#333] text-[#8A877F] px-4 py-2 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {running ? `Checking ${checked} / ${outfits.length}…` : done ? 'Re-check' : 'Check All URLs'}
        </button>
        {done && (
          <p className="text-xs text-[#8A877F] uppercase tracking-wide">
            {broken.length === 0 ? 'All links valid' : `${broken.length} broken`}
          </p>
        )}
      </div>

      {done && broken.length > 0 && (
        <>
          <TabSearch value={search} onChange={setSearch} />
          <ListHeader
            shown={visible.length}
            total={broken.length}
            suffix="entries"
            selectable={visible.length > 0}
            allSelected={allSelected}
            onToggleAll={on => setAll(visible.map(o => o.id), on)}
          />
          <SelectionBar count={selected.size} onDelete={handleBulkDelete} onClear={clear} />
          <div className="flex flex-col gap-px">
            {visible.map(o => (
              <OutfitRow key={o.id} o={o} onEdit={onEdit} onDelete={onDelete}
                selectable selected={selected.has(o.id)} onToggleSelect={toggle}>
                <p className="text-xs text-red-400 truncate mt-0.5">{o.imageUrl || '(no URL)'}</p>
              </OutfitRow>
            ))}
          </div>
        </>
      )}

      {done && broken.length === 0 && (
        <p className="text-[#555] text-sm">No broken image links found.</p>
      )}
    </div>
  )
}
