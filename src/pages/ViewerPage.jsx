import { useEffect, useState, useMemo, useRef } from 'react'
import { fetchOutfits } from '../lib/api'
import { ACTIVE_YEARS, DISCIPLINES } from '../lib/constants'
import { getRoundsForSlot, getRoundLabel, getCombinedSlotStatus, slotsForYear } from '../lib/rounds'
import { useSettings } from '../hooks/useSettings'
import TournamentFilter from '../components/filters/TournamentFilter'
import YearFilter from '../components/filters/YearFilter'
import GalleryGrid from '../components/gallery/GalleryGrid'
import Lightbox from '../components/gallery/Lightbox'
import SettingsPanel from '../components/SettingsPanel'
import MissingPanel from '../components/gallery/MissingPanel'

const TOURNAMENT_ORDER = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open', 'Olympics']

function sortTournaments(tournaments) {
  return [...tournaments].sort((a, b) => {
    const ai = TOURNAMENT_ORDER.indexOf(a)
    const bi = TOURNAMENT_ORDER.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.localeCompare(b)
  })
}

function readStorage(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? v : fallback } catch { return fallback }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, String(value)) } catch {}
}

export default function ViewerPage() {
  const [outfits, setOutfits]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [activeTournament, setActiveTournament] = useState(null)
  const [activeYear, setActiveYear]     = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const [mode, setMode] = useState(() => readStorage('serena_viewer_mode', 'condensed'))
  const [panelOpen, setPanelOpen] = useState(() =>
    readStorage(`serena_hunt_panel_condensed`, 'false') === 'true'
  )

  const { settings, updateSetting } = useSettings()
  const highlightTimerRef = useRef(null)

  // Persist mode; restore per-mode panel state when mode changes
  function switchMode(m) {
    setMode(m)
    writeStorage('serena_viewer_mode', m)
    setPanelOpen(readStorage(`serena_hunt_panel_${m}`, 'false') === 'true')
  }

  function togglePanel() {
    setPanelOpen(prev => {
      const next = !prev
      writeStorage(`serena_hunt_panel_${mode}`, next)
      return next
    })
  }

  function closePanel() {
    setPanelOpen(false)
    writeStorage(`serena_hunt_panel_${mode}`, false)
  }

  useEffect(() => {
    fetchOutfits()
      .then(data => {
        data.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          const ta = TOURNAMENT_ORDER.indexOf(a.tournament)
          const tb = TOURNAMENT_ORDER.indexOf(b.tournament)
          const tCmp = (ta === -1 ? 99 : ta) - (tb === -1 ? 99 : tb)
          if (tCmp !== 0) return tCmp
          const da = DISCIPLINES.indexOf(a.discipline)
          const db = DISCIPLINES.indexOf(b.discipline)
          if (da !== db) return da - db
          return (a.roundNumber ?? 0) - (b.roundNumber ?? 0)
        })
        setOutfits(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Missing item computation ───────────────────────────────────────────────

  const condensedMissing = useMemo(() => {
    if (!outfits.length) return []
    const outfitKeys = new Set(outfits.map(o => `${o.year}_${o.tournament}`))
    const items = []
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        if (!outfitKeys.has(`${year}_${tournament}`) &&
            getCombinedSlotStatus(tournament, year) === 'played') {
          items.push({ year, tournament })
        }
      }
    }
    return items
  }, [outfits])

  const expandedMissing = useMemo(() => {
    if (!outfits.length) return []
    const outfitKeys = new Set(
      outfits.map(o => `${o.year}_${o.tournament}_${o.discipline}_${o.roundNumber}`)
    )
    const items = []
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        for (const discipline of DISCIPLINES) {
          const rounds = getRoundsForSlot(tournament, year, discipline)
          for (let r = 1; r <= rounds; r++) {
            if (!outfitKeys.has(`${year}_${tournament}_${discipline}_${r}`)) {
              items.push({ year, tournament, discipline, roundNumber: r, round: getRoundLabel(r) })
            }
          }
        }
      }
    }
    return items
  }, [outfits])

  const missingCount = mode === 'condensed' ? condensedMissing.length : expandedMissing.length

  // ── Scroll + highlight ─────────────────────────────────────────────────────

  function handleHighlight(item) {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)

    // Clear any lingering highlight classes
    document.querySelectorAll('.slot-highlight').forEach(el => el.classList.remove('slot-highlight'))

    const id = item.roundNumber
      ? `slot-${item.year}-${item.tournament}-${item.discipline}-${item.roundNumber}`
      : `slot-${item.year}-${item.tournament}`

    const el = document.getElementById(id)
    const yearEl = document.getElementById(`year-${item.year}`)

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('slot-highlight')
      highlightTimerRef.current = setTimeout(() => el.classList.remove('slot-highlight'), 2700)
    } else if (yearEl) {
      yearEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // ── Lightbox ───────────────────────────────────────────────────────────────

  const realOutfits = useMemo(() => outfits.filter(o => {
    if (activeTournament && o.tournament !== activeTournament) return false
    if (activeYear && o.year !== activeYear) return false
    return true
  }), [outfits, activeTournament, activeYear])

  function openLightbox(outfit) {
    const idx = realOutfits.findIndex(o => o.id === outfit.id)
    if (idx !== -1) setLightboxIndex(idx)
  }

  // ── Derived filter data ────────────────────────────────────────────────────

  const uniqueTournaments = useMemo(
    () => sortTournaments([...new Set(outfits.map(o => o.tournament))]),
    [outfits]
  )
  const uniqueYears = useMemo(
    () => [...new Set(outfits.map(o => o.year))],
    [outfits]
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-dark">
      {/* Sticky filter bar */}
      <div className="sticky top-12 z-30 bg-dark border-b border-dark3 px-6 py-3 space-y-2">

        {/* Row 1: Tournament filter + mode toggle + settings */}
        <div className="flex items-start justify-between gap-4">
          <TournamentFilter
            tournaments={uniqueTournaments}
            active={activeTournament}
            onChange={setActiveTournament}
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mode toggle */}
            <div className="flex rounded overflow-hidden border border-dark3">
              {['condensed', 'expanded'].map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-3 py-1 text-xs font-medium transition-colors capitalize ${
                    mode === m ? 'bg-gold text-dark' : 'text-muted hover:text-ink'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {/* Settings gear */}
            <button
              onClick={() => setShowSettings(s => !s)}
              className="text-muted hover:text-ink transition-colors text-lg leading-none"
              aria-label="Display settings"
              title="Display settings"
            >
              ⚙
            </button>
          </div>
        </div>

        {/* Row 2: Year filter + Still hunting toggle */}
        <div className="flex items-center justify-between gap-4">
          <YearFilter years={uniqueYears} active={activeYear} onChange={setActiveYear} />
          {!loading && missingCount > 0 && (
            <button
              onClick={togglePanel}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                panelOpen ? 'bg-gold text-dark' : 'bg-dark3 text-muted hover:text-ink'
              }`}
            >
              Still hunting
              <span className={panelOpen ? 'text-dark/70' : 'text-gold'}>({missingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main gallery */}
      <main
        className="px-6 pt-10 max-w-7xl mx-auto"
        style={{ paddingBottom: panelOpen ? 'calc(42vh + 40px)' : '6rem' }}
      >
        {loading && (
          <div className="flex items-center justify-center py-32 text-muted text-sm">Loading…</div>
        )}
        {error && (
          <div className="flex items-center justify-center py-32 text-red-400 text-sm">
            Failed to load outfits: {error}
          </div>
        )}
        {!loading && !error && (
          <GalleryGrid
            outfits={outfits}
            activeTournament={activeTournament}
            activeYear={activeYear}
            settings={settings}
            mode={mode}
            onOpenLightbox={openLightbox}
          />
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          outfits={realOutfits}
          index={lightboxIndex}
          onNavigate={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          updateSetting={updateSetting}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Still hunting panel */}
      {panelOpen && (
        <MissingPanel
          mode={mode}
          condensedItems={condensedMissing}
          expandedItems={expandedMissing}
          onHighlight={handleHighlight}
          onClose={closePanel}
        />
      )}
    </div>
  )
}
