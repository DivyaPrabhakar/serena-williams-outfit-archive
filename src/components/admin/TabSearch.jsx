export default function TabSearch({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search by tournament, year, discipline, round…"
      className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
    />
  )
}
