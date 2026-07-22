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
  try { row = JSON.parse(res.body || '[]')[0] || {}; } catch (_) {}
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
    try { rows = JSON.parse(claim.body || '[]'); } catch (_) {}
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
  return {
    statusCode: 401,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Unauthorized' }),
  };
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
      try { body = JSON.parse(event.body || '{}'); } catch(e) {}
      if (body._authCheck) {
        return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
      }
      // Admin rebuild-status panel: current pending count + last build time.
      if (body._buildStatus) {
        const status = await getBuildStatus();
        return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(status) };
      }
      // Admin "Rebuild now" button (always) or tab-close auto-flush (ifPending).
      if (body._triggerRebuild) {
        const out = await fireBuildNow({ onlyIfPending: !!body.ifPending });
        return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(out) };
      }
    }

    let result;

    if (method === 'GET') {
      result = await sbFetch('outfits?select=*&order=year.asc,created_at.asc');

    } else if (method === 'POST') {
      const body = JSON.parse(event.body || '[]');
      const isBulk = Array.isArray(body);
      const payload = isBulk ? body : { focal_point: 'center', ...body };
      result = await sbFetch('outfits', {
        method: 'POST',
        prefer: isBulk ? 'resolution=ignore-duplicates' : 'return=representation',
        adminWrite: true,
        body: JSON.stringify(payload),
      });

    } else if (method === 'PATCH') {
      const id = params.id;
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      const patchBody = JSON.parse(event.body || '{}');
      result = await sbFetch(`outfits?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        adminWrite: true,
        body: JSON.stringify({ focal_point: 'center', ...patchBody }),
      });

    } else if (method === 'DELETE') {
      const id = params.id;
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      result = await sbFetch(`outfits?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        adminWrite: true,
      });

    } else {
      return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // Mark the site dirty when a write succeeded — the hourly scheduled function
    // turns accumulated changes into a single rebuild.
    if (isWrite && result.status >= 200 && result.status < 300) {
      await recordChange();
    }

    return {
      statusCode: result.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: result.body || '{}',
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
