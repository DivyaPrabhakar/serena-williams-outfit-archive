import ColorSwatch from '../ColorSwatch'

// Row of color swatches for a StickyGroupHeader. Takes a list of color names
// and shrinks alongside the header when it's pinned ("stuck"). Renders nothing
// when there are no colors.
export default function HeaderSwatches({ colors }) {
  if (!colors || colors.length === 0) return null
  return (
    <div className="flex gap-1">
      {colors.map(c => (
        <ColorSwatch
          key={c}
          color={c}
          title={c}
          className="w-5 h-5 rounded-sm ring-1 ring-white/25 flex-shrink-0 transition-all duration-200 group-data-[stuck=true]/sticky:w-3.5 group-data-[stuck=true]/sticky:h-3.5"
        />
      ))}
    </div>
  )
}
