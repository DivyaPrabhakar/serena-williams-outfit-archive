import ColorSwatch from '../ColorSwatch'

// Year-by-year palette matrix. Every color has a fixed column (alphabetized), so a
// cell is filled only when that color was worn that year — leaving placeholders
// elsewhere. This lets you scan a single column vertically to see, e.g., exactly
// which years featured Green.
export default function ColorsByYear({ data = [], allColors = [] }) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Legend header: one reference swatch per column */}
        <div className="flex items-center gap-4 pb-2 mb-1 border-b-2 border-white">
          <span className="w-12 shrink-0" />
          <div className="flex gap-1.5">
            {allColors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                title={color}
                className="w-5 h-5 rounded-sm border-2 border-white inline-block"
              />
            ))}
          </div>
        </div>

        {data.map(({ year, colors }) => {
          const worn = new Set(colors)
          return (
            <div key={year} className="flex items-center gap-4 py-0.5">
              <span className="w-12 text-muted text-sm tabular-nums shrink-0">{year}</span>
              <div className="flex gap-1.5">
                {allColors.map((color) =>
                  worn.has(color) ? (
                    <ColorSwatch
                      key={color}
                      color={color}
                      title={`${year} · ${color}`}
                      className="w-5 h-5 rounded-sm border-2 border-white inline-block"
                    />
                  ) : (
                    <span
                      key={color}
                      title={`${year} · no ${color}`}
                      className="w-5 h-5 rounded-sm border-2 border-white bg-dark2 opacity-40 inline-block"
                    />
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
