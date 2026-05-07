import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLogin      from '../components/admin/AdminLogin'
import AddOutfitForm   from '../components/admin/AddOutfitForm'
import EditOutfitModal from '../components/admin/EditOutfitModal'
import EntriesList     from '../components/admin/EntriesList'
import BackfillPanel   from '../components/admin/BackfillPanel'
import { useOutfits }  from '../hooks/useOutfits'

const TABS = [
  { id: 'upload',        label: 'Upload' },
  { id: 'broken',        label: 'Broken Links' },
  { id: 'no-colors',     label: 'Needs Colors' },
  { id: 'no-cloudinary', label: 'No Cloudinary URL' },
  { id: 'no-round',      label: 'No Round' },
  { id: 'search',        label: 'All Entries' },
]

function checkImageUrl(url) {
  if (!url) return Promise.resolve(false)
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

function BrokenLinksPanel({ outfits, onEdit, onDelete }) {
  const [status,  setStatus]  = useState({})
  const [checked, setChecked] = useState(0)
  const [running, setRunning] = useState(false)

  const run = () => {
    setStatus({})
    setChecked(0)
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

  const done   = !running && checked > 0
  const broken = outfits.filter(o => status[o.id] === 'broken')

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

      {broken.length > 0 && (
        <div className="flex flex-col gap-px">
          {broken.map(o => (
            <OutfitRow key={o.id} o={o} onEdit={onEdit} onDelete={onDelete}>
              <p className="text-xs text-red-400 truncate mt-0.5">{o.imageUrl || '(no URL)'}</p>
            </OutfitRow>
          ))}
        </div>
      )}

      {done && broken.length === 0 && (
        <p className="text-[#555] text-sm">No broken image links found.</p>
      )}
    </div>
  )
}

function NeedsColorsPanel({ outfits, onEdit, onDelete }) {
  const list = outfits.filter(o => !o.colors?.length)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[#8A877F] uppercase tracking-wide">
        {list.length} outfit{list.length !== 1 ? 's' : ''} without colors
      </p>
      {list.length === 0 ? (
        <p className="text-[#555] text-sm">All outfits have colors assigned.</p>
      ) : (
        <div className="flex flex-col gap-px">
          {list.map(o => <OutfitRow key={o.id} o={o} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}

function NoRoundPanel({ outfits, onEdit, onDelete }) {
  const list = outfits.filter(o => !o.round)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[#8A877F] uppercase tracking-wide">
        {list.length} outfit{list.length !== 1 ? 's' : ''} without round information
      </p>
      {list.length === 0 ? (
        <p className="text-[#555] text-sm">All outfits have a round assigned.</p>
      ) : (
        <div className="flex flex-col gap-px">
          {list.map(o => <OutfitRow key={o.id} o={o} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}

function NoCloudinaryPanel({ outfits, onEdit, onDelete }) {
  const list = outfits.filter(o => !o.imageUrl?.includes('cloudinary.com'))
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[#8A877F] uppercase tracking-wide">
        {list.length} outfit{list.length !== 1 ? 's' : ''} without a Cloudinary URL
      </p>
      {list.length === 0 ? (
        <p className="text-[#555] text-sm">All outfits use Cloudinary URLs.</p>
      ) : (
        <div className="flex flex-col gap-px">
          {list.map(o => (
            <OutfitRow key={o.id} o={o} onEdit={onEdit} onDelete={onDelete}>
              <p className="text-xs text-[#555] truncate mt-0.5">{o.imageUrl || '(no URL)'}</p>
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
      case 'broken':
        return <BrokenLinksPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove} />
      case 'no-colors':
        return <NeedsColorsPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove} />
      case 'no-cloudinary':
        return <NoCloudinaryPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove} />
      case 'no-round':
        return <NoRoundPanel outfits={outfits} onEdit={setEditingOutfit} onDelete={remove} />
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
