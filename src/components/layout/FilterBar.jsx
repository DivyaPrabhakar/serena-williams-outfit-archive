import { useState } from 'react'

export default function FilterBar({
  mode, switchMode,
  flatGrid, setFlatGrid,
  loading, missingCount,
  panelOpen, togglePanel, setPanelOpen,
  filterPanelOpen, setFilterPanelOpen,
  showSettings, setShowSettings,
  activeTournament, activeYear, activeBrand, activeColor,
  clearAllFilters,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const hasActiveFilter = activeTournament || activeYear || activeBrand || activeColor
  const activeFilterLabel = [activeTournament, activeYear, activeBrand, activeColor].filter(Boolean).join(' · ')

  function openFilter() {
    const next = !filterPanelOpen
    setFilterPanelOpen(next)
    if (next) setPanelOpen(false)
    setShowSettings(false)
  }

  return (
    <div className="sticky top-28 z-30 bg-dark border-b border-dark3 px-3 py-3 relative">

      {/* ── Desktop bar ── */}
      <div className="hidden md:flex items-center gap-4">
        {/* View mode switcher */}
        <div className="flex rounded overflow-hidden border border-dark3 flex-shrink-0">
          {['condensed', 'expanded'].map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                mode === m ? 'bg-gold text-dark' : 'text-muted hover:text-ink'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Expanded layout toggle */}
        {mode === 'expanded' && (
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
        )}

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
          <div className="flex items-center gap-2">
            <button
              onClick={openFilter}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-colors ${
                filterPanelOpen || hasActiveFilter
                  ? 'bg-gold text-dark'
                  : 'bg-dark3 text-ink hover:text-white'
              }`}
            >
              <span>Filter</span>
              {hasActiveFilter && (
                <span className="text-dark/60">{activeFilterLabel}</span>
              )}
            </button>
            {hasActiveFilter && (
              <button
                onClick={clearAllFilters}
                className="text-muted hover:text-ink text-base leading-none transition-colors"
                aria-label="Clear filters"
                title="Clear filters"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={() => { setShowSettings(s => !s); setFilterPanelOpen(false) }}
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
        {/* View mode switcher */}
        <div className="flex rounded overflow-hidden border border-dark3 flex-shrink-0">
          {['condensed', 'expanded'].map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-3 py-2 text-sm font-medium transition-colors capitalize ${
                mode === m ? 'bg-gold text-dark' : 'text-muted hover:text-ink'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Active filter pill */}
        {hasActiveFilter && (
          <span className="text-xs bg-gold text-dark rounded px-2 py-1 truncate max-w-[130px]">
            {activeFilterLabel}
          </span>
        )}

        {/* More button */}
        <button
          onClick={() => setMobileMenuOpen(o => !o)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
            mobileMenuOpen || filterPanelOpen || panelOpen || showSettings
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
          {/* Expanded layout toggle */}
          {mode === 'expanded' && (
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
          )}

          {/* Filter */}
          <button
            onClick={() => { openFilter(); setMobileMenuOpen(false) }}
            className={`w-full flex items-center justify-between px-4 py-2 rounded text-sm font-medium transition-colors ${
              filterPanelOpen || hasActiveFilter
                ? 'bg-gold text-dark'
                : 'bg-dark3 text-ink hover:text-white'
            }`}
          >
            <span>Filter</span>
            {hasActiveFilter && (
              <span className="text-dark/60 text-xs">{activeFilterLabel}</span>
            )}
          </button>

          {/* Clear filters */}
          {hasActiveFilter && (
            <button
              onClick={() => { clearAllFilters(); setMobileMenuOpen(false) }}
              className="w-full px-4 py-2 rounded text-sm bg-dark3 text-muted hover:text-ink transition-colors"
            >
              Clear filters
            </button>
          )}

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
            onClick={() => { setShowSettings(s => !s); setFilterPanelOpen(false); setMobileMenuOpen(false) }}
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
