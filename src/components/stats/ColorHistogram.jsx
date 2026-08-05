import { COLOR_MAP } from '../../lib/constants'

// Vertical bars of color usage across the archive. Colors are alphabetized on the
// x-axis; each bar is filled with that color's hue and scaled to the busiest color.
export default function ColorHistogram({ data }) {
  const max = data.reduce((m, d) => Math.max(m, d.count), 0)
  return (
    <div className="flex items-end gap-2 sm:gap-3 h-56">
      {data.map(({ color, count }) => (
        <div key={color} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
          <span className="text-muted text-xs tabular-nums">{count}</span>
          <div
            className="w-full rounded-t border-2 border-white"
            style={{
              height: `${max > 0 ? (count / max) * 100 : 0}%`,
              background: COLOR_MAP[color] ?? color,
            }}
            title={`${color}: ${count}`}
          />
          <span className="text-muted text-[10px] sm:text-xs uppercase tracking-wide text-center leading-tight">
            {color}
          </span>
        </div>
      ))}
    </div>
  )
}
