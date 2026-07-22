// Shared JSON-LD nodes, defined once and referenced by @id everywhere else.
//
// The three "identity" nodes (Serena, the author, the publisher) are emitted in
// full exactly once — site-wide, via Layout — and every page-level block just
// points at them with { '@id': ... }. This keeps the graph consistent and avoids
// re-stating the same Person/Organization on every route. Each identity exposes
// an xLd() (the full node) and an xRef() (the @id reference).

import { absoluteUrl } from './siteUrl'
import { isGettyEmbed } from './imageUtils'

// ── Serena Williams (the subject) ─────────────────────────────────────────
export const PERSON_ID = absoluteUrl('/#serena-williams')

export function personLd() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Serena Williams',
    url: absoluteUrl('/'),
    jobTitle: 'Professional tennis player',
    description:
      'American professional tennis player, 23-time Grand Slam singles champion.',
    sameAs: [
      'https://en.wikipedia.org/wiki/Serena_Williams',
      'https://www.wikidata.org/wiki/Q11607',
    ],
  }
}

export function personRef() {
  return { '@id': PERSON_ID }
}

// ── Divya Prabhakar (the author) ──────────────────────────────────────────
// sameAs URLs are her real, published profiles (see AboutPage.jsx) — not guesses.
export const AUTHOR_ID = absoluteUrl('/#divya-prabhakar')

export function authorPersonLd() {
  return {
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: 'Divya Prabhakar',
    jobTitle: 'Creator, Serena Williams Fit-dex',
    url: 'https://divyaprabhakar.com',
    sameAs: [
      'https://www.linkedin.com/in/divyaprabhakar/',
      'https://divyaprabhakar.com',
    ],
  }
}

export function authorRef() {
  return { '@id': AUTHOR_ID }
}

// ── Serena Williams Fit-dex (the publisher) ───────────────────────────────
// TODO(divya): add an official Fitdex social presence to `sameAs`, and a proper
// publisher `logo` ImageObject, once those assets exist. Omitted rather than
// fabricated — favicon.svg is a favicon, not a brand logo.
export const PUBLISHER_ID = absoluteUrl('/#fitdex')

export function publisherOrgLd() {
  return {
    '@type': 'Organization',
    '@id': PUBLISHER_ID,
    name: 'Serena Williams Fit-dex',
    url: absoluteUrl('/'),
  }
}

export function publisherRef() {
  return { '@id': PUBLISHER_ID }
}

// ── SportsEvent for a tournament/year ─────────────────────────────────────
// Year-only startDate: exact match dates aren't stored. Accepted by validators
// as a partial ISO date. SportsEvent isn't a Google rich-result type — it's here
// for the schema.org graph, linked from an outfit's `about`.
export function sportsEventLd(tournament, year) {
  return {
    '@type': 'SportsEvent',
    '@id': absoluteUrl(`/#event-${slugPart(tournament)}-${year}`),
    name: `${year} ${tournament}`,
    sport: 'Tennis',
    startDate: String(year),
    performer: personRef(),
  }
}

function slugPart(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Getty detail-page URL extraction ──────────────────────────────────────
// From an embed: the href in the <a> anchor. From a media.gettyimages.com URL:
// the numeric id in the /id/<n>/ path segment. null when neither matches.
export function gettyDetailUrl(imageUrl) {
  const s = String(imageUrl ?? '')
  const embedMatch = s.match(/href='(https:\/\/www\.gettyimages\.com\/detail\/[^']+)'/)
  if (embedMatch) return embedMatch[1]
  const idMatch = s.match(/media\.gettyimages\.com\/id\/(\d+)/)
  if (idMatch) return `https://www.gettyimages.com/detail/${idMatch[1]}`
  return null
}

function isGettyMediaUrl(imageUrl) {
  return /(?:^|\/\/)media\.gettyimages\.com\//.test(String(imageUrl ?? ''))
}

// ── ImageObject for an outfit, with correct Getty attribution ─────────────
// This is the ONLY place `creditText` is used — it names the *photo* credit
// (Getty Images), which is a different concept from the outfit's brand/designer.
// Three cases:
//   • Getty embed  → credit + acquireLicensePage, NO hotlinked contentUrl (per Getty terms)
//   • Getty media URL → credit + acquireLicensePage AND contentUrl (already a hosted image)
//   • other (Contentful, etc.) → plain contentUrl, no Getty credit
export function outfitImageLd(outfit, { name, caption } = {}) {
  const url = outfit.imageUrl
  const detail = gettyDetailUrl(url)
  const base = {
    '@type': 'ImageObject',
    ...(name ? { name } : {}),
    ...(caption ? { caption } : {}),
    representativeOfPage: true,
  }

  if (isGettyEmbed(url)) {
    return {
      ...base,
      creditText: 'Getty Images',
      copyrightNotice: 'Getty Images',
      ...(detail ? { acquireLicensePage: detail } : {}),
    }
  }

  if (isGettyMediaUrl(url)) {
    return {
      ...base,
      contentUrl: url,
      creditText: 'Getty Images',
      copyrightNotice: 'Getty Images',
      ...(detail ? { acquireLicensePage: detail } : {}),
    }
  }

  return { ...base, contentUrl: url }
}
