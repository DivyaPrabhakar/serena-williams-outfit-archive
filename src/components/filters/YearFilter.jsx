import FilterBtn from './FilterBtn'

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
