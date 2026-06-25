const GROUPING_LABELS = {
  year: 'Year',
  tournament: 'Tournament',
  color: 'Color',
  brand: 'Brand',
}

export default function FilterBar({
  loading, foundCount, missingCount,
  panelOpen, togglePanel, setPanelOpen,
  groupingPanelOpen, setGroupingPanelOpen,
  groupBy,
}) {
  const groupingLabel = GROUPING_LABELS[groupBy] ?? groupBy
  const isNonDefault = groupBy !== 'year'

  function openGrouping() {
    const next = !groupingPanelOpen
    setGroupingPanelOpen(next)
    if (next) setPanelOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      {!loading && (
        <button
          onClick={togglePanel}
          className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
            panelOpen ? 'bg-gold text-dark' : 'bg-dark3 text-ink hover:text-white'
          }`}
        >
          {foundCount}/{foundCount + missingCount} outfits found
        </button>
      )}
      <button
        onClick={openGrouping}
        className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
          groupingPanelOpen || isNonDefault ? 'bg-gold text-dark' : 'bg-dark3 text-ink hover:text-white'
        }`}
      >
        View by {groupingLabel}
      </button>
    </div>
  )
}
