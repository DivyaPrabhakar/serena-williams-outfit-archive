import { absoluteUrl } from './siteUrl'

// Schema.org CollectionPage + ItemList used by the tournament and hub pages. Both
// pages are collections that funnel to child pages (outfits, or years); this keeps
// the structured-data shape in one place. `items` is [{ url, name }] in order.
export function collectionPageJsonLd({ name, description, items }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    ...(description ? { description } : {}),
    about: {
      '@type': 'Person',
      name: 'Serena Williams',
      sameAs: 'https://en.wikipedia.org/wiki/Serena_Williams',
    },
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
