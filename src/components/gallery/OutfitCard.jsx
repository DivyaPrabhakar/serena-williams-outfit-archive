import { COLOR_MAP, ROUND_LABELS } from '../../lib/constants'

export default function OutfitCard({ outfit, settings, onClick }) {
  const primaryColor = outfit.colors?.[0]
  const colorValue = primaryColor ? (COLOR_MAP[primaryColor] ?? primaryColor) : null

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
        <p className="text-[10px] text-ink leading-tight line-clamp-3">{label}</p>
      </div>
      {settings.colorDot && colorValue && (
        <div
          className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-1 ring-dark/60 pointer-events-none"
          style={{ background: colorValue }}
        />
      )}
    </div>
  )
}
