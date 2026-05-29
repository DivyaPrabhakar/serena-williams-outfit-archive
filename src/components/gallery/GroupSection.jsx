import { CARD_WIDTHS } from '../../lib/galleryUtils'
import OutfitCard from './OutfitCard'

export default function GroupSection({ label, color, outfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  return (
    <section className="mb-14">
      <div className="mb-7">
        <div className="flex items-center gap-3">
          {color && (
            <div
              className="w-6 h-6 rounded-sm ring-1 ring-white/25 flex-shrink-0"
              style={{ background: color }}
            />
          )}
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
