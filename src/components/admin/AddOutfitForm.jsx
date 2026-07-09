import { useState } from 'react'
import { InlineError } from './adminFormPrimitives'
import { useOutfitForm } from '../../hooks/useOutfitForm'
import OutfitFormFields from './OutfitFormFields'

const EMPTY = {
  gettyEmbed:      '',
  imageUrl:        '',
  focal_point:     'center',
  year:            '',
  tournament:      '',
  otherTournament: '',
  discipline:      '',
  round:           '',
  colors:          [],
  notes:           '',
  brand:           null,
}

export default function AddOutfitForm({ onAdd }) {
  const form = useOutfitForm(EMPTY)
  const { errors, setErrors, validate, resetForm, buildOutfit } = form

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setErrors({})

    try {
      await onAdd(buildOutfit())
      resetForm()
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <OutfitFormFields form={form} />

      <InlineError msg={errors.submit} />
      <button
        type="submit"
        disabled={submitting}
        className="bg-[#C9A84C] text-[#0D0D0D] font-medium text-sm py-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? 'Adding…' : 'Add to Gallery'}
      </button>
    </form>
  )
}
