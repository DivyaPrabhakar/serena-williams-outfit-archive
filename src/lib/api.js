const API = '/.netlify/functions/outfits'

// ── Row ↔ app-model conversion ────────────────────────────────────────────

export function rowToOutfit(r) {
  return {
    id:          r.id,
    imageUrl:    r.image_url,
    year:        r.year,
    tournament:  r.tournament,
    discipline:  r.discipline ?? 'Singles',
    round:       r.round       ?? null,
    roundNumber: r.round_number ?? null,
    colors:      r.colors      ?? [],
    notes:       r.notes       ?? null,
  }
}

export function outfitToRow(o) {
  return {
    id:           o.id,
    image_url:    o.imageUrl,
    year:         o.year,
    tournament:   o.tournament,
    discipline:   o.discipline,
    round:        o.round       ?? null,
    round_number: o.roundNumber ?? null,
    colors:       o.colors      ?? [],
    notes:        o.notes       ?? null,
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────

export async function authCheck(password) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': password },
    body: JSON.stringify({ _authCheck: true }),
  })
  if (res.status === 401) return false
  if (!res.ok) throw new Error('Server error')
  return true
}

// ── CRUD ──────────────────────────────────────────────────────────────────

export async function fetchOutfits() {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Failed to fetch outfits')
  const rows = await res.json()
  return (rows ?? []).map(rowToOutfit)
}

export async function insertOutfit(outfit, adminToken) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
    body: JSON.stringify(outfitToRow(outfit)),
  })
  if (!res.ok) throw new Error('Insert failed')
  return res.json()
}

export async function updateOutfit(outfit, adminToken) {
  const res = await fetch(`${API}?id=${encodeURIComponent(outfit.id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
    body: JSON.stringify(outfitToRow(outfit)),
  })
  if (!res.ok) throw new Error('Update failed')
  return res.json()
}

export async function deleteOutfit(id, adminToken) {
  const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': adminToken },
  })
  if (!res.ok) throw new Error('Delete failed')
}
