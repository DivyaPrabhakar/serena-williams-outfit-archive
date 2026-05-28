import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLogin      from '../components/admin/AdminLogin'
import AddOutfitForm   from '../components/admin/AddOutfitForm'
import EditOutfitModal from '../components/admin/EditOutfitModal'
import EntriesList     from '../components/admin/EntriesList'
import BackfillPanel   from '../components/admin/BackfillPanel'
import { useOutfits }  from '../hooks/useOutfits'
import { filterByQuery } from '../lib/adminUtils'
import { isGettyEmbed } from '../components/admin/AddOutfitForm'

const TABS = [
  { id: 'upload',    label: 'Upload' },
  { id: 'migrate',   label: 'Migrate Cloudinary' },
  { id: 'broken',    label: 'Broken Links' },
  { id: 'no-colors', label: 'Needs Colors' },
  { id: 'no-image',  label: 'No Image' },
  { id: 'no-round',  label: 'No Round' },
  { id: 'no-brand',  label: 'No Brand' },
  { id: 'search',    label: 'All Entries' },
]

function TabSearch({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search by tournament, year, discipline, round…"
      className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
    />
  )
}

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

function OutfitRow({ o, onEdit, onDelete, children }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#111]">
      <img
        src={o.imageUrl}
        alt=""
        className="w-10 h-14 object-cover flex-shrink-0 bg-[#222]"
        onError={e => { e.target.style.opacity = '0.2' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F0EDE6] truncate">
          {o.year} {o.tournament}
          {o.discipline && <span className="text-[#8A877F]"> · {o.discipline}</span>}
          {o.round      && <span className="text-[#8A877F]"> · {o.round}</span>}
        </p>
        {children}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => onEdit(o)}
          className="text-xs border border-[#333] text-[#8A877F] px-2.5 py-1 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={() => window.confirm('Delete this outfit?') && onDelete(o.id)}
          className="text-xs border border-[#333] text-[#8A877F] px-2.5 py-1 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          Del
        </button>
      </div>
    </div>
  )
}

function CloudinaryMigrationPanel({ outfits, onUpdate }) {
  const [search, setSearch] = useState('')
  const [embeds, setEmbeds] = useState({})
  const [saving, setSaving] = useState({})
  const [saved,  setSaved]  = useState({})
  const [errors, setErrors] = useState({})

  const cloudinary = outfits.filter(o => o.imageUrl?.includes('cloudinary.com'))
  const visible    = filterByQuery(cloudinary, search)

  const handleEmbed = (id, val) => {
    setEmbeds(prev => ({ ...prev, [id]: val }))
    setSaved(prev  => ({ ...prev, [id]: false }))
    setErrors(prev => ({ ...prev, [id]: undefined }))
  }

  const handleSave = async (outfit) => {
    const embed = embeds[outfit.id]?.trim()
    if (!embed) {
      setErrors(prev => ({ ...prev, [outfit.id]: 'Paste a Getty embed code first' }))
      return
    }
    if (!isGettyEmbed(embed)) {
      setErrors(prev => ({ ...prev, [outfit.id]: 'Does not look like a Getty embed — check the code' }))
      return
    }
    setSaving(prev => ({ ...prev, [outfit.id]: true }))
    try {
      await onUpdate({ ...outfit, imageUrl: embed })
      setSaved(prev => ({ ...prev, [outfit.id]: true }))
    } catch (err) {
      setErrors(prev => ({ ...prev, [outfit.id]: err.message }))
    } finally {
      setSaving(prev => ({ ...prev, [outfit.id]: false }))
    }
  }

  if (cloudinary.length === 0) {
    return <p className="text-[#555] text-sm">All Cloudinary images have been migrated.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8A877F] uppercase tracking-wide">
          {cloudinary.length} Cloudinary {cloudinary.length === 1 ? 'image' : 'images'} remaining
        </p>
      </div>

      <TabSearch value={search} onChange={setSearch} />

      {visible.length === 0 ? (
        <p className="text-[#555] text-sm">No results.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(o => (
            <div key={o.id} className="border border-[#2a2a2a] bg-[#111]">
              {/* Outfit header */}
              <div className="flex items-center gap-3 px-3 py-2.5">
                <img
                  src={o.imageUrl}
                  alt=""
                  className="w-10 h-14 object-cover flex-shrink-0 bg-[#222]"
                  onError={e => { e.target.style.opacity = '0.15' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F0EDE6] truncate">
                    {o.year} {o.tournament}
                    {o.discipline && <span className="text-[#8A877F]"> · {o.discipline}</span>}
                    {o.round      && <span className="text-[#8A877F]"> · {o.round}</span>}
                  </p>
                  <p className="text-[10px] text-[#3a3a3a] truncate mt-0.5">{o.imageUrl}</p>
                </div>
                {saved[o.id] && (
                  <span className="text-xs text-green-500 flex-shrink-0">✓ Updated</span>
                )}
              </div>

              {/* Getty embed input */}
              <div className="border-t border-[#1e1e1e] px-3 pb-3 pt-2.5 flex flex-col gap-2">
                <textarea
                  value={embeds[o.id] ?? ''}
                  onChange={e => handleEmbed(o.id, e.target.value)}
                  placeholder="Paste Getty embed code here…"
                  rows={3}
                  className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-xs outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a] resize-y font-mono"
                />
                {errors[o.id] && (
                  <p className="text-xs text-red-400">{errors[o.id]}</p>
                )}
                {embeds[o.id]?.trim() && isGettyEmbed(embeds[o.id]) && (
                  <p className="text-[10px] text-[#8A877F]">
                    Getty embed detected
                    {(() => { const m = embeds[o.id].match(/items:'(\d+)'/) ; return m ? ` — asset #${m[1]}` : '' })()}
                  </p>
                )}
                <button
                  onClick={() => handleSave(o)}
                  disabled={saving[o.id]}
                  className="self-end text-xs border border-[#C9A84C] text-[#C9A84C] px-4 py-1.5 hover:bg-[#C9A84C]/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving[o.id] ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BrokenLinksPanel({ outfits, onEdit, onDelete }) {
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

function OutfitAuditPanel({ outfits, onEdit, onDelete, filter, countSuffix, emptyMessage, renderExtra }) {
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

export default function AdminPage() {
  const [adminToken,    setAdminToken]    = useState(null)
  const [editingOutfit, setEditingOutfit] = useState(null)
  const [searchParams,  setSearchParams]  = useSearchParams()

  const { outfits, loading, error, insert, update, remove } = useOutfits(adminToken)

  const tab   = searchParams.get('tab') || 'upload'
  const query = searchParams.get('q')   || ''

  const setTab = (id) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', id)
      if (id !== 'search') next.delete('q')
      return next
    })

  const setQuery = (q) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      q ? next.set('q', q) : next.delete('q')
      return next
    })

  if (!adminToken) return <AdminLogin onSuccess={setAdminToken} />

  const renderTab = () => {
    if (loading) return <p className="text-[#555] text-sm">Loading…</p>
    switch (tab) {
      case 'upload':
        return <AddOutfitForm onAdd={insert} outfits={outfits} />
      case 'migrate':
        return <CloudinaryMigrationPanel outfits={outfits} onUpdate={update} />
      case 'broken':
        return <BrokenLinksPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove} />
      case 'no-colors':
        return <OutfitAuditPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove}
          filter={o => !o.colors?.length} countSuffix="without colors" emptyMessage="All outfits have colors assigned." />
      case 'no-image':
        return <OutfitAuditPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove}
          filter={o => !o.imageUrl} countSuffix="without any image" emptyMessage="All outfits have images."
          renderExtra={o => <p className="text-xs text-[#555] truncate mt-0.5">{o.imageUrl || '(no image)'}</p>} />
      case 'no-round':
        return <OutfitAuditPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove}
          filter={o => !o.round} countSuffix="without round" emptyMessage="All outfits have a round assigned." />
      case 'no-brand':
        return <OutfitAuditPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove}
          filter={o => !o.brand} countSuffix="without brand" emptyMessage="All outfits have a brand assigned."
          renderExtra={o => <p className="text-xs text-[#555] mt-0.5">{o.year}</p>} />
      case 'search':
        return (
          <EntriesList
            outfits={outfits}
            search={query}
            onSearchChange={setQuery}
            onEdit={setEditingOutfit}
            onDelete={remove}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#F0EDE6]">
            Gallery Admin
          </h2>
          {!loading && (
            <p className="text-[#8A877F] text-sm mt-0.5">
              {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} in the Fit-dex
            </p>
          )}
        </div>
        <button
          onClick={() => setAdminToken(null)}
          className="text-xs text-[#555] hover:text-[#8A877F] transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-[#2a2a2a] mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-xs uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t.id
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-[#555] hover:text-[#8A877F]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-[#1A1A1A] border border-[#2a2a2a] p-6">
        {renderTab()}
      </div>

      {!loading && (
        <BackfillPanel adminToken={adminToken} totalOutfits={outfits.length} />
      )}

      {editingOutfit && (
        <EditOutfitModal
          key={editingOutfit.id}
          outfit={editingOutfit}
          onSave={async (updated) => {
            await update(updated)
            setEditingOutfit(null)
          }}
          onClose={() => setEditingOutfit(null)}
        />
      )}
    </div>
  )
}
