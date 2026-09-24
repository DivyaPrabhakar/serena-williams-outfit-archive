// Shared list-item button for side panels that show a set of mutually exclusive
// choices (grouping, sort, layout, size) with the current one highlighted.
export default function OptionButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded text-sm font-medium transition-colors ${
        active ? 'bg-brand text-dark hover:bg-brand-light' : 'bg-dark3 text-ink hover:bg-brand/15 hover:text-brand'
      }`}
    >
      {children}
    </button>
  )
}
