import { COLOR_MAP, ROUND_LABELS } from '../../lib/constants'

export default function OutfitCard({ outfit, settings, onClick }) {
  const colors = outfit.colors ?? []

  const label =
    settings.cardLabel === 'notes' && outfit.notes
      ? outfit.notes
      : `${outfit.tournament} · ${outfit.year} · ${outfit.discipline} · ${ROUND_LABELS[outfit.round] ?? outfit.round ?? ''}`

  return (
    <div
      className={`relative aspect-[3/4] rounded overflow-hidden bg-dark3 group ${
        settings.lightbox ? 'cursor-pointer' : ''
      }`}
      onClick={settings.lightbox ? onClick : undefined}
    >
      <img
        src={outfit.imageUrl}
        alt={label}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
        <p className="text-xs text-ink leading-tight line-clamp-3">{label}</p>
      </div>
      {settings.colorDot && colors.length > 0 && (
        <div className="absolute bottom-1.5 left-1.5 flex gap-0.5 pointer-events-none">
          {colors.map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 ring-1 ring-dark/50"
              style={{ background: COLOR_MAP[color] ?? color }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
