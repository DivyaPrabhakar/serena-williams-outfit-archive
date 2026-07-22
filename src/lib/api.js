import { normalizeGettyEmbed } from './imageUtils'

const API = '/.netlify/functions/outfits'

// ── Row ↔ app-model conversion ────────────────────────────────────────────

export function rowToOutfit(r) {
  return {
    id:          r.id,
    imageUrl:    r.image_url,
    year:        r.year,
    tournament:  r.tournament,
    discipline:  r.discipline  ?? 'Singles',
    round:       r.round       ?? null,
    roundNumber: r.round_number ?? null,
    colors:      r.colors      ?? [],
    notes:       r.notes       ?? null,
    focal_point: r.focal_point ?? 'center',
    brand:       r.brand       ?? null,
  }
}

export function outfitToRow(o) {
  return {
    id:           o.id,
    image_url:    normalizeGettyEmbed(o.imageUrl),
    year:         o.year,
    tournament:   o.tournament,
    discipline:   o.discipline,
    round:        o.round        ?? null,
    round_number: o.roundNumber  ?? null,
    colors:       o.colors       ?? [],
    notes:        o.notes        ?? null,
    focal_point:  o.focal_point  ?? 'center',
    brand:        o.brand        ?? null,
  }
}

// ── Fetch helpers ───────────────────────────────────────────────────────────
// Single place that talks to the outfits function: attaches the admin token
// (required for every write) and JSON-encodes the body when present.
async function adminFetch(query = '', { method = 'GET', body, adminToken, keepalive } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (adminToken) headers['x-admin-token'] = adminToken
  return fetch(`${API}${query}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...(keepalive && { keepalive: true }),
  })
}

async function assertOk(res, label) {
  if (!res.ok) {
    let detail = ''
    try { detail = await res.text() } catch {}
    throw new Error(`${label} (${res.status})${detail ? ': ' + detail : ''}`)
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────

export async function authCheck(password) {
  const res = await adminFetch('', { method: 'POST', adminToken: password, body: { _authCheck: true } })
  if (res.status === 401) return false
  if (!res.ok) throw new Error('Server error')
  return true
}

// ── Rebuild status ──────────────────────────────────────────────────────────

// Current dirty-state for the admin rebuild panel: how many changes are pending
// and when the site was last (re)built. Requires the admin token.
export async function getBuildStatus(adminToken) {
  const res = await adminFetch('', { method: 'POST', adminToken, body: { _buildStatus: true } })
  await assertOk(res, 'Failed to load rebuild status')
  return res.json()
}

// Force an immediate rebuild ("Rebuild now" button). Requires the admin token.
export async function triggerRebuildNow(adminToken) {
  const res = await adminFetch('', { method: 'POST', adminToken, body: { _triggerRebuild: true } })
  await assertOk(res, 'Failed to trigger rebuild')
  return res.json()
}

// Fire a rebuild as the page unloads so pending changes go live on tab close.
// `ifPending` lets the server decide atomically (builds only when something's
// pending — never misses a just-made edit, never builds a clean tab), and
// `keepalive` lets the request complete even after the page is gone.
export function triggerRebuildOnUnload(adminToken) {
  try {
    adminFetch('', {
      method: 'POST',
      adminToken,
      body: { _triggerRebuild: true, ifPending: true },
      keepalive: true,
    })
  } catch { /* best-effort during unload */ }
}

// ── CRUD ──────────────────────────────────────────────────────────────────

export async function fetchOutfits() {
  const res = await adminFetch()
  if (!res.ok) throw new Error('Failed to fetch outfits')
  const rows = await res.json()
  return (rows ?? []).map(rowToOutfit)
}

export async function insertOutfit(outfit, adminToken) {
  const row = { id: crypto.randomUUID(), ...outfitToRow(outfit) }
  const res = await adminFetch('', { method: 'POST', adminToken, body: row })
  await assertOk(res, 'Insert failed')
  return res.json()
}

export async function updateOutfit(outfit, adminToken) {
  const res = await adminFetch(`?id=${encodeURIComponent(outfit.id)}`, {
    method: 'PATCH', adminToken, body: outfitToRow(outfit),
  })
  await assertOk(res, 'Update failed')
  return res.json()
}

// Patch an arbitrary subset of columns on one outfit (partial update).
export async function patchOutfit(id, fields, adminToken) {
  const res = await adminFetch(`?id=${encodeURIComponent(id)}`, { method: 'PATCH', adminToken, body: fields })
  await assertOk(res, 'Save failed')
  return res.json()
}

export async function deleteOutfit(id, adminToken) {
  const res = await adminFetch(`?id=${encodeURIComponent(id)}`, { method: 'DELETE', adminToken })
  await assertOk(res, 'Delete failed')
}
