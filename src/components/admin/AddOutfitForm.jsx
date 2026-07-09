import { useState } from 'react'
import { GRAND_SLAMS, OLYMPICS_YEARS, ROUND_SEQUENCE, COLOR_MAP, OUTFIT_BRANDS } from '../../lib/constants'
import { PickerBtn, FieldLabel, InlineError } from './adminFormPrimitives'
import { useOutfitForm, MIXED_SLAMS } from '../../hooks/useOutfitForm'
import ImageInputField from './ImageInputField'
import ColorSwatch from '../ColorSwatch'

const COLORS = Object.keys(COLOR_MAP)

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

export default function AddOutfitForm({ onAdd, outfits = [] }) {
  const {
    f, set, errors, setErrors,
    yearNum, effectiveTournament,
    availableDisciplines, validRounds,
    handleGettyEmbed, handleImageUrl,
    toggleColor, validate, resetForm,
  } = useOutfitForm(EMPTY)

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setErrors({})

    try {
      await onAdd({
        imageUrl:    f.gettyEmbed.trim() || f.imageUrl.trim(),
        year:        yearNum,
        tournament:  effectiveTournament,
        discipline:  f.discipline,
        round:       f.round || null,
        roundNumber: f.round ? ROUND_SEQUENCE.indexOf(f.round) + 1 : null,
        colors:      f.colors,
        notes:       f.notes,
        focal_point: f.focal_point,
        brand:       f.brand,
      })
      resetForm()
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* 1. Image */}
      <ImageInputField
        gettyEmbed={f.gettyEmbed}
        imageUrl={f.imageUrl}
        focalPoint={f.focal_point}
        errors={errors}
        onGettyEmbed={handleGettyEmbed}
        onImageUrl={handleImageUrl}
        onFocalPoint={fp => set('focal_point', fp)}
      />

      {/* 2. Year */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Year</FieldLabel>
        <input
          type="number"
          value={f.year}
          onChange={e => set('year', e.target.value)}
          onWheel={e => e.target.blur()}
          placeholder="1999"
          min="1990"
          max="2030"
          className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <InlineError msg={errors.year} />
      </div>

      {/* 3. Tournament */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Tournament</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[...GRAND_SLAMS, 'Olympics', 'Other…'].map(t => {
            const val      = t === 'Other…' ? 'Other' : t
            const olympDis = val === 'Olympics' && (!yearNum || !OLYMPICS_YEARS.has(yearNum))
            return (
              <PickerBtn
                key={val}
                active={f.tournament === val}
                disabled={olympDis}
                onClick={() => set('tournament', val)}
              >
                {t}
              </PickerBtn>
            )
          })}
        </div>
        {f.tournament === 'Other' && (
          <input
            type="text"
            value={f.otherTournament}
            onChange={e => set('otherTournament', e.target.value)}
            placeholder="Tournament name…"
            className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
          />
        )}
        <InlineError msg={errors.tournament} />
      </div>

      {/* 4. Round */}
      {yearNum > 0 && effectiveTournament && (
        <div className="flex flex-col gap-2">
          <FieldLabel>Round</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {validRounds.map(r => (
              <PickerBtn key={r} active={f.round === r} onClick={() => set('round', r)}>
                {r}
              </PickerBtn>
            ))}
          </div>
          <InlineError msg={errors.round} />
        </div>
      )}

      {/* 5. Discipline */}
      {f.tournament && (
        <div className="flex flex-col gap-2">
          <FieldLabel>Discipline</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {availableDisciplines.map(d => (
              <PickerBtn key={d} active={f.discipline === d} onClick={() => set('discipline', d)}>
                {d}
              </PickerBtn>
            ))}
          </div>
          <InlineError msg={errors.discipline} />
        </div>
      )}

      {/* 6. Color */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Primary Color</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <PickerBtn key={color} active={f.colors.includes(color)} onClick={() => toggleColor(color)}>
              <ColorSwatch
                color={color}
                className="w-2.5 h-2.5 rounded-sm inline-block mr-1.5 flex-shrink-0 align-middle"
              />
              {color}
            </PickerBtn>
          ))}
        </div>
      </div>

      {/* 7. Brand */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Brand</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {OUTFIT_BRANDS.map(b => (
            <PickerBtn key={b} active={f.brand === b} onClick={() => set('brand', f.brand === b ? null : b)}>
              {b}
            </PickerBtn>
          ))}
        </div>
      </div>

      {/* 8. Notes */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Notes</FieldLabel>
        <textarea
          value={f.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="e.g. Nike catsuit, worn during pregnancy comeback…"
          rows={3}
          className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a] resize-y"
        />
      </div>

      {/* 9. Submit */}
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
