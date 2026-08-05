const GROUPING_OPTIONS = [
  { value: 'year', label: 'Year' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'color', label: 'Color' },
  { value: 'color-group', label: 'Color group' },
  { value: 'brand', label: 'Brand' },
]

const SORT_OPTIONS = [
  { value: 'chronological', label: 'Chronological' },
  { value: 'filled-first', label: 'Filled first' },
]

function OptionButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded text-sm font-medium transition-colors ${
        active ? 'bg-brand text-dark' : 'bg-dark3 text-ink hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export default function GroupingPanel({ activeGrouping, onGroupingChange, sortBy, onSortChange, onClose }) {
  return (
    <div className="fixed right-0 top-28 bottom-0 z-[45] w-full sm:w-72 bg-dark2 border-l-2 border-white shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-white flex-shrink-0">
        <h3 className="font-playfair text-brand text-base">Group by</h3>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm font-medium text-ink bg-dark3 hover:bg-brand hover:text-dark rounded px-3 py-1.5 transition-colors"
          aria-label="Close"
        >
          <span className="text-lg leading-none">×</span>
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        <div className="flex flex-col gap-2">
          {GROUPING_OPTIONS.map(({ value, label }) => (
            <OptionButton key={value} active={activeGrouping === value} onClick={() => onGroupingChange(value)}>
              {label}
            </OptionButton>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Sort</p>
          <div className="flex flex-col gap-2">
            {SORT_OPTIONS.map(({ value, label }) => (
              <OptionButton key={value} active={sortBy === value} onClick={() => onSortChange(value)}>
                {label}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
