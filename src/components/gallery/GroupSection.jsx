import { CARD_WIDTHS } from '../../lib/galleryUtils'
import OutfitCard from './OutfitCard'
import StickyGroupHeader from './StickyGroupHeader'
import HeaderSwatches from './HeaderSwatches'

export default function GroupSection({ navId, label, colors, outfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  return (
    <section className="mb-14">
      <StickyGroupHeader
        className="mb-7"
        id={navId}
        label={label}
        swatches={<HeaderSwatches colors={colors} />}
        title={label}
        subtitle={settings.hideGetty ? null : `${outfits.length} outfit${outfits.length !== 1 ? 's' : ''}`}
      />
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
