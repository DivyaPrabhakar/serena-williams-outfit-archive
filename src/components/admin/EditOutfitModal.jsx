import { useState } from 'react'
import { GRAND_SLAMS, OLYMPICS_YEARS, ROUND_SEQUENCE, COLOR_MAP, OUTFIT_BRANDS } from '../../lib/constants'
import { PickerBtn, FieldLabel, InlineError } from './adminFormPrimitives'
import { useOutfitForm, MIXED_SLAMS } from '../../hooks/useOutfitForm'
import { isGettyEmbed } from '../../lib/imageUtils'
import ImageInputField from './ImageInputField'

const COLORS = Object.keys(COLOR_MAP)

function isOtherTournament(t) {
  return t && !GRAND_SLAMS.includes(t) && t !== 'Olympics'
}

export default function EditOutfitModal({ outfit, onSave, onClose }) {
  const isOther         = isOtherTournament(outfit.tournament)
  const existingIsGetty = isGettyEmbed(outfit.imageUrl)

  const {
    f, set, errors, setErrors,
    yearNum, effectiveTournament,
    availableDisciplines, validRounds,
    handleGettyEmbed, handleImageUrl,
    toggleColor, validate,
  } = useOutfitForm({
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

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setErrors({})

    try {
      await onSave({
        ...outfit,
        imageUrl:    f.gettyEmbed.trim() || f.imageUrl.trim() || outfit.imageUrl,
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

          {/* Image */}
          <ImageInputField
            gettyEmbed={f.gettyEmbed}
            imageUrl={f.imageUrl}
            focalPoint={f.focal_point}
            errors={errors}
            onGettyEmbed={handleGettyEmbed}
            onImageUrl={handleImageUrl}
            onFocalPoint={fp => set('focal_point', fp)}
          />

          {/* Year */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Year</FieldLabel>
            <input
              type="number"
              value={f.year}
              onChange={e => set('year', e.target.value)}
              onWheel={e => e.target.blur()}
              min="1990"
              max="2030"
              className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <InlineError msg={errors.year} />
          </div>

          {/* Tournament */}
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

          {/* Round */}
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

          {/* Discipline */}
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

          {/* Color */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Primary Color</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <PickerBtn key={color} active={f.colors.includes(color)} onClick={() => toggleColor(color)}>
                  <span
                    className="w-2.5 h-2.5 rounded-sm inline-block mr-1.5 flex-shrink-0 align-middle"
                    style={{ background: COLOR_MAP[color] }}
                  />
                  {color}
                </PickerBtn>
              ))}
            </div>
          </div>

          {/* Brand */}
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

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={f.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a] resize-y"
            />
          </div>

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
