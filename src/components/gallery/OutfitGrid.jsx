import OutfitCard from './OutfitCard'
import { CARD_WIDTHS } from '../../lib/galleryUtils'

// Card settings for the standalone gallery pages (tournament + hub): cards
// navigate to their outfit page rather than opening the homepage lightbox.
const PAGE_CARD_SETTINGS = { lightbox: false, colorDot: true, cardLabel: 'tournament' }

// The shared, fixed-width card grid for every non-homepage gallery page. Uses the
// same `.gallery-card` / `--card-w` sizing as the homepage so cards are identical
// in size everywhere (and Getty embeds fill their frame instead of leaving gaps).
export default function OutfitGrid({ outfits, settings = PAGE_CARD_SETTINGS, density = 'standard' }) {
  const cardWidth = CARD_WIDTHS[density] ?? CARD_WIDTHS.standard
  return (
    <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
      {outfits.map((o) => (
        <li key={o.id} className="flex-none gallery-card" style={{ '--card-w': `${cardWidth}px` }}>
          <OutfitCard outfit={o} settings={settings} />
        </li>
      ))}
    </ul>
  )
}
