import { useState } from 'react'
import AdminLogin      from '../components/admin/AdminLogin'
import AddOutfitForm   from '../components/admin/AddOutfitForm'
import EditOutfitModal from '../components/admin/EditOutfitModal'
import EntriesList     from '../components/admin/EntriesList'
import BackfillPanel   from '../components/admin/BackfillPanel'
import { useOutfits }  from '../hooks/useOutfits'

export default function AdminPage() {
  const [adminToken,    setAdminToken]    = useState(null)
  const [editingOutfit, setEditingOutfit] = useState(null)

  const { outfits, loading, error, insert, update, remove } = useOutfits(adminToken)

  if (!adminToken) {
    return <AdminLogin onSuccess={setAdminToken} />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#F0EDE6]">
            Gallery Admin
          </h2>
          <p className="text-[#8A877F] text-sm mt-0.5">
            {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} in the Fit-dex
          </p>
        </div>
        <button
          onClick={() => setAdminToken(null)}
          className="text-xs text-[#555] hover:text-[#8A877F] transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left — Add form */}
        <div className="bg-[#1A1A1A] border border-[#2a2a2a] p-6">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-[#F0EDE6] mb-5">
            Add Outfit
          </h3>
          <AddOutfitForm onAdd={insert} />
        </div>

        {/* Right — Entries list */}
        <div className="bg-[#1A1A1A] border border-[#2a2a2a] p-6">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-[#F0EDE6] mb-5">
            All Entries
          </h3>
          {loading ? (
            <p className="text-[#555] text-sm">Loading…</p>
          ) : (
            <EntriesList
              outfits={outfits}
              onEdit={setEditingOutfit}
              onDelete={remove}
            />
          )}
        </div>
      </div>

      {/* Backfill panel — only shown when legacy outfits exist */}
      {!loading && (
        <BackfillPanel adminToken={adminToken} totalOutfits={outfits.length} />
      )}

      {/* Edit modal — keyed so it remounts fresh for each outfit */}
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
