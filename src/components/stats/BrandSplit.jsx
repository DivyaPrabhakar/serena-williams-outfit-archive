// Logged outfits by brand (Nike vs. Puma) as two proportional bars.
export default function BrandSplit({ brands, unspecified }) {
  const max = brands.reduce((m, b) => Math.max(m, b.count), 0)
  return (
    <div>
      <div className="space-y-4">
        {brands.map(({ brand, count }) => (
          <div key={brand} className="flex items-center gap-4">
            <span className="w-14 text-ink text-lg shrink-0">{brand}</span>
            <div className="flex-1">
              <div
                className="h-6 rounded bg-gold min-w-[2px]"
                style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }}
              />
            </div>
            <span className="text-gold text-lg tabular-nums w-12 text-right shrink-0">
              {count}
            </span>
          </div>
        ))}
      </div>
      {unspecified > 0 && (
        <p className="text-muted text-xs mt-4">
          {unspecified} outfit{unspecified === 1 ? '' : 's'} with no brand recorded
        </p>
      )}
    </div>
  )
}
