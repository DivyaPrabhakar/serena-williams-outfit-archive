// The header row shared by every side panel (right-side overlays and the
// left-side group nav rail) — title + close/collapse action. Every panel
// renders this exact component so headers never drift out of sync again.
export default function PanelHeader({ title, onClose, closeLabel = 'Close', closeIcon = '×', closeAriaLabel }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b-2 border-white flex-shrink-0">
      <h3 className="font-[family-name:var(--font-sans)] text-brand text-base">{title}</h3>
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-sm font-medium text-ink bg-dark3 hover:bg-brand hover:text-dark rounded px-3 py-1.5 transition-colors"
        aria-label={closeAriaLabel ?? `Close ${title}`}
      >
        <span className="text-lg leading-none">{closeIcon}</span>
        {closeLabel}
      </button>
    </div>
  )
}
