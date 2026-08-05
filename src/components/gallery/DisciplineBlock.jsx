import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'

// A discipline rendered as a faint tinted block with a corner label and a
// flex-wrap grid of card slots. Lets disciplines flow side by side rather
// than each forced onto its own full-width row.
// items: [{ key, outfit, emptyLabel, slotId }]
export default function DisciplineBlock({ discipline, items, cardWidth, maxColumns = 4, fillWidth = false, settings, onOpenLightbox }) {
  // Cap the block at maxColumns cards wide so disciplines with many slots wrap
  // their cards internally instead of hogging the full row width. Padding (p-2.5
  // → 20px) and the inner gap-2 (8px) are included since box-sizing is border-box.
  // When fillWidth is set, drop the cap so the block fills its grid column instead.
  const maxWidth = fillWidth ? undefined : maxColumns * cardWidth + (maxColumns - 1) * 8 + 20

  return (
    <div
      className={`rounded-lg p-2.5 ring-1 bg-discipline-bg ring-discipline-border ${fillWidth ? 'w-full' : ''}`}
      style={{ maxWidth }}
    >
      <span className="block text-base mb-2 text-ink">
        {discipline}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div key={item.key} id={item.slotId} className="flex-none gallery-card" style={{ '--card-w': `${cardWidth}px` }}>
            {item.outfit ? (
              <OutfitCard outfit={item.outfit} settings={settings} onClick={() => onOpenLightbox(item.outfit)} />
            ) : (
              <EmptySlot label={item.emptyLabel} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
