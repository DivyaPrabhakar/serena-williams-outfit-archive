import { GROUPING_LABELS } from '../../lib/filterUtils'
import { LAYOUT_LABELS, SIZE_LABELS } from '../../lib/galleryUtils'

function PanelButton({ active, onClick, prefix, value, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded text-sm font-normal whitespace-nowrap transition-colors ${
        active ? 'bg-brand text-dark hover:bg-brand-light' : 'bg-dark3 hover:bg-brand/15'
      } ${className}`}
    >
      <span className={active ? 'text-dark/60' : 'text-muted'}>{prefix}: </span>
      <span className={active ? 'text-dark font-medium' : 'text-brand'}>{value}</span>
    </button>
  )
}

// activePanel is one of 'missing' | 'grouping' | 'layout' | 'size' | null — every
// top-bar control opens its own right-side panel the same way, so only one can be
// open at a time and each button's active state mirrors the panel it opens.
export default function FilterBar({
  loading, foundCount, totalCount,
  activePanel, onTogglePanel,
  groupBy, layout, gridDensity,
}) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2">
      {!loading && (
        <button
          onClick={() => onTogglePanel('missing')}
          className={`px-4 py-2 rounded text-sm font-normal whitespace-nowrap transition-colors ${
            activePanel === 'missing' ? 'bg-brand text-dark hover:bg-brand-light' : 'bg-dark3 text-muted hover:bg-brand/15 hover:text-brand'
          }`}
        >
          {foundCount}/{totalCount} outfits found
        </button>
      )}
      <PanelButton
        active={activePanel === 'grouping'}
        onClick={() => onTogglePanel('grouping')}
        prefix="View by"
        value={GROUPING_LABELS[groupBy] ?? groupBy}
      />
      <PanelButton
        active={activePanel === 'layout'}
        onClick={() => onTogglePanel('layout')}
        prefix="Layout"
        value={LAYOUT_LABELS[layout] ?? layout}
        className="hidden sm:inline-block"
      />
      <PanelButton
        active={activePanel === 'size'}
        onClick={() => onTogglePanel('size')}
        prefix="Size"
        value={SIZE_LABELS[gridDensity] ?? SIZE_LABELS.standard}
      />
    </div>
  )
}
