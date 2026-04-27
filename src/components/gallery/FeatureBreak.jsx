import OutfitCard from './OutfitCard'
import EmptySlot from './EmptySlot'

const CARD_WIDTHS = { small: 88, standard: 128, large: 172 }

// slots: Array<{ type: 'outfit', outfit } | { type: 'empty', label }>
// headerLabel: override the auto-generated header (used by condensed mode)
export default function FeatureBreak({ tournament, year, discipline, slots, settings, onOpenLightbox, headerLabel }) {
  const visibleSlots = settings.showEmptySlots
    ? slots
    : slots.filter(s => s.type === 'outfit')

  if (visibleSlots.length === 0) return null

  const roundCount = slots.length
  const defaultHeader = discipline
    ? `${tournament} ${year} · ${discipline} · ${roundCount} ${roundCount === 1 ? 'round' : 'rounds'}`
    : `${tournament} ${year}`
  const header = headerLabel ?? defaultHeader
  const cardWidth = CARD_WIDTHS[settings.gridDensity] ?? 128

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-0.5 h-3.5 bg-gold flex-shrink-0 rounded-full" />
        <span className="text-[10px] uppercase tracking-widest text-gold font-medium">
          {header}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory">
        {visibleSlots.map((slot, i) => (
          <div
            key={i}
            className="flex-none snap-start"
            style={{ width: cardWidth }}
          >
            {slot.type === 'outfit' ? (
              <OutfitCard
                outfit={slot.outfit}
                settings={settings}
                onClick={() => onOpenLightbox(slot.outfit)}
              />
            ) : (
              <EmptySlot label={slot.label} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
