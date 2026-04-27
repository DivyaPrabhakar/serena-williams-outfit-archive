import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  GRAND_SLAMS, OLYMPICS_YEARS, ROUND_SEQUENCE, COLOR_MAP,
} from '../../lib/constants'
import { getValidRounds, getRoundsForSlot } from '../../lib/rounds'

const MIXED_SLAMS = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open']
const COLORS      = Object.keys(COLOR_MAP)

function PickerBtn({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 text-xs border transition-colors ${
        active
          ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
          : disabled
          ? 'border-[#1a1a1a] text-[#2a2a2a] cursor-not-allowed'
          : 'border-[#2a2a2a] text-[#8A877F] hover:border-[#C9A84C] hover:text-[#C9A84C] cursor-pointer'
      }`}
    >
      {children}
    </button>
  )
}

function FieldLabel({ children }) {
  return <label className="text-xs uppercase tracking-widest text-[#8A877F]">{children}</label>
}

function InlineError({ msg }) {
  return msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null
}

async function uploadToCloudinary(file) {
  const cloudName = localStorage.getItem('cl_cloud')
  const preset    = localStorage.getItem('cl_preset')
  if (!cloudName || !preset) throw new Error('Cloudinary not configured')
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset)
  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: fd },
  )
  const data = await res.json()
  if (!data.secure_url) throw new Error('Upload failed')
  return data.secure_url
}

// Determine if a tournament value is "Other" (not a slam or Olympics)
function isOtherTournament(t) {
  return t && !GRAND_SLAMS.includes(t) && t !== 'Olympics'
}

export default function EditOutfitModal({ outfit, onSave, onClose }) {
  // Initialise all state from the outfit prop (component is keyed by outfit.id)
  const isOther  = isOtherTournament(outfit.tournament)
  const [imageUrl,        setImageUrl]        = useState(outfit.imageUrl    ?? '')
  const [imageFile,       setImageFile]       = useState(null)
  const [previewSrc,      setPreviewSrc]      = useState(outfit.imageUrl    ?? '')
  const [dragging,        setDragging]        = useState(false)
  const [year,            setYear]            = useState(String(outfit.year ?? ''))
  const [tournament,      setTournament]      = useState(isOther ? 'Other' : (outfit.tournament ?? ''))
  const [otherTournament, setOtherTournament] = useState(isOther ? outfit.tournament : '')
  const [discipline,      setDiscipline]      = useState(outfit.discipline  ?? '')
  const [round,           setRound]           = useState(outfit.round       ?? '')
  const [colors,          setColors]          = useState(outfit.colors      ?? [])
  const [notes,           setNotes]           = useState(outfit.notes       ?? '')
  const [uploading,       setUploading]       = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [errors,          setErrors]          = useState({})
  const fileRef = useRef(null)

  // Reset round when discipline/year/tournament changes, but not on first render
  // (first render initialises round from the outfit prop — clearing it is a bug)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setRound('')
  }, [discipline, year, tournament])

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

  const handleFile = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return
    setImageFile(file)
    setPreviewSrc(URL.createObjectURL(file))
    setImageUrl('')
    setErrors(prev => ({ ...prev, image: undefined }))
  }, [])

  const handleUrlChange = (url) => {
    setImageUrl(url)
    setPreviewSrc(url)
    setImageFile(null)
    if (url) setErrors(prev => ({ ...prev, image: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!previewSrc && !imageUrl)                          e.image      = 'Image is required'
    if (!year || !yearNum)                                 e.year       = 'Year is required'
    if (!tournament)                                       e.tournament = 'Tournament is required'
    if (tournament === 'Other' && !otherTournament.trim()) e.tournament = 'Tournament name is required'
    if (!discipline)                                       e.discipline = 'Discipline is required'
    if (!round)                                            e.round      = 'Round is required'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setErrors({})

    try {
      let finalUrl = imageUrl || outfit.imageUrl
      if (imageFile) {
        setUploading(true)
        finalUrl = await uploadToCloudinary(imageFile)
        setUploading(false)
      }

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
      })
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSaving(false)
      setUploading(false)
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
          <div className="flex flex-col gap-2">
            <FieldLabel>Image</FieldLabel>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
              className={`border-2 border-dashed transition-colors cursor-pointer flex items-center justify-center min-h-28 ${
                dragging ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-[#2a2a2a] hover:border-[#444]'
              }`}
              onDragOver={e  => { e.preventDefault(); setDragging(true)  }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
              {previewSrc ? (
                <img src={previewSrc} alt="Preview" className="max-h-40 max-w-full object-contain p-2" />
              ) : (
                <p className="text-[#555] text-sm px-4 text-center">
                  Drag &amp; drop or click to replace image
                </p>
              )}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="Or paste an image URL…"
              className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
            />
            <InlineError msg={errors.image} />
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
            {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
