// Canonical identity for a "match slot" — a unique (year, tournament, discipline,
// round). One filled slot counts as one catalogued outfit everywhere on the site.
//
// Every slot key, slot→outfit map, DOM id, and distinct-slot count goes through
// this module so the gallery, the landing-page "N / 1280 found" indicator, and the
// stats page all measure the same thing and can never quietly drift apart.

// Slot key from individual parts.
export function slotKey(year, tournament, discipline, roundNumber) {
  return `${year}_${tournament}_${discipline}_${roundNumber}`
}

// Slot key for an outfit record.
export function outfitSlotKey(o) {
  return slotKey(o.year, o.tournament, o.discipline, o.roundNumber)
}

// Number of distinct match slots filled by a list of outfits — the canonical
// "found" / "distinct match slots" metric used across the site.
export function distinctSlotCount(outfits) {
  return new Set(outfits.map(outfitSlotKey)).size
}

// Map of slot key → outfit, for slot lookups while rendering the gallery.
export function outfitSlotMap(outfits) {
  return new Map(outfits.map((o) => [outfitSlotKey(o), o]))
}

// Tournament-level (year + tournament) key, for tournament presence checks.
export function tournamentKey(year, tournament) {
  return `${year}_${tournament}`
}

// DOM id for a slot element — scroll-into-view / highlight targets.
export function slotDomId(year, tournament, discipline, roundNumber) {
  return `slot-${year}-${tournament}-${discipline}-${roundNumber}`
}
