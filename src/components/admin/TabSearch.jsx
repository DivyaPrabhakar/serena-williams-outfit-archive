export default function TabSearch({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search by tournament, year, discipline, round…"
      className="w-full bg-dark border-2 border-white text-ink px-3 py-2 text-sm outline-none focus:border-brand placeholder-line-strong"
    />
  )
}
