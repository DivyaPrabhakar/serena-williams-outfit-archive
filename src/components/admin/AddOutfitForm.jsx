import { useState, useMemo, useEffect } from 'react'
import {
  GRAND_SLAMS, OLYMPICS_YEARS, ROUND_SEQUENCE, COLOR_MAP, OUTFIT_BRANDS,
} from '../../lib/constants'
import { getValidRounds, getRoundsForSlot } from '../../lib/rounds'
import { PickerBtn, FieldLabel, InlineError } from './adminFormPrimitives'

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

export function isGettyEmbed(val) {
  return typeof val === 'string' && val.trimStart().startsWith('<') && val.includes('gettyimages')
}

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
  const [f,          setF]          = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors,     setErrors]     = useState({})

  const set = (key, val) => setF(prev => ({ ...prev, [key]: val }))

  const yearNum             = parseInt(f.year) || 0
  const effectiveTournament = f.tournament === 'Other' ? f.otherTournament.trim() : f.tournament

  const availableDisciplines = useMemo(() => {
    if (!f.tournament) return []
    if (f.tournament === 'Olympics') return ['Singles', 'Doubles']
    if (MIXED_SLAMS.includes(f.tournament)) return ['Singles', 'Doubles', 'Mixed']
    return ['Singles', 'Doubles']
  }, [f.tournament])

  const validRounds = useMemo(() => {
    if (!effectiveTournament || !yearNum) return []
    if (f.discipline) {
      const rounds = getValidRounds(effectiveTournament, yearNum, f.discipline)
      return rounds.length > 0 ? rounds : ROUND_SEQUENCE
    }
    const max = Math.max(
      getRoundsForSlot(effectiveTournament, yearNum, 'Singles'),
      getRoundsForSlot(effectiveTournament, yearNum, 'Doubles'),
      getRoundsForSlot(effectiveTournament, yearNum, 'Mixed'),
      0,
    )
    return max > 0 ? ROUND_SEQUENCE.slice(0, max) : ROUND_SEQUENCE
  }, [f.discipline, effectiveTournament, yearNum])

  useEffect(() => {
    if (f.discipline === 'Mixed' && f.tournament === 'Olympics') set('discipline', '')
  }, [f.tournament])

  useEffect(() => {
    if (f.round && validRounds.length > 0 && !validRounds.includes(f.round)) set('round', '')
  }, [validRounds])

  // ── Image handlers ──────────────────────────────────────────────────────
  const handleGettyEmbed = (val) => {
    setF(prev => ({ ...prev, gettyEmbed: val, imageUrl: val.trim() ? '' : prev.imageUrl }))
    setErrors(prev => ({ ...prev, image: undefined, imageUrl: undefined }))
  }

  const handleImageUrl = (url) => {
    setF(prev => ({ ...prev, imageUrl: url, gettyEmbed: url.trim() ? '' : prev.gettyEmbed }))
    setErrors(prev => ({ ...prev, image: undefined, imageUrl: undefined }))
  }

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    const hasGetty = !!f.gettyEmbed.trim()
    const hasUrl   = !!f.imageUrl.trim()

    if (!hasGetty && !hasUrl) {
      e.image = 'Image is required — paste a Getty embed code or an image URL'
    } else if (hasUrl && isBlockedUrl(f.imageUrl.trim())) {
      e.imageUrl = 'Facebook and Instagram links are not supported (images time out)'
    }

    if (!f.year || !yearNum)    e.year       = 'Year is required'
    if (!f.tournament)          e.tournament = 'Tournament is required'
    if (f.tournament === 'Other' && !f.otherTournament.trim())
                                e.tournament = 'Tournament name is required'
    if (!f.discipline)          e.discipline = 'Discipline is required'
    if (!f.round)               e.round      = 'Round is required'
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
      const finalUrl = f.gettyEmbed.trim() || f.imageUrl.trim()

      await onAdd({
        imageUrl:    finalUrl,
        year:        yearNum,
        tournament:  effectiveTournament,
        discipline:  f.discipline,
        round:       f.round,
        roundNumber: ROUND_SEQUENCE.indexOf(f.round) + 1,
        colors:      f.colors,
        notes:       f.notes,
        focal_point: f.focal_point,
        brand:       f.brand,
      })

      setF(EMPTY)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
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
      <div className="flex flex-col gap-3">
        <FieldLabel>Image</FieldLabel>

        {/* Getty embed */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Getty Embed Code</FieldLabel>
          <textarea
            value={f.gettyEmbed}
            onChange={e => handleGettyEmbed(e.target.value)}
            placeholder="Paste the embed code from Getty Images…"
            rows={4}
            className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a] resize-y font-mono"
          />
          {f.gettyEmbed.trim() && (
            <p className="text-xs text-[#8A877F]">
              Getty embed detected
              {(() => { const m = f.gettyEmbed.match(/items:'(\d+)'/) ; return m ? ` — asset #${m[1]}` : '' })()}
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
            value={f.imageUrl}
            onChange={e => handleImageUrl(e.target.value)}
            placeholder="https://… (from a news or sports site)"
            className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
          />
          <p className="text-[10px] text-[#3a3a3a]">Facebook and Instagram links are not supported</p>
          <InlineError msg={errors.imageUrl} />
          {f.imageUrl.trim() && !isBlockedUrl(f.imageUrl.trim()) && (
            <img
              src={f.imageUrl.trim()}
              alt="Preview"
              className="max-h-48 max-w-full object-contain border border-[#2a2a2a] bg-[#111]"
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
                onClick={() => set('focal_point', fp)}
                className={`px-4 py-1.5 text-xs border transition-colors capitalize ${
                  i === 0 ? '' : '-ml-px'
                } ${
                  f.focal_point === fp
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
              <PickerBtn
                key={r}
                active={f.round === r}
                onClick={() => set('round', r)}
              >
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

      {/* 7. Brand */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Brand</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {OUTFIT_BRANDS.map(b => (
            <PickerBtn
              key={b}
              active={f.brand === b}
              onClick={() => set('brand', f.brand === b ? null : b)}
            >
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
