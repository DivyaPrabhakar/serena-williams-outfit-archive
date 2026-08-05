// The dashed outline is an SVG background rather than `border-dashed` — plain
// CSS ties dash length/gap to border-width, so there's no way to keep the
// line thin while spacing the dashes further apart without it.
const DASHED_OUTLINE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Crect x='0.5' y='0.5' width='99' height='99' rx='2' fill='none' stroke='white' stroke-opacity='0.5' stroke-width='1' stroke-dasharray='10 8'/%3E%3C/svg%3E\")",
}

export default function EmptySlot({ label }) {
  return (
    <div
      className="aspect-[3/4] rounded flex flex-col items-center justify-center gap-1.5 p-2"
      style={DASHED_OUTLINE}
    >
      <span className="text-2xl text-dark3 leading-none select-none">+</span>
      {label && (
        <span className="text-xs text-muted text-center leading-tight">{label}</span>
      )}
    </div>
  )
}
