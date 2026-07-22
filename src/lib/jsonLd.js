import { absoluteUrl } from './siteUrl'
import { personRef } from './schema'

// Schema.org CollectionPage + ItemList used by the tournament and hub pages. Both
// pages are collections that funnel to child pages (outfits, or years); this keeps
// the structured-data shape in one place. `items` is [{ url, name }] in order.
// `about` references Serena by @id (defined once site-wide in Layout's @graph);
// callers may pass extra `about` nodes (e.g. a SportsEvent) to append.
export function collectionPageJsonLd({ name, description, items, about = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    ...(description ? { description } : {}),
    about: [personRef(), ...about],
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(it.url),
        name: it.name,
      })),
    },
  }
}
