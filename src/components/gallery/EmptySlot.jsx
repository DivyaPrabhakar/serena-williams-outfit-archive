export default function EmptySlot({ label }) {
  return (
    <div className="aspect-[3/4] border-2 border-dashed border-dark3 rounded flex flex-col items-center justify-center gap-1.5 p-2">
      <span className="text-2xl text-dark3 leading-none select-none">+</span>
      {label && (
        <span className="text-[9px] text-muted text-center leading-tight">{label}</span>
      )}
    </div>
  )
}
