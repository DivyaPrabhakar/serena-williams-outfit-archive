export default function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-brand text-dark' : 'bg-dark3 text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
