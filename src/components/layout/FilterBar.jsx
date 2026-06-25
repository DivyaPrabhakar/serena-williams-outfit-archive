const GROUPING_LABELS = {
  year: 'Year',
  tournament: 'Tournament',
  color: 'Color',
  brand: 'Brand',
}

export default function FilterBar({
  loading, foundCount, totalCount,
  panelOpen, togglePanel, setPanelOpen,
  groupingPanelOpen, setGroupingPanelOpen,
  groupBy,
}) {
  const groupingLabel = GROUPING_LABELS[groupBy] ?? groupBy

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
          className={`px-4 py-2 rounded text-sm font-normal whitespace-nowrap transition-colors ${
            panelOpen ? 'bg-gold text-dark' : 'bg-dark3 text-muted hover:text-white'
          }`}
        >
          {foundCount}/{totalCount} outfits found
        </button>
      )}
      <button
        onClick={openGrouping}
        className={`px-4 py-2 rounded text-sm font-normal whitespace-nowrap transition-colors ${
          groupingPanelOpen ? 'bg-gold text-dark' : 'bg-dark3 hover:text-white'
        }`}
      >
        <span className={groupingPanelOpen ? 'text-dark/60' : 'text-muted'}>View by: </span>
        <span className={groupingPanelOpen ? 'text-dark font-medium' : 'text-gold'}>{groupingLabel}</span>
      </button>
    </div>
  )
}
