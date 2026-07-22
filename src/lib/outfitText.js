// Human-readable, SEO-oriented copy for outfits and tournaments. Centralized so
// titles, meta descriptions, alt text, and JSON-LD all stay consistent and each
// weave a natural variation of "Serena Williams outfits".

import { ROUND_LABELS } from './constants'

export function roundLabel(round) {
  return round ? (ROUND_LABELS[round] ?? round) : ''
}

function colorPhrase(colors) {
  const c = (colors ?? []).filter(Boolean)
  if (c.length === 0) return ''
  if (c.length === 1) return c[0].toLowerCase()
  if (c.length === 2) return `${c[0].toLowerCase()} and ${c[1].toLowerCase()}`
  return `${c.slice(0, -1).map((x) => x.toLowerCase()).join(', ')}, and ${c[c.length - 1].toLowerCase()}`
}

// "Wimbledon 2015 Final", "US Open 2012", "Roland Garros 2013 Doubles Final"
function outfitContext(o) {
  const parts = [o.tournament, o.year]
  const rl = roundLabel(o.round)
  if (o.discipline && o.discipline !== 'Singles') parts.push(o.discipline)
  if (rl) parts.push(rl)
  return parts.join(' ')
}

export function outfitTitle(o) {
  return `Serena Williams ${outfitContext(o)} Outfit | Serena Williams Fit-dex`
}

export function outfitHeading(o) {
  return `Serena Williams — ${outfitContext(o)}`
}

export function outfitDescription(o) {
  const color = colorPhrase(o.colors)
  const brand = o.brand ? ` by ${o.brand}` : ''
  const look = color ? `${color} outfit${brand}` : `outfit${brand}`
  const rl = roundLabel(o.round)
  const where = rl ? `${rl} of the ${o.year} ${o.tournament}` : `${o.year} ${o.tournament}`
  const disc = o.discipline && o.discipline !== 'Singles' ? ` ${o.discipline.toLowerCase()}` : ''
  return `The ${look} Serena Williams wore for her${disc} match at the ${where}. From the Serena Williams outfits archive documenting every on-court look.`
}

// Descriptive alt text including her name and context.
export function outfitAlt(o) {
  const color = colorPhrase(o.colors)
  const brand = o.brand ? ` ${o.brand}` : ''
  const look = [color, brand].filter(Boolean).join('').trim()
  const suffix = look ? ` — ${look} outfit` : ''
  return `Serena Williams at ${outfitContext(o)}${suffix}`
}

export function tournamentTitle(t, year) {
  return `Serena Williams Outfits — ${t} ${year} | Serena Williams Fit-dex`
}

export function tournamentHeading(t, year) {
  return `Serena Williams Outfits at the ${year} ${t}`
}

export function tournamentDescription(t, year, count) {
  const n = count === 1 ? 'outfit' : 'outfits'
  return `Every Serena Williams outfit from the ${year} ${t}${count ? ` — ${count} ${n}` : ''}, catalogued by round and discipline in the Serena Williams Fit-dex archive.`
}

// ── Tournament hub page (all years of one tournament) ──
export function tournamentHubTitle(t) {
  return `Serena Williams ${t} Outfits | Serena Williams Fit-dex`
}

export function tournamentHubHeading(t) {
  return `Serena Williams ${t} Outfits`
}

export function tournamentHubDescription(t, count, years) {
  const n = count === 1 ? 'outfit' : 'outfits'
  const span =
    years && years.length > 1 ? ` from ${years[0]} to ${years[years.length - 1]}` : ''
  return `Every Serena Williams outfit worn at ${t}${span} — ${count} ${n} catalogued by year, round, and discipline in the Serena Williams Fit-dex archive.`
}
