// Live archive statistics, computed from the outfit dataset at render time.
//
// Every function here derives its numbers from the passed-in outfit array — the
// build-time snapshot (src/lib/snapshot.js) — so the /stats page always reflects
// the current dataset and never carries hardcoded totals. Reuses the same domain
// constants and round logic the rest of the app uses.

import {
  GRAND_SLAMS,
  ACTIVE_YEARS,
  DISCIPLINES,
  OUTFIT_BRANDS,
  COLOR_MAP,
  TOTAL_MATCHES,
} from './constants'
import { getRoundNumbers } from './rounds'
import { distinctSlotCount } from './slots'

// Headline numbers for the "found out of total, earliest–latest year" intro.
// `found` — distinct outfit slots catalogued so far (deduped, matching foundCount
//           in useMissingOutfits).
// `total` — every outfit she was known to wear, i.e. her career match count
//           (TOTAL_MATCHES). Same denominator the landing-page "N/1280 outfits
//           found" indicator uses, so the two pages agree.
export function headlineStats(outfits) {
  const found = distinctSlotCount(outfits)
  const years = outfits.map((o) => o.year).filter((y) => Number.isFinite(y))
  return {
    found,
    total: TOTAL_MATCHES,
    firstYear: years.length ? Math.min(...years) : null,
    lastYear: years.length ? Math.max(...years) : null,
  }
}

// Per Grand Slam: outfits logged so far vs. total round-slots she actually played
// (the "needed" denominator). `needed` mirrors the totalExpanded math in
// useMissingOutfits, scoped to one tournament; `logged` counts distinct filled slots.
export function grandSlamProgress(outfits) {
  return GRAND_SLAMS.map((tournament) => {
    let needed = 0
    for (const year of ACTIVE_YEARS) {
      for (const discipline of DISCIPLINES) {
        needed += getRoundNumbers(tournament, year, discipline).length
      }
    }
    const logged = distinctSlotCount(
      outfits.filter((o) => o.tournament === tournament),
    )
    return { tournament, needed, logged }
  })
}

// Color usage across the whole archive, alphabetized by color name. An outfit
// contributes to each color in its `colors` array. Only known colors are counted.
export function colorFrequency(outfits) {
  const counts = {}
  for (const o of outfits) {
    for (const c of o.colors ?? []) {
      if (c in COLOR_MAP) counts[c] = (counts[c] ?? 0) + 1
    }
  }
  return Object.keys(counts)
    .sort((a, b) => a.localeCompare(b))
    .map((color) => ({ color, count: counts[color] }))
}

// Distinct match slots filled per brand (Nike / Puma), plus how many filled slots
// have no brand recorded. Deduped by slot so it matches the "found" metric rather
// than raw catalogued-record counts.
export function brandCounts(outfits) {
  const brands = OUTFIT_BRANDS.map((brand) => ({
    brand,
    count: distinctSlotCount(outfits.filter((o) => o.brand === brand)),
  }))
  const unspecified = distinctSlotCount(
    outfits.filter((o) => !OUTFIT_BRANDS.includes(o.brand)),
  )
  return { brands, unspecified }
}

// Distinct colors worn each year, alphabetized, so a reader can skim years for
// recurring themes or high-variation seasons. Sorted by year ascending.
export function colorsByYear(outfits) {
  const byYear = new Map()
  for (const o of outfits) {
    if (!Number.isFinite(o.year)) continue
    if (!byYear.has(o.year)) byYear.set(o.year, new Set())
    for (const c of o.colors ?? []) {
      if (c in COLOR_MAP) byYear.get(o.year).add(c)
    }
  }
  return [...byYear.keys()]
    .sort((a, b) => a - b)
    .map((year) => ({
      year,
      colors: [...byYear.get(year)].sort((a, b) => a.localeCompare(b)),
    }))
}

// Most recent dataset change: the newest outfit's created_at (preserved on the
// snapshot). Auto-tracks additions — no manually maintained value. Returns an
// ISO string, or null if the dataset carries no timestamps.
export function lastUpdatedISO(outfits) {
  let max = null
  for (const o of outfits) {
    if (o.createdAt && (max === null || o.createdAt > max)) max = o.createdAt
  }
  return max
}
