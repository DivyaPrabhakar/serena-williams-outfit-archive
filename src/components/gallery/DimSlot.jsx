export default function DimSlot({ label, tournament }) {
  return (
    <div className="aspect-[3/4] border border-dark3 rounded flex flex-col items-center justify-center gap-1.5 p-3">
      <span className="text-base text-dark3 leading-none select-none">—</span>
      {tournament && (
        <span className="text-xs text-muted font-medium text-center leading-tight">{tournament}</span>
      )}
      <span className="text-[10px] text-muted/60 text-center leading-tight">{label}</span>
    </div>
  )
}
