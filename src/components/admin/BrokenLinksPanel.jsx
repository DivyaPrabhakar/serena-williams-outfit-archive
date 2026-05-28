import { useState, useEffect } from 'react'
import { isGettyEmbed } from '../../lib/imageUtils'
import { filterByQuery } from '../../lib/adminUtils'
import TabSearch from './TabSearch'
import OutfitRow from './OutfitRow'

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

export default function BrokenLinksPanel({ outfits, onEdit, onDelete }) {
  const [status,  setStatus]  = useState({})
  const [checked, setChecked] = useState(0)
  const [running, setRunning] = useState(false)
  const [search,  setSearch]  = useState('')

  const run = () => {
    setStatus({})
    setChecked(0)
    setSearch('')
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
          <p className="text-xs text-[#8A877F] uppercase tracking-wide">
            {visible.length} / {broken.length} entries
          </p>
          <div className="flex flex-col gap-px">
            {visible.map(o => (
              <OutfitRow key={o.id} o={o} onEdit={onEdit} onDelete={onDelete}>
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
