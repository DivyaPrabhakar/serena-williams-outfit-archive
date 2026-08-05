// Per Grand Slam: a faint full-height "needed" ghost column (every round-slot she
// played) with a solid "logged" fill rising from the bottom, so you can see how
// complete each major is at a glance.
export default function GrandSlamBars({ data }) {
  return (
    <div className="flex items-end gap-3 sm:gap-6 h-64">
      {data.map(({ tournament, needed, logged }) => {
        const pct = needed > 0 ? Math.min(100, (logged / needed) * 100) : 0
        return (
          <div key={tournament} className="flex-1 flex flex-col items-center h-full">
            <span className="text-muted text-sm tabular-nums mb-2">
              <span className="text-brand">{logged}</span> / {needed}
            </span>
            <div className="relative w-full flex-1 rounded-t bg-dark3 overflow-hidden">
              <div
                className="absolute inset-x-0 bottom-0 rounded-t bg-brand"
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-ink text-xs sm:text-sm text-center leading-tight mt-2">
              {tournament}
            </span>
          </div>
        )
      })}
    </div>
  )
}
