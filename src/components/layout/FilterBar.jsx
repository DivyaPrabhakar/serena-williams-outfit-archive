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
  layout, onLayoutChange,
}) {
  const groupingLabel = GROUPING_LABELS[groupBy] ?? groupBy
  const isStacked = layout === 'vertical'

  function openGrouping() {
    const next = !groupingPanelOpen
    setGroupingPanelOpen(next)
    if (next) setPanelOpen(false)
  }

  function toggleLayout() {
    onLayoutChange(isStacked ? 'horizontal' : 'vertical')
  }

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2">
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
      <button
        onClick={toggleLayout}
        className="px-4 py-2 rounded text-sm font-normal whitespace-nowrap transition-colors bg-dark3 hover:text-white"
      >
        <span className="text-muted">Layout: </span>
        <span className="text-gold">{isStacked ? 'Stacked' : 'Side by side'}</span>
      </button>
    </div>
  )
}
