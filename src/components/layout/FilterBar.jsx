import { useState } from 'react'

const GROUPING_LABELS = {
  year: 'Year',
  tournament: 'Tournament',
  color: 'Color',
  brand: 'Brand',
}

export default function FilterBar({
  flatGrid, setFlatGrid,
  loading, missingCount,
  panelOpen, togglePanel, setPanelOpen,
  groupingPanelOpen, setGroupingPanelOpen,
  showSettings, setShowSettings,
  groupBy,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const groupingLabel = GROUPING_LABELS[groupBy] ?? groupBy
  const isNonDefault = groupBy !== 'year'

  function openGrouping() {
    const next = !groupingPanelOpen
    setGroupingPanelOpen(next)
    if (next) setPanelOpen(false)
    setShowSettings(false)
  }

  return (
    <div className="sticky top-28 z-30 bg-dark border-b border-dark3 px-3 py-3 relative">

      {/* ── Desktop bar ── */}
      <div className="hidden md:flex items-center gap-4">
        {/* Layout toggle */}
        <div className="flex rounded overflow-hidden border border-dark3 flex-shrink-0">
          {[['tournament', 'By tournament'], ['grid', 'Grid']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFlatGrid(val === 'grid')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                (val === 'grid') === flatGrid ? 'bg-gold text-dark' : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!loading && missingCount > 0 && (
            <button
              onClick={togglePanel}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-colors ${
                panelOpen ? 'bg-gold text-dark' : 'bg-dark3 text-ink hover:text-white'
              }`}
            >
              Outfits yet to find
              <span className={panelOpen ? 'text-dark/70' : 'text-gold'}>
                ({missingCount})
              </span>
            </button>
          )}
          <button
            onClick={openGrouping}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-colors ${
              groupingPanelOpen || isNonDefault
                ? 'bg-gold text-dark'
                : 'bg-dark3 text-ink hover:text-white'
            }`}
          >
            <span>Group by</span>
            <span className={groupingPanelOpen || isNonDefault ? 'text-dark/60' : 'text-gold'}>
              {groupingLabel}
            </span>
          </button>
          <button
            onClick={() => { setShowSettings(s => !s); setGroupingPanelOpen(false) }}
            className={`flex items-center gap-1.5 text-sm underline transition-colors ${
              showSettings ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
            aria-label="Display settings"
          >
            <span>⚙</span>
            <span>Display settings</span>
          </button>
        </div>
      </div>

      {/* ── Mobile bar ── */}
      <div className="flex md:hidden items-center gap-3">
        {/* Active grouping pill (shown when non-default) */}
        {isNonDefault && (
          <span className="text-xs bg-gold text-dark rounded px-2 py-1 truncate max-w-[130px]">
            {groupingLabel}
          </span>
        )}

        {/* More button */}
        <button
          onClick={() => setMobileMenuOpen(o => !o)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
            mobileMenuOpen || groupingPanelOpen || panelOpen || showSettings
              ? 'bg-gold text-dark'
              : 'bg-dark3 text-ink'
          }`}
          aria-label="Open controls"
        >
          {mobileMenuOpen ? '✕' : '⋯'}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 space-y-2">
          {/* Layout toggle */}
          <div className="flex rounded overflow-hidden border border-dark3">
            {[['tournament', 'By tournament'], ['grid', 'Grid']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFlatGrid(val === 'grid')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  (val === 'grid') === flatGrid ? 'bg-gold text-dark' : 'text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Group by */}
          <button
            onClick={() => { openGrouping(); setMobileMenuOpen(false) }}
            className={`w-full flex items-center justify-between px-4 py-2 rounded text-sm font-medium transition-colors ${
              groupingPanelOpen || isNonDefault
                ? 'bg-gold text-dark'
                : 'bg-dark3 text-ink hover:text-white'
            }`}
          >
            <span>Group by</span>
            <span className={`text-xs ${groupingPanelOpen || isNonDefault ? 'text-dark/60' : 'text-gold'}`}>
              {groupingLabel}
            </span>
          </button>

          {/* Outfits yet to find */}
          {!loading && missingCount > 0 && (
            <button
              onClick={() => { togglePanel(); setMobileMenuOpen(false) }}
              className={`w-full flex items-center justify-between px-4 py-2 rounded text-sm font-medium transition-colors ${
                panelOpen ? 'bg-gold text-dark' : 'bg-dark3 text-ink hover:text-white'
              }`}
            >
              <span>Outfits yet to find</span>
              <span className={panelOpen ? 'text-dark/70' : 'text-gold'}>({missingCount})</span>
            </button>
          )}

          {/* Display settings */}
          <button
            onClick={() => { setShowSettings(s => !s); setGroupingPanelOpen(false); setMobileMenuOpen(false) }}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors bg-dark3 ${
              showSettings ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            <span>⚙</span>
            <span>Display settings</span>
          </button>
        </div>
      )}
    </div>
  )
}
