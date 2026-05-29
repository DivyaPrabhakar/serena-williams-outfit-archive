const GROUPING_OPTIONS = [
  { value: 'year', label: 'Year' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'color', label: 'Color' },
  { value: 'brand', label: 'Brand' },
]

export default function GroupingPanel({ activeGrouping, onGroupingChange, onClose }) {
  return (
    <div className="fixed right-0 top-28 bottom-0 z-[45] w-72 bg-dark2 border-l border-dark3 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark3 flex-shrink-0">
        <h3 className="font-playfair text-gold text-base">Group by</h3>
        <button
          onClick={onClose}
          className="text-muted hover:text-ink text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-2">
          {GROUPING_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onGroupingChange(value)}
              className={`w-full text-left px-4 py-3 rounded text-sm font-medium transition-colors ${
                activeGrouping === value
                  ? 'bg-gold text-dark'
                  : 'bg-dark3 text-ink hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
