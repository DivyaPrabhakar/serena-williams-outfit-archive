// Netlify serverless function — ALL credentials live here, server-side only.
// The browser sends the admin password as a header; this function verifies it.
// Nothing sensitive ever appears in index.html.

const SB_URL = process.env.VITE_SUPABASE_URL;
const SB_KEY = process.env.VITE_SUPABASE_KEY;
const SB_ADMIN_TOKEN = process.env.VITE_SUPABASE_ADMIN_TOKEN;
const ADMIN_PASSWORD = process.env.VITE_SUPABASE_ADMIN_TOKEN;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

function unauthorized() {
  return {
    statusCode: 401,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Unauthorized' }),
  };
}

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || '',
      ...(opts.adminWrite ? { 'x-admin-token': SB_ADMIN_TOKEN } : {}),
    },
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

exports.handler = async (event) => {
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
      result = await sbFetch('outfits', {
        method: 'POST',
        prefer: isBulk ? 'resolution=ignore-duplicates' : 'return=representation',
        adminWrite: true,
        body: JSON.stringify(body),
      });

    } else if (method === 'PATCH') {
      const id = params.id;
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      result = await sbFetch(`outfits?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        adminWrite: true,
        body: event.body,
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
