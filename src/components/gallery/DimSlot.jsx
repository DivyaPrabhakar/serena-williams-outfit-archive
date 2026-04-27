export default function DimSlot({ label }) {
  return (
    <div className="aspect-[3/4] border border-dark3 rounded flex items-center justify-center p-2 opacity-20">
      <span className="text-[9px] text-muted text-center leading-tight">{label}</span>
    </div>
  )
}
