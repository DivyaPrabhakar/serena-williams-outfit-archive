import { COLOR_MAP } from '../../lib/constants'
import { CARD_WIDTHS } from '../../lib/galleryUtils'
import OutfitCard from './OutfitCard'
import StickyGroupHeader from './StickyGroupHeader'

export default function GroupSection({ navId, label, color, colors, outfits, settings, onOpenLightbox }) {
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  const swatches = colors && colors.length > 0 ? (
    <div className="flex gap-1">
      {colors.map(c => (
        <div
          key={c}
          className="w-5 h-5 rounded-sm ring-1 ring-white/25 flex-shrink-0 transition-all duration-200 group-data-[stuck=true]/sticky:w-3.5 group-data-[stuck=true]/sticky:h-3.5"
          style={{ background: COLOR_MAP[c] ?? c }}
        />
      ))}
    </div>
  ) : color ? (
    <div
      className="w-6 h-6 rounded-sm ring-1 ring-white/25 flex-shrink-0 transition-all duration-200 group-data-[stuck=true]/sticky:w-4 group-data-[stuck=true]/sticky:h-4"
      style={{ background: color }}
    />
  ) : null

  return (
    <section className="mb-14">
      <StickyGroupHeader
        className="mb-7"
        id={navId}
        label={label}
        swatches={swatches}
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
