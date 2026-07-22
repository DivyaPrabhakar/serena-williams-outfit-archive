import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLogin               from '../components/admin/AdminLogin'
import AddOutfitForm            from '../components/admin/AddOutfitForm'
import EditOutfitModal          from '../components/admin/EditOutfitModal'
import EntriesList              from '../components/admin/EntriesList'
import BackfillPanel            from '../components/admin/BackfillPanel'
import CloudinaryMigrationPanel from '../components/admin/CloudinaryMigrationPanel'
import BrokenLinksPanel         from '../components/admin/BrokenLinksPanel'
import OutfitAuditPanel         from '../components/admin/OutfitAuditPanel'
import DisplaySettingsPanel     from '../components/admin/DisplaySettingsPanel'
import RebuildStatusPanel       from '../components/admin/RebuildStatusPanel'
import { useOutfits }           from '../hooks/useOutfits'
import Seo                       from '../lib/seo'

const ADMIN_SEO = (
  <Seo title="Admin — Serena Williams Fit-dex" description="Private admin area." path="/admin" noindex />
)

const TABS = [
  { id: 'upload',    label: 'Upload' },
  { id: 'migrate',   label: 'Migrate Cloudinary' },
  { id: 'broken',    label: 'Broken Links' },
  { id: 'no-colors', label: 'Needs Colors' },
  { id: 'no-image',  label: 'No Image' },
  { id: 'no-round',  label: 'No Round' },
  { id: 'no-brand',  label: 'No Brand' },
  { id: 'search',    label: 'All Entries' },
  { id: 'display',   label: 'Display' },
]

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

  if (!adminToken) return <>{ADMIN_SEO}<AdminLogin onSuccess={setAdminToken} /></>

  const renderTab = () => {
    if (loading && outfits.length === 0) return <p className="text-[#555] text-sm">Loading…</p>
    switch (tab) {
      case 'upload':
        return <AddOutfitForm onAdd={insert} />
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
      case 'display':
        return <DisplaySettingsPanel />
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
      {ADMIN_SEO}
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

      <RebuildStatusPanel adminToken={adminToken} />

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
