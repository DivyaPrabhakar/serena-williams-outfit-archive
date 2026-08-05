import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { DISCIPLINES } from '../../lib/constants'
import { getValidRounds, getRoundNumber } from '../../lib/rounds'
import { patchOutfit } from '../../lib/api'
import ColorSwatch from '../ColorSwatch'

const TOURNAMENT_ORDER = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open', 'Olympics']

// Preserves null discipline/round — unlike rowToOutfit which defaults discipline to 'Singles'
function rawToBackfill(r) {
  return {
    id:          r.id,
    imageUrl:    r.image_url,
    year:        r.year,
    tournament:  r.tournament,
    discipline:  r.discipline   ?? null,
    round:       r.round        ?? null,
    roundNumber: r.round_number ?? null,
    colors:      r.colors       ?? [],
    notes:       r.notes        ?? null,
  }
}

function sortByYearAndTournament(outfits) {
  return [...outfits].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    const ta = TOURNAMENT_ORDER.indexOf(a.tournament)
    const tb = TOURNAMENT_ORDER.indexOf(b.tournament)
    return (ta === -1 ? 99 : ta) - (tb === -1 ? 99 : tb)
  })
}

// ── Per-card form ─────────────────────────────────────────────────────────────

function BackfillCard({ outfit, adminToken, onSaved, onSkip }) {
  const [discipline,   setDiscipline]   = useState(outfit.discipline)
  const [round,        setRound]        = useState(outfit.round)
  const [roundNumber,  setRoundNumber]  = useState(outfit.roundNumber)
  const [manualRound,  setManualRound]  = useState('')
  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState(null)

  const validRounds   = discipline ? getValidRounds(outfit.tournament, outfit.year, discipline) : []
  const noRoundsFound = discipline !== null && validRounds.length === 0

  function pickDiscipline(d) {
    if (d === discipline) return
    setDiscipline(d)
    setRound(null)
    setRoundNumber(null)
    setManualRound('')
    setSaveError(null)
  }

  function pickRound(label) {
    setRound(label)
    setRoundNumber(getRoundNumber(label))
    setSaveError(null)
  }

  function onManualChange(val) {
    setManualRound(val)
    const label = val.toUpperCase().trim()
    setRound(label || null)
    setRoundNumber(label ? getRoundNumber(label) : null)
  }

  async function handleSave() {
    if (!discipline) { setSaveError('Select a discipline'); return }
    if (!round)      { setSaveError('Select a round');      return }
    setSaving(true)
    setSaveError(null)
    try {
      await patchOutfit(outfit.id, { discipline, round, round_number: roundNumber }, adminToken)
      onSaved(outfit.id)
    } catch (e) {
      setSaveError(e.message)
      setSaving(false)
    }
  }

  const canSave = discipline && (noRoundsFound ? manualRound.trim().length > 0 : round !== null)

  return (
    <div className="flex gap-4 p-4 bg-dark3 rounded border-2 border-white">
      {/* Thumbnail */}
      <img
        src={outfit.imageUrl}
        alt=""
        className="flex-none rounded object-cover bg-dark2"
        style={{ width: 60, height: 80 }}
        loading="lazy"
      />

      {/* Form */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Metadata row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm text-ink font-medium">
              {outfit.tournament} {outfit.year}
            </p>
            {outfit.colors.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                {outfit.colors.map(c => (
                  <span key={c} className="flex items-center gap-1">
                    <ColorSwatch
                      color={c}
                      className="w-2 h-2 rounded-full flex-shrink-0"
                    />
                    <span className="text-[10px] text-muted">{c}</span>
                  </span>
                ))}
              </div>
            )}
            {outfit.notes && (
              <p className="text-[10px] text-muted mt-0.5 line-clamp-2">{outfit.notes}</p>
            )}
          </div>
          <button
            onClick={() => onSkip(outfit.id)}
            className="text-[10px] text-dim hover:text-muted flex-shrink-0 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Discipline picker */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted mb-1.5">Discipline</p>
          <div className="flex gap-1.5">
            {DISCIPLINES.map(d => {
              const disabled = d === 'Mixed' && outfit.tournament === 'Olympics'
              return (
                <button
                  key={d}
                  onClick={() => !disabled && pickDiscipline(d)}
                  disabled={disabled}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    discipline === d
                      ? 'bg-brand text-dark'
                      : disabled
                      ? 'bg-dark2 text-muted/30 cursor-not-allowed'
                      : 'bg-dark2 text-muted hover:text-ink'
                  }`}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        {/* Round picker */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted mb-1.5">Round</p>
          {!discipline ? (
            <p className="text-[10px] text-muted/50 italic">Select discipline first</p>
          ) : noRoundsFound ? (
            <div className="space-y-2">
              <p className="text-[10px] text-amber-400">
                ⚠ No rounds found for {discipline} at {outfit.tournament} {outfit.year} — check the year and tournament.
              </p>
              <input
                type="text"
                value={manualRound}
                onChange={e => onManualChange(e.target.value)}
                placeholder="Type round label (R1, R2, QF, SF, F…)"
                className="w-full bg-dark2 border-2 border-white rounded px-2.5 py-1.5 text-xs text-ink outline-none focus:border-brand placeholder-dim"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {validRounds.map(label => (
                <button
                  key={label}
                  onClick={() => pickRound(label)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    round === label
                      ? 'bg-brand text-dark'
                      : 'bg-dark2 text-muted hover:text-ink'
                  }`}
                >
                  {discipline} {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error + Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
              canSave && !saving
                ? 'bg-brand text-dark hover:bg-brand-light'
                : 'bg-dark2 text-dim cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saveError && (
            <p className="text-xs text-red-400">{saveError}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function BackfillPanel({ adminToken, totalOutfits }) {
  const [legacy,  setLegacy]  = useState([])
  const [skipped, setSkipped] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: sbError } = await supabase
          .from('outfits')
          .select('*')
          .or('discipline.is.null,round.is.null')
        if (sbError) throw new Error(sbError.message)
        setLegacy(sortByYearAndTournament((data ?? []).map(rawToBackfill)))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleSaved(id) {
    setLegacy(prev => prev.filter(o => o.id !== id))
    setSkipped(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  function handleSkip(id) {
    setSkipped(prev => new Set([...prev, id]))
  }

  const remaining = legacy.length
  const complete  = Math.max(0, totalOutfits - remaining)
  const visible   = legacy.filter(o => !skipped.has(o.id))

  // Nothing to show once all backfilled
  if (!loading && !error && remaining === 0) return null

  return (
    <div className="mt-8 bg-dark2 border-2 border-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-ink">
          Backfill
        </h3>
        {!loading && !error && (
          <p className="text-sm text-muted">
            <span className="text-ink">{remaining}</span> remaining
            {' · '}
            <span className="text-brand">{complete}</span> complete
          </p>
        )}
      </div>

      {/* Subheading */}
      {!loading && !error && remaining > 0 && (
        <p className="text-sm text-muted mb-5">
          {remaining} outfit{remaining !== 1 ? 's' : ''} need backfilling.
          {skipped.size > 0 && (
            <span className="text-dim"> ({skipped.size} skipped this session)</span>
          )}
        </p>
      )}

      {loading && (
        <p className="text-dim text-sm mt-3">Checking for legacy entries…</p>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-3">{error}</p>
      )}

      {!loading && !error && remaining > 0 && (
        <div className="space-y-3">
          {visible.map(outfit => (
            <BackfillCard
              key={outfit.id}
              outfit={outfit}
              adminToken={adminToken}
              onSaved={handleSaved}
              onSkip={handleSkip}
            />
          ))}
          {visible.length === 0 && skipped.size > 0 && (
            <p className="text-dim text-sm">
              All remaining cards are skipped for this session. Reload to see them again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
