import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  GRAND_SLAMS, OLYMPICS_YEARS, ROUND_SEQUENCE, COLOR_MAP,
} from '../../lib/constants'
import { getValidRounds } from '../../lib/rounds'

// Tournaments where she played mixed doubles
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
  if (!cloudName || !preset) {
    throw new Error('Cloudinary not configured — set cl_cloud and cl_preset in localStorage')
  }
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset)
  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: fd },
  )
  const data = await res.json()
  if (!data.secure_url) throw new Error('Cloudinary upload failed')
  return data.secure_url
}

const EMPTY = {
  imageFile: null,
  imageUrl:  '',
  previewSrc: '',
  year:       '',
  tournament: '',
  otherTournament: '',
  discipline: '',
  round:      '',
  colors:     [],
  notes:      '',
}

export default function AddOutfitForm({ onAdd }) {
  const [f,          setF]          = useState(EMPTY)
  const [dragging,   setDragging]   = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors,     setErrors]     = useState({})
  const fileRef = useRef(null)

  const set = (key, val) => setF(prev => ({ ...prev, [key]: val }))

  // Reset dependent fields when parent changes
  useEffect(() => { set('discipline', ''); set('round', '') }, [f.tournament])
  useEffect(() => { set('round', '') },                        [f.discipline, f.year])

  const yearNum = parseInt(f.year) || 0
  const effectiveTournament = f.tournament === 'Other' ? f.otherTournament.trim() : f.tournament

  const availableDisciplines = useMemo(() => {
    if (!f.tournament) return []
    if (f.tournament === 'Olympics') return ['Singles', 'Doubles']
    if (MIXED_SLAMS.includes(f.tournament)) return ['Singles', 'Doubles', 'Mixed']
    return ['Singles', 'Doubles']
  }, [f.tournament])

  const validRounds = useMemo(() => {
    if (!f.discipline || !effectiveTournament || !yearNum) return []
    const rounds = getValidRounds(effectiveTournament, yearNum, f.discipline)
    return rounds.length > 0 ? rounds : ROUND_SEQUENCE
  }, [f.discipline, effectiveTournament, yearNum])

  // ── Image handlers ──────────────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return
    setF(prev => ({
      ...prev,
      imageFile:  file,
      previewSrc: URL.createObjectURL(file),
      imageUrl:   '',
    }))
    setErrors(prev => ({ ...prev, image: undefined }))
  }, [])

  const handleUrlChange = (url) => {
    setF(prev => ({ ...prev, imageUrl: url, previewSrc: url, imageFile: null }))
    if (url) setErrors(prev => ({ ...prev, image: undefined }))
  }

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!f.previewSrc && !f.imageUrl)                     e.image      = 'Image is required'
    if (!f.year || !yearNum)                              e.year       = 'Year is required'
    if (!f.tournament)                                    e.tournament = 'Tournament is required'
    if (f.tournament === 'Other' && !f.otherTournament.trim())
                                                          e.tournament = 'Tournament name is required'
    if (!f.discipline)                                    e.discipline = 'Discipline is required'
    if (!f.round)                                         e.round      = 'Round is required'
    return e
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setErrors({})

    try {
      let finalUrl = f.imageUrl
      if (f.imageFile) {
        setUploading(true)
        finalUrl = await uploadToCloudinary(f.imageFile)
        setUploading(false)
      }

      await onAdd({
        imageUrl:    finalUrl,
        year:        yearNum,
        tournament:  effectiveTournament,
        discipline:  f.discipline,
        round:       f.round,
        roundNumber: ROUND_SEQUENCE.indexOf(f.round) + 1,
        colors:      f.colors,
        notes:       f.notes,
      })

      setF(EMPTY)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const toggleColor = (color) =>
    set('colors', f.colors.includes(color)
      ? f.colors.filter(c => c !== color)
      : [...f.colors, color])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* 1. Image */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Image</FieldLabel>

        {/* Drag / drop zone */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          className={`border-2 border-dashed transition-colors cursor-pointer flex items-center justify-center min-h-32 ${
            dragging ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-[#2a2a2a] hover:border-[#444]'
          }`}
          onDragOver={e  => { e.preventDefault(); setDragging(true)  }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files[0])
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
          {f.previewSrc ? (
            <img
              src={f.previewSrc}
              alt="Preview"
              className="max-h-48 max-w-full object-contain p-2"
            />
          ) : (
            <p className="text-[#555] text-sm px-4 text-center">
              Drag &amp; drop an image here, or click to select
            </p>
          )}
        </div>

        {/* URL paste */}
        <input
          type="url"
          value={f.imageUrl}
          onChange={e => handleUrlChange(e.target.value)}
          placeholder="Or paste an image URL…"
          className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
        />
        <InlineError msg={errors.image} />
      </div>

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

      {/* 4. Discipline */}
      {f.tournament && (
        <div className="flex flex-col gap-2">
          <FieldLabel>Discipline</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {availableDisciplines.map(d => (
              <PickerBtn
                key={d}
                active={f.discipline === d}
                onClick={() => set('discipline', d)}
              >
                {d}
              </PickerBtn>
            ))}
          </div>
          <InlineError msg={errors.discipline} />
        </div>
      )}

      {/* 5. Round */}
      {f.discipline && (
        <div className="flex flex-col gap-2">
          <FieldLabel>Round</FieldLabel>
          {!yearNum || !effectiveTournament ? (
            <p className="text-[#555] text-xs italic">Select year and tournament first</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {validRounds.map(r => (
                <PickerBtn
                  key={r}
                  active={f.round === r}
                  onClick={() => set('round', r)}
                >
                  {f.discipline} {r}
                </PickerBtn>
              ))}
            </div>
          )}
          <InlineError msg={errors.round} />
        </div>
      )}

      {/* 6. Color */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Primary Color</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <PickerBtn
              key={color}
              active={f.colors.includes(color)}
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

      {/* 7. Notes */}
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

      {/* 8. Submit */}
      <InlineError msg={errors.submit} />
      <button
        type="submit"
        disabled={submitting}
        className="bg-[#C9A84C] text-[#0D0D0D] font-medium text-sm py-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading…' : submitting ? 'Adding…' : 'Add to Gallery'}
      </button>
    </form>
  )
}
