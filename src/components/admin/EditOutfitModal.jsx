import { useState } from 'react'
import { GRAND_SLAMS } from '../../lib/constants'
import { InlineError } from './adminFormPrimitives'
import { useOutfitForm } from '../../hooks/useOutfitForm'
import { isGettyEmbed } from '../../lib/imageUtils'
import OutfitFormFields from './OutfitFormFields'

function isOtherTournament(t) {
  return t && !GRAND_SLAMS.includes(t) && t !== 'Olympics'
}

export default function EditOutfitModal({ outfit, onSave, onClose }) {
  const isOther         = isOtherTournament(outfit.tournament)
  const existingIsGetty = isGettyEmbed(outfit.imageUrl)

  const form = useOutfitForm({
    gettyEmbed:      existingIsGetty ? (outfit.imageUrl ?? '') : '',
    imageUrl:        !existingIsGetty ? (outfit.imageUrl ?? '') : '',
    focal_point:     outfit.focal_point ?? 'center',
    year:            String(outfit.year ?? ''),
    tournament:      isOther ? 'Other' : (outfit.tournament ?? ''),
    otherTournament: isOther ? outfit.tournament : '',
    discipline:      outfit.discipline  ?? '',
    round:           outfit.round       ?? '',
    colors:          outfit.colors      ?? [],
    notes:           outfit.notes       ?? '',
    brand:           outfit.brand       ?? null,
  })
  const { errors, setErrors, validate, buildOutfit } = form

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setErrors({})

    try {
      await onSave({ ...outfit, ...buildOutfit() })
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1A1A1A] border border-[#2a2a2a] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] sticky top-0 bg-[#1A1A1A]">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-[#F0EDE6]">
            Edit Outfit
          </h3>
          <button
            onClick={onClose}
            className="text-[#8A877F] hover:text-[#F0EDE6] transition-colors text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 p-6">
          <OutfitFormFields form={form} />
          <InlineError msg={errors.submit} />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#2a2a2a] sticky bottom-0 bg-[#1A1A1A]">
          <button
            onClick={onClose}
            className="flex-1 border border-[#333] text-[#8A877F] text-sm py-2.5 hover:border-[#555] hover:text-[#F0EDE6] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#C9A84C] text-[#0D0D0D] font-medium text-sm py-2.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
