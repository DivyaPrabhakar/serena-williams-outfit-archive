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
      <div className="bg-dark2 border-2 border-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-white sticky top-0 bg-dark2">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-ink">
            Edit Outfit
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors text-lg leading-none cursor-pointer"
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
        <div className="flex gap-3 px-6 py-4 border-t-2 border-white sticky bottom-0 bg-dark2">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-white text-muted text-sm py-2.5 hover:border-dim hover:text-ink transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-brand text-dark font-medium text-sm py-2.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
