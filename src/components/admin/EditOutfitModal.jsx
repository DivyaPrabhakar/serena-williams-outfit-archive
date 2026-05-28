import { useState, useMemo, useEffect } from 'react'
import {
  GRAND_SLAMS, OLYMPICS_YEARS, ROUND_SEQUENCE, COLOR_MAP, OUTFIT_BRANDS,
} from '../../lib/constants'
import { getValidRounds, getRoundsForSlot } from '../../lib/rounds'
import { PickerBtn, FieldLabel, InlineError } from './adminFormPrimitives'
import { isGettyEmbed } from './AddOutfitForm'

const MIXED_SLAMS = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open']
const COLORS      = Object.keys(COLOR_MAP)

const BLOCKED_DOMAINS = ['facebook.com', 'fb.com', 'fbcdn.net', 'instagram.com', 'cdninstagram.com', 'instagr.am']

function isBlockedUrl(url) {
  try {
    const host = new URL(url).hostname
    return BLOCKED_DOMAINS.some(d => host === d || host.endsWith('.' + d))
  } catch {
    return false
  }
}

function isOtherTournament(t) {
  return t && !GRAND_SLAMS.includes(t) && t !== 'Olympics'
}

export default function EditOutfitModal({ outfit, onSave, onClose }) {
  // Initialise all state from the outfit prop (component is keyed by outfit.id)
  const isOther  = isOtherTournament(outfit.tournament)
  const existingIsGetty = isGettyEmbed(outfit.imageUrl)
  const [gettyEmbed,      setGettyEmbedState] = useState(existingIsGetty ? (outfit.imageUrl ?? '') : '')
  const [imageUrl,        setImageUrlState]   = useState(!existingIsGetty ? (outfit.imageUrl ?? '') : '')
  const [year,            setYear]            = useState(String(outfit.year ?? ''))
  const [tournament,      setTournament]      = useState(isOther ? 'Other' : (outfit.tournament ?? ''))
  const [otherTournament, setOtherTournament] = useState(isOther ? outfit.tournament : '')
  const [discipline,      setDiscipline]      = useState(outfit.discipline  ?? '')
  const [round,           setRound]           = useState(outfit.round       ?? '')
  const [colors,          setColors]          = useState(outfit.colors      ?? [])
  const [notes,           setNotes]           = useState(outfit.notes       ?? '')
  const [focalPoint,      setFocalPoint]      = useState(outfit.focal_point ?? 'center')
  const [brand,           setBrand]           = useState(outfit.brand       ?? null)
  const [saving,          setSaving]          = useState(false)
  const [errors,          setErrors]          = useState({})

  const yearNum             = parseInt(year) || 0
  const effectiveTournament = tournament === 'Other' ? otherTournament.trim() : tournament

  const availableDisciplines = useMemo(() => {
    if (!tournament) return []
    if (tournament === 'Olympics') return ['Singles', 'Doubles']
    if (MIXED_SLAMS.includes(tournament)) return ['Singles', 'Doubles', 'Mixed']
    return ['Singles', 'Doubles']
  }, [tournament])

  const validRounds = useMemo(() => {
    if (!effectiveTournament || !yearNum) return []
    if (discipline) {
      const rounds = getValidRounds(effectiveTournament, yearNum, discipline)
      return rounds.length > 0 ? rounds : ROUND_SEQUENCE
    }
    const max = Math.max(
      getRoundsForSlot(effectiveTournament, yearNum, 'Singles'),
      getRoundsForSlot(effectiveTournament, yearNum, 'Doubles'),
      getRoundsForSlot(effectiveTournament, yearNum, 'Mixed'),
      0,
    )
    return max > 0 ? ROUND_SEQUENCE.slice(0, max) : ROUND_SEQUENCE
  }, [discipline, effectiveTournament, yearNum])

  // Only clear discipline if it becomes unavailable (Mixed → Olympics)
  useEffect(() => {
    if (discipline === 'Mixed' && tournament === 'Olympics') setDiscipline('')
  }, [tournament])

  // Only clear round if it falls outside the newly computed valid range
  useEffect(() => {
    if (round && validRounds.length > 0 && !validRounds.includes(round)) setRound('')
  }, [validRounds])

  const handleGettyEmbed = (val) => {
    setGettyEmbedState(val)
    if (val.trim()) setImageUrlState('')
    setErrors(prev => ({ ...prev, image: undefined, imageUrl: undefined }))
  }

  const handleImageUrl = (url) => {
    setImageUrlState(url)
    if (url.trim()) setGettyEmbedState('')
    setErrors(prev => ({ ...prev, image: undefined, imageUrl: undefined }))
  }

  const validate = () => {
    const e = {}
    const hasGetty = !!gettyEmbed.trim()
    const hasUrl   = !!imageUrl.trim()
    if (!hasGetty && !hasUrl)                 e.image    = 'Image is required'
    if (hasUrl && isBlockedUrl(imageUrl.trim())) e.imageUrl = 'Facebook and Instagram links are not supported'
    if (!year || !yearNum)                    e.year       = 'Year is required'
    if (!tournament)                          e.tournament = 'Tournament is required'
    if (tournament === 'Other' && !otherTournament.trim()) e.tournament = 'Tournament name is required'
    if (!discipline)                          e.discipline = 'Discipline is required'
    if (!round)                               e.round      = 'Round is required'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setErrors({})

    try {
      const finalUrl = gettyEmbed.trim() || imageUrl.trim() || outfit.imageUrl

      await onSave({
        ...outfit,
        imageUrl:    finalUrl,
        year:        yearNum,
        tournament:  effectiveTournament,
        discipline,
        round,
        roundNumber: ROUND_SEQUENCE.indexOf(round) + 1,
        colors,
        notes,
        focal_point: focalPoint,
        brand,
      })
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSaving(false)
    }
  }

  const toggleColor = (color) =>
    setColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color],
    )

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
          <div className="flex flex-col gap-3">
            <FieldLabel>Image</FieldLabel>

            {/* Getty embed */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Getty Embed Code</FieldLabel>
              <textarea
                value={gettyEmbed}
                onChange={e => handleGettyEmbed(e.target.value)}
                placeholder="Paste the embed code from Getty Images…"
                rows={4}
                className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a] resize-y font-mono"
              />
              {gettyEmbed.trim() && (
                <p className="text-xs text-[#8A877F]">
                  Getty embed detected
                  {(() => { const m = gettyEmbed.match(/items:'(\d+)'/) ; return m ? ` — asset #${m[1]}` : '' })()}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-[#2a2a2a]" />
              <span className="text-[10px] text-[#3a3a3a] uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-[#2a2a2a]" />
            </div>

            {/* Direct image URL */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Image URL</FieldLabel>
              <input
                type="url"
                value={imageUrl}
                onChange={e => handleImageUrl(e.target.value)}
                placeholder="https://… (from a news or sports site)"
                className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
              />
              <p className="text-[10px] text-[#3a3a3a]">Facebook and Instagram links are not supported</p>
              <InlineError msg={errors.imageUrl} />
              {imageUrl.trim() && !isBlockedUrl(imageUrl.trim()) && (
                <img
                  src={imageUrl.trim()}
                  alt="Preview"
                  className="max-h-40 max-w-full object-contain border border-[#2a2a2a] bg-[#111]"
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
            </div>

            <InlineError msg={errors.image} />

            {/* Focal point */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Focal Point</FieldLabel>
              <div className="flex gap-0">
                {['left', 'center', 'right'].map((fp, i) => (
                  <button
                    key={fp}
                    type="button"
                    onClick={() => setFocalPoint(fp)}
                    className={`px-4 py-1.5 text-xs border transition-colors capitalize ${
                      i === 0 ? '' : '-ml-px'
                    } ${
                      focalPoint === fp
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C] z-10 relative'
                        : 'border-[#2a2a2a] text-[#8A877F] hover:border-[#C9A84C] hover:text-[#C9A84C] cursor-pointer'
                    }`}
                  >
                    {fp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Year */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Year</FieldLabel>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
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
                    active={tournament === val}
                    disabled={olympDis}
                    onClick={() => setTournament(val)}
                  >
                    {t}
                  </PickerBtn>
                )
              })}
            </div>
            {tournament === 'Other' && (
              <input
                type="text"
                value={otherTournament}
                onChange={e => setOtherTournament(e.target.value)}
                placeholder="Tournament name…"
                className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
              />
            )}
            <InlineError msg={errors.tournament} />
          </div>

          {/* Round — appears as soon as year + tournament are known */}
          {yearNum > 0 && effectiveTournament && (
            <div className="flex flex-col gap-2">
              <FieldLabel>Round</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {validRounds.map(r => (
                  <PickerBtn
                    key={r}
                    active={round === r}
                    onClick={() => setRound(r)}
                  >
                    {r}
                  </PickerBtn>
                ))}
              </div>
              <InlineError msg={errors.round} />
            </div>
          )}

          {/* Discipline */}
          {tournament && (
            <div className="flex flex-col gap-2">
              <FieldLabel>Discipline</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {availableDisciplines.map(d => (
                  <PickerBtn
                    key={d}
                    active={discipline === d}
                    onClick={() => setDiscipline(d)}
                  >
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
                <PickerBtn
                  key={color}
                  active={colors.includes(color)}
                  onClick={() => toggleColor(color)}
                >
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
                <PickerBtn
                  key={b}
                  active={brand === b}
                  onClick={() => setBrand(brand === b ? null : b)}
                >
                  {b}
                </PickerBtn>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
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
