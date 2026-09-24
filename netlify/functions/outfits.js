// Netlify serverless function — ALL credentials live here, server-side only.
// The browser sends the admin password as a header; this function verifies it.
// Nothing sensitive ever appears in index.html.

const SB_URL          = process.env.VITE_SUPABASE_URL;
const SB_KEY          = process.env.VITE_SUPABASE_KEY;           // anon key — reads
const SB_SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;        // service role — writes (bypasses RLS)
const ADMIN_PASSWORD  = process.env.VITE_SUPABASE_ADMIN_TOKEN;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

const JSON_HEADERS = { ...CORS, 'Content-Type': 'application/json' };

// Every JSON response the handler returns goes through here so none of them
// can accidentally drop the CORS or Content-Type headers.
function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

// Rebuild strategy: writes don't trigger a build directly. Instead each
// successful write marks the site "dirty" (bumps pending_count + last_change_at
// on the single-row `build_state` table). A separate hourly scheduled function
// (rebuild-scheduler) fires the Netlify build hook at most once per hour, and
// only when there are pending changes — so cataloguing a whole session of images
// produces ONE rebuild instead of one per edit. The admin can also force an
// immediate rebuild via the "_triggerRebuild" action below.

// Mark the site dirty after a successful write (atomic increment via RPC).
async function recordChange() {
  try {
    await sbFetch('rpc/record_outfit_change', { method: 'POST', adminWrite: true, body: '{}' });
  } catch (err) {
    console.error('recordChange failed:', err.message);
  }
}

// Read the current rebuild state for the admin UI's status panel.
async function getBuildStatus() {
  const res = await sbFetch(
    'build_state?id=eq.1&select=pending_count,last_change_at,last_triggered_at',
    { adminWrite: true },
  );
  let row = {};
  try { row = JSON.parse(res.body || '[]')[0] || {}; } catch { /* malformed body, fall back to {} */ }
  return {
    pendingCount:    row.pending_count ?? 0,
    lastChangeAt:    row.last_change_at ?? null,
    lastTriggeredAt: row.last_triggered_at ?? null,
    serverNow:       new Date().toISOString(),
  };
}

// Fire a build immediately, resetting the pending counter, then ping the hook.
// Two modes:
//   - default (admin "Rebuild now" button): always fires, even with nothing
//     pending — for "I need to see it live right now".
//   - onlyIfPending (tab-close auto-flush): atomically claims pending changes and
//     skips entirely when the site is clean, so closing the admin tab after a
//     quiet session doesn't spawn a needless build. The server decides
//     atomically, so a just-made edit is never missed by a stale client.
// Awaiting the hook POST only waits for Netlify to ACCEPT the trigger (~ms),
// not for the build to finish.
async function fireBuildNow({ onlyIfPending = false } = {}) {
  const hook = process.env.NETLIFY_BUILD_HOOK_URL;

  if (onlyIfPending) {
    const claim = await sbFetch('build_state?id=eq.1&pending_count=gt.0', {
      method: 'PATCH',
      adminWrite: true,
      prefer: 'return=representation',
      body: JSON.stringify({ last_triggered_at: new Date().toISOString(), pending_count: 0 }),
    });
    let rows = [];
    try { rows = JSON.parse(claim.body || '[]'); } catch { /* malformed body, treat as no claim */ }
    if (!Array.isArray(rows) || rows.length === 0) {
      return { ok: true, triggered: false, reason: 'no pending changes' };
    }
  } else {
    await sbFetch('build_state?id=eq.1', {
      method: 'PATCH',
      adminWrite: true,
      body: JSON.stringify({ last_triggered_at: new Date().toISOString(), pending_count: 0 }),
    });
  }

  if (hook) {
    try {
      await fetch(hook, { method: 'POST' });
    } catch (err) {
      console.error('Build-hook trigger failed:', err.message);
    }
  }
  return { ok: true, triggered: !!hook };
}

function unauthorized() {
  return json(401, { error: 'Unauthorized' });
}

// Outfits sharing the same tournament/year/discipline/round get a stable,
// persisted `slug_suffix` (null = no suffix, i.e. the bare URL; N = renders as
// "-N") assigned once at creation, instead of being recomputed by position on
// every build. See src/lib/slugs.js for why: recomputing by position meant
// adding/editing/deleting any outfit in a group reshuffled every other
// outfit's URL, which is what caused the Search Console 404 / duplicate-
// canonical reports this migration fixes.
//
// excludeId lets a PATCH that changes group membership recompute its own
// suffix without counting its own (about-to-be-overwritten) row.
async function assignSlugSuffix({ tournament, year, discipline, round }, excludeId) {
  const qp = new URLSearchParams({
    select: 'slug_suffix',
    tournament: `eq.${tournament}`,
    year: `eq.${year}`,
    discipline: `eq.${discipline}`,
  });
  qp.set('round', round == null ? 'is.null' : `eq.${round}`);
  if (excludeId) qp.set('id', `neq.${excludeId}`);
  const res = await sbFetch(`outfits?${qp.toString()}`, { adminWrite: true });
  let rows = [];
  try { rows = JSON.parse(res.body || '[]'); } catch { /* malformed body, treat as no rows */ }
  if (rows.length === 0) return null;
  const maxOccupied = Math.max(...rows.map((r) => r.slug_suffix ?? 1));
  return maxOccupied + 1;
}

async function sbFetch(path, opts = {}) {
  const key = opts.adminWrite ? SB_SERVICE_KEY : SB_KEY;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || '',
    },
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const method = event.httpMethod;
  const clientToken = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || '';

  // All writes require the admin password as the token
  const isWrite = method !== 'GET';
  if (isWrite && clientToken !== ADMIN_PASSWORD) {
    return unauthorized();
  }

  try {
    const params = event.queryStringParameters || {};

    // Auth-check ping — just validate the token, return 200
    if (method === 'POST') {
      let body = {};
      try { body = JSON.parse(event.body || '{}'); } catch { /* malformed body, treat as {} */ }
      if (body._authCheck) {
        return json(200, { ok: true });
      }
      // Admin rebuild-status panel: current pending count + last build time.
      if (body._buildStatus) {
        const status = await getBuildStatus();
        return json(200, status);
      }
      // Admin "Rebuild now" button (always) or tab-close auto-flush (ifPending).
      if (body._triggerRebuild) {
        const out = await fireBuildNow({ onlyIfPending: !!body.ifPending });
        return json(200, out);
      }
    }

    let result;

    if (method === 'GET') {
      result = await sbFetch('outfits?select=*&order=year.asc,created_at.asc');

    } else if (method === 'POST') {
      const body = JSON.parse(event.body || '[]');
      const isBulk = Array.isArray(body);
      let payload;
      if (isBulk) {
        // Assign suffixes within the batch too, so two new rows landing in the
        // same group in one bulk call don't collide with each other.
        const batchCounts = new Map();
        payload = [];
        for (const row of body) {
          const group = { tournament: row.tournament, year: row.year, discipline: row.discipline ?? 'Singles', round: row.round ?? null };
          const key = JSON.stringify(group);
          const dbNext = await assignSlugSuffix(group);
          const batchNext = batchCounts.get(key);
          const slug_suffix = batchNext != null ? batchNext + 1 : dbNext;
          batchCounts.set(key, slug_suffix ?? 1);
          payload.push({ ...row, slug_suffix });
        }
      } else {
        const group = { tournament: body.tournament, year: body.year, discipline: body.discipline ?? 'Singles', round: body.round ?? null };
        const slug_suffix = await assignSlugSuffix(group);
        payload = { focal_point: 'center', ...body, slug_suffix };
      }
      result = await sbFetch('outfits', {
        method: 'POST',
        prefer: isBulk ? 'resolution=ignore-duplicates' : 'return=representation',
        adminWrite: true,
        body: JSON.stringify(payload),
      });

    } else if (method === 'PATCH') {
      const id = params.id;
      if (!id) return json(400, { error: 'Missing id' });
      const patchBody = JSON.parse(event.body || '{}');
      // Only recompute slug_suffix when a field that affects group membership
      // is actually changing — most edits (colors, notes, brand, ...) leave the
      // outfit's URL untouched.
      const groupFields = ['tournament', 'year', 'discipline', 'round'];
      if (groupFields.some((f) => f in patchBody)) {
        const currentRes = await sbFetch(`outfits?id=eq.${encodeURIComponent(id)}&select=tournament,year,discipline,round`, { adminWrite: true });
        const [current] = JSON.parse(currentRes.body || '[]');
        const group = {
          tournament: patchBody.tournament ?? current?.tournament,
          year: patchBody.year ?? current?.year,
          discipline: patchBody.discipline ?? current?.discipline ?? 'Singles',
          round: 'round' in patchBody ? patchBody.round ?? null : current?.round ?? null,
        };
        patchBody.slug_suffix = await assignSlugSuffix(group, id);
      }
      result = await sbFetch(`outfits?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        adminWrite: true,
        body: JSON.stringify({ focal_point: 'center', ...patchBody }),
      });

    } else if (method === 'DELETE') {
      const id = params.id;
      if (!id) return json(400, { error: 'Missing id' });
      result = await sbFetch(`outfits?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        adminWrite: true,
      });

    } else {
      return json(405, { error: 'Method not allowed' });
    }

    // Mark the site dirty when a write succeeded — the hourly scheduled function
    // turns accumulated changes into a single rebuild.
    if (isWrite && result.status >= 200 && result.status < 300) {
      await recordChange();
    }

    // result.body is already a serialized JSON string from Supabase — pass it
    // through as-is rather than going through json(), which would re-encode it.
    return {
      statusCode: result.status,
      headers: JSON_HEADERS,
      body: result.body || '{}',
    };

  } catch (err) {
    console.error('Function error:', err);
    return json(500, { error: err.message });
  }
};
