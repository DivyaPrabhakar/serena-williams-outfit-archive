function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
        active ? 'bg-gold text-dark' : 'bg-dark3 text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function YearFilter({ years, active, onChange }) {
  const sorted = [...years].sort((a, b) => a - b)
  return (
    <div className="flex flex-wrap gap-1.5">
      <FilterBtn active={active === null} onClick={() => onChange(null)}>
        All Years
      </FilterBtn>
      {sorted.map(y => (
        <FilterBtn
          key={y}
          active={active === y}
          onClick={() => onChange(active === y ? null : y)}
        >
          {y}
        </FilterBtn>
      ))}
    </div>
  )
}
