// Derived, crawlable URLs for outfits and tournaments — no DB slug column needed.
//
// URL scheme (Singles implicit, matching /wimbledon/2015/final & /us-open/2012):
//   Tournament-year:      /{tournament}/{year}               e.g. /us-open/2012
//   Outfit (Singles):     /{tournament}/{year}/{round}       e.g. /wimbledon/2015/final
//   Outfit (Dbl/Mixed):   /{tournament}/{year}/{discipline}/{round}
//
// Slugs are computed once from the build-time snapshot. Two rows that map to the
// same path (47 in current data — e.g. duplicate entries, or null rounds) are
// disambiguated with a -2 / -3 suffix ordered by createdAt, so URLs stay stable.

import { snapshotOutfits } from './snapshot'

export function slugify(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Round code <-> URL segment
const ROUND_TO_SLUG = {
  R1: 'round-1', R2: 'round-2', R3: 'round-3', R4: 'round-4',
  QF: 'quarter-final', SF: 'semi-final', F: 'final',
}
const SLUG_TO_ROUND = Object.fromEntries(
  Object.entries(ROUND_TO_SLUG).map(([code, slug]) => [slug, code]),
)
// 104 rows have no round; give them a stable, human-readable segment.
const NULL_ROUND_SLUG = 'outfit'

// Discipline -> URL segment (Singles omitted from the path)
const DISCIPLINE_TO_SLUG = { Singles: null, Doubles: 'doubles', Mixed: 'mixed' }

// ── Tournament slug maps (reversible), built from the tournaments in the data ──
const tournamentToSlugMap = new Map()
const slugToTournamentMap = new Map()
for (const t of [...new Set(snapshotOutfits.map((o) => o.tournament))]) {
  let slug = slugify(t)
  let base = slug
  let n = 2
  while (slugToTournamentMap.has(slug)) slug = `${base}-${n++}` // guard rare collisions
  tournamentToSlugMap.set(t, slug)
  slugToTournamentMap.set(slug, t)
}

export function tournamentToSlug(tournament) {
  return tournamentToSlugMap.get(tournament) ?? slugify(tournament)
}
export function slugToTournament(slug) {
  return slugToTournamentMap.get(slug) ?? null
}

function roundSlug(round) {
  if (!round) return NULL_ROUND_SLUG
  return ROUND_TO_SLUG[round] ?? slugify(round)
}

// Base path for an outfit, before any collision suffix.
function basePath(o) {
  const segs = [tournamentToSlug(o.tournament), String(o.year)]
  const disc = DISCIPLINE_TO_SLUG[o.discipline]
  if (disc) segs.push(disc)
  segs.push(roundSlug(o.round))
  return '/' + segs.join('/')
}

// ── Path <-> outfit indices, with deterministic collision suffixes ──
const pathByOutfitId = new Map()
const outfitByPath = new Map()
{
  const groups = new Map()
  const ordered = [...snapshotOutfits].sort(
    (a, b) =>
      String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? '')) ||
      String(a.id).localeCompare(String(b.id)),
  )
  for (const o of ordered) {
    const bp = basePath(o)
    const arr = groups.get(bp) ?? []
    arr.push(o)
    groups.set(bp, arr)
  }
  for (const [bp, arr] of groups) {
    arr.forEach((o, idx) => {
      const p = idx === 0 ? bp : `${bp}-${idx + 1}`
      pathByOutfitId.set(o.id, p)
      outfitByPath.set(p, o)
    })
  }
}

export function tournamentPath(tournament, year) {
  return `/${tournamentToSlug(tournament)}/${year}`
}

// ── Tournament hub pages ──────────────────────────────────────────────────────
// One crawlable landing page per tournament, spanning all its years. The `-outfits`
// suffix keeps it a single, unambiguous segment (never collides with the two-segment
// /{tournament}/{year}) and signals the page's subject to searchers.
const HUB_SUFFIX = '-outfits'

export function tournamentHubPath(tournament) {
  return `/${tournamentToSlug(tournament)}${HUB_SUFFIX}`
}

// Resolve a hub route param (e.g. "wimbledon-outfits") to its tournament, the years
// it spans, and its outfits. Returns null for unknown or non-hub params.
export function tournamentHubFromParam(hub) {
  if (!hub || !hub.endsWith(HUB_SUFFIX)) return null
  const slug = hub.slice(0, -HUB_SUFFIX.length)
  const name = slugToTournament(slug)
  if (!name) return null
  const outfits = snapshotOutfits.filter((o) => o.tournament === name)
  if (outfits.length === 0) return null
  const years = [...new Set(outfits.map((o) => o.year))].sort((a, b) => a - b)
  return { tournament: name, outfits, years }
}

export function allTournamentHubPaths() {
  const set = new Set()
  for (const o of snapshotOutfits) set.add(tournamentHubPath(o.tournament))
  return [...set]
}

export function pathForOutfit(outfit) {
  return pathByOutfitId.get(outfit.id) ?? basePath(outfit)
}

// Reconstruct the canonical path from react-router params and resolve the outfit.
export function outfitFromParams({ tournament, year, discipline, round }) {
  const segs = ['', tournament, year]
  if (discipline) segs.push(discipline)
  segs.push(round)
  return outfitByPath.get(segs.join('/')) ?? null
}

export function tournamentFromParams({ tournament, year }) {
  const name = slugToTournament(tournament)
  if (!name) return null
  const outfits = snapshotOutfits.filter(
    (o) => o.tournament === name && String(o.year) === String(year),
  )
  return { tournament: name, year: Number(year), outfits }
}

// ── Enumerations for SSG includedRoutes + sitemap ──
export function allTournamentYearPaths() {
  const set = new Set()
  for (const o of snapshotOutfits) set.add(tournamentPath(o.tournament, o.year))
  return [...set]
}
export function allOutfitPaths() {
  return [...outfitByPath.keys()]
}

export { SLUG_TO_ROUND, ROUND_TO_SLUG }
