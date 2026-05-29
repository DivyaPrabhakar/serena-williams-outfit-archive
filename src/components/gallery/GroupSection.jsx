import { COLOR_MAP } from '../../lib/constants'
import { CARD_WIDTHS } from '../../lib/galleryUtils'
import OutfitCard from './OutfitCard'

export default function GroupSection({ label, color, colors, outfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  return (
    <section className="mb-14">
      <div className="mb-7">
        <div className="flex items-center gap-3">
          {colors && colors.length > 0 ? (
            <div className="flex gap-1">
              {colors.map(c => (
                <div
                  key={c}
                  className="w-5 h-5 rounded-sm ring-1 ring-white/25 flex-shrink-0"
                  style={{ background: COLOR_MAP[c] ?? c }}
                />
              ))}
            </div>
          ) : color ? (
            <div
              className="w-6 h-6 rounded-sm ring-1 ring-white/25 flex-shrink-0"
              style={{ background: color }}
            />
          ) : null}
          <h2 className="font-playfair text-5xl text-ink leading-none">{label}</h2>
        </div>
        <p className="text-sm text-muted mt-1.5">
          {outfits.length} outfit{outfits.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {outfits.map(outfit => (
          <div key={outfit.id} style={{ width: cardWidth }}>
            <OutfitCard outfit={outfit} settings={settings} onClick={() => onOpenLightbox(outfit)} />
          </div>
        ))}
      </div>
    </section>
  )
}
