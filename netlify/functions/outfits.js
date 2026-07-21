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

// After a successful write, ping the Netlify build hook so the pre-rendered
// static pages (built from a snapshot) pick up the change. Debounced to ~1
// build/minute via an atomic compare-and-set on the single-row `build_state`
// table: the PATCH only matches (and returns a row) when >60s have passed since
// the last trigger, so cataloguing a whole round back-to-back collapses to one
// build instead of one per edit. No-op unless NETLIFY_BUILD_HOOK_URL is set.
//
// Awaiting the hook POST only waits for Netlify to ACCEPT the trigger (~ms), not
// for the build to finish — the admin's request returns immediately either way.
// We await deliberately: in Lambda the execution context freezes once the
// response returns, so a non-awaited "background" fetch may never be sent.
async function triggerRebuild() {
  const hook = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hook) return;

  const now = new Date();
  const cutoff = new Date(now.getTime() - 60_000).toISOString();
  try {
    // Atomic claim: UPDATE ... WHERE last_triggered_at < cutoff. Concurrent
    // invocations serialize on the row lock; only the first past the window wins.
    const claim = await sbFetch(
      `build_state?id=eq.1&last_triggered_at=lt.${encodeURIComponent(cutoff)}`,
      {
        method: 'PATCH',
        adminWrite: true,
        prefer: 'return=representation',
        body: JSON.stringify({ last_triggered_at: now.toISOString() }),
      }
    );
    let rows = [];
    try { rows = JSON.parse(claim.body || '[]'); } catch (_) {}
    // Skip ONLY when the claim clearly succeeded but matched no row (recent build).
    // Any error / non-2xx falls through and fires anyway (fail open: publishing
    // the edit matters more than a rare extra build).
    if (claim.status >= 200 && claim.status < 300 && Array.isArray(rows) && rows.length === 0) {
      return;
    }
  } catch (err) {
    console.error('Build-hook debounce check failed, firing anyway:', err.message);
  }

  try {
    await fetch(hook, { method: 'POST' });
  } catch (err) {
    console.error('Build-hook trigger failed:', err.message);
  }
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

    // Refresh the pre-rendered pages when a write succeeded.
    if (isWrite && result.status >= 200 && result.status < 300) {
      await triggerRebuild();
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
