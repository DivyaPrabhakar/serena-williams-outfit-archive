import { useState } from 'react'
import { isGettyEmbed } from '../../lib/imageUtils'
import { filterByQuery } from '../../lib/adminUtils'
import TabSearch from './TabSearch'
import OutfitThumbnail from './OutfitThumbnail'

export default function CloudinaryMigrationPanel({ outfits, onUpdate }) {
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
              <div className="flex items-center gap-3 px-3 py-2.5">
                <OutfitThumbnail o={o} />
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
