import { DISCIPLINE_STYLE } from '../../lib/constants'
import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'

// A discipline rendered as a faint tinted, color-coded block with a corner
// label and a flex-wrap grid of card slots. Lets disciplines flow side by side
// rather than each forced onto its own full-width row.
// items: [{ key, outfit, emptyLabel, slotId }]
export default function DisciplineBlock({ discipline, items, cardWidth, settings, onOpenLightbox }) {
  const style = DISCIPLINE_STYLE[discipline] ?? DISCIPLINE_STYLE.Singles

  return (
    <div
      className="rounded-lg p-2.5 pt-2 ring-1"
      style={{ background: style.tint, '--tw-ring-color': style.ring }}
    >
      <span
        className="block text-[10px] uppercase tracking-widest mb-2"
        style={{ color: style.label }}
      >
        {discipline}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div key={item.key} id={item.slotId} className="flex-none" style={{ width: cardWidth }}>
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
