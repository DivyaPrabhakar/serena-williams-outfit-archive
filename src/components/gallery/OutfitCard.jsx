import { COLOR_MAP, ROUND_LABELS } from '../../lib/constants'
import { isGettyEmbed, isGettyLandscape } from '../../lib/imageUtils'

export default function OutfitCard({ outfit, settings, onClick }) {
  const colors     = outfit.colors ?? []
  const getty      = isGettyEmbed(outfit.imageUrl)
  const landscape  = getty && isGettyLandscape(outfit.imageUrl)

  const focalJustify = outfit.focal_point === 'left'  ? 'flex-start'
                     : outfit.focal_point === 'right' ? 'flex-end'
                     : 'center'

  const label =
    settings.cardLabel === 'notes' && outfit.notes
      ? outfit.notes
      : `${outfit.tournament} · ${outfit.year} · ${outfit.discipline} · ${ROUND_LABELS[outfit.round] ?? outfit.round ?? ''}`

  return (
    <div>
      {settings.colorDot && colors.length > 0 && (
        <div className="flex gap-1 mb-1.5">
          {colors.map((color, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-sm ring-1 ring-white/25"
              style={{ background: COLOR_MAP[color] ?? color }}
            />
          ))}
        </div>
      )}
      <div
        className={`relative aspect-[3/4] rounded overflow-hidden bg-dark3 group ${
          settings.lightbox ? 'cursor-pointer' : ''
        }`}
        onClick={settings.lightbox ? onClick : undefined}
      >
        {getty ? (
          <iframe
            key={outfit.id}
            srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#111}body{display:flex;align-items:${landscape ? 'center' : 'flex-start'};justify-content:${landscape ? focalJustify : 'center'};${landscape ? '' : 'margin-top:-44px;height:calc(100% + 44px)'}}</style></head><body>${outfit.imageUrl}</body></html>`}
            title={label}
            className="w-full h-full border-0 pointer-events-none"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        ) : (
          <img
            src={outfit.imageUrl}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            style={{ objectPosition: outfit.focal_point === 'left' ? 'left center' : outfit.focal_point === 'right' ? 'right center' : 'center center' }}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
          <p className="text-xs text-ink leading-tight line-clamp-3">{label}</p>
        </div>
      </div>
    </div>
  )
}
