import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUND_LABELS } from '../../lib/constants'
import { isGettyEmbed, isGettyLandscape, gettyEmbedForIframe } from '../../lib/imageUtils'
import { outfitAlt } from '../../lib/outfitText'
import { pathForOutfit } from '../../lib/slugs'
import LazyIframe from './LazyIframe'
import ColorSwatch from '../ColorSwatch'

export default function OutfitCard({ outfit, settings, onClick }) {
  const colors     = outfit.colors ?? []
  const getty      = isGettyEmbed(outfit.imageUrl)
  const landscape  = getty && isGettyLandscape(outfit.imageUrl)
  const [imgError, setImgError] = useState(false)

  const focalJustify = outfit.focal_point === 'left'  ? 'flex-start'
                     : outfit.focal_point === 'right' ? 'flex-end'
                     : 'center'

  const label =
    settings.cardLabel === 'notes' && outfit.notes
      ? outfit.notes
      : `${outfit.tournament} · ${outfit.year} · ${outfit.discipline} · ${ROUND_LABELS[outfit.round] ?? outfit.round ?? ''}`

  // Descriptive alt/title incl. "Serena Williams" for image search; the visible
  // hover caption keeps the compact `label` above.
  const alt = outfitAlt(outfit)

  // The card is a real <Link> so crawlers and cmd/middle-click reach the outfit
  // page. When the lightbox is enabled, a normal left-click opens it instead of
  // navigating (preventDefault); the href stays intact for the other cases.
  const handleClick =
    settings.lightbox && onClick
      ? (e) => { e.preventDefault(); onClick(e) }
      : undefined

  return (
    <Link
      to={pathForOutfit(outfit)}
      className="block hover:opacity-95 transition-opacity"
      aria-label={alt}
      onClick={handleClick}
    >
      {settings.colorDot && colors.length > 0 && (
        <div className="flex gap-1 mb-1.5">
          {colors.map((color, i) => (
            <ColorSwatch
              key={i}
              color={color}
              className="w-4 h-4 rounded-sm ring-1 ring-white/25"
            />
          ))}
        </div>
      )}
      <div
        className={`relative aspect-[3/4] rounded overflow-hidden bg-dark3 group ${
          settings.lightbox ? 'cursor-pointer' : ''
        }`}
      >
        {getty ? (
          <LazyIframe
            key={outfit.id}
            srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#111}body{display:flex;align-items:${landscape ? 'center' : 'flex-start'};justify-content:${landscape ? focalJustify : 'center'};${landscape ? '' : 'margin-top:-44px;height:calc(100% + 44px)'}}</style></head><body>${gettyEmbedForIframe(outfit.imageUrl)}</body></html>`}
            title={alt}
            wrapperClassName="w-full h-full"
            iframeClassName="w-full h-full border-0 pointer-events-none"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : imgError || !outfit.imageUrl ? (
          // Broken/missing image → labeled placeholder instead of a blank white box.
          <div className="w-full h-full flex items-center justify-center bg-dark3 p-2 text-center">
            <span className="text-[10px] text-muted leading-tight line-clamp-4">{label}</span>
          </div>
        ) : (
          <img
            src={outfit.imageUrl}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            style={{ objectPosition: outfit.focal_point === 'left' ? 'left center' : outfit.focal_point === 'right' ? 'right center' : 'center center' }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
          <p className="text-xs text-ink leading-tight line-clamp-3">{label}</p>
        </div>
      </div>
    </Link>
  )
}
