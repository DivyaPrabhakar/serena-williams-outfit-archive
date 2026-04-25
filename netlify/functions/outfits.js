// Netlify serverless function — all Supabase credentials live here, server-side only.
// The browser never sees SB_URL, SB_KEY, or SB_ADMIN_TOKEN.
// Environment variables are set in the Netlify dashboard, never in code.

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;
const SB_ADMIN_TOKEN = process.env.SUPABASE_ADMIN_TOKEN;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || '',
      ...(opts.adminToken ? { 'x-admin-token': SB_ADMIN_TOKEN } : {}),
    },
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const method = event.httpMethod;

  // Validate admin token for all write operations
  if (method !== 'GET') {
    const clientToken = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
    if (!clientToken || clientToken !== SB_ADMIN_TOKEN) {
      return {
        statusCode: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }
  }

  try {
    let result;
    const params = event.queryStringParameters || {};

    if (method === 'GET') {
      // GET all outfits, ordered by year then created_at
      result = await sbFetch('outfits?select=*&order=year.asc,created_at.asc');

    } else if (method === 'POST') {
      // POST: insert one or many outfits
      const body = JSON.parse(event.body || '[]');
      const isBulk = Array.isArray(body);
      result = await sbFetch('outfits', {
        method: 'POST',
        prefer: isBulk ? 'resolution=ignore-duplicates' : 'return=representation',
        adminToken: true,
        body: JSON.stringify(body),
      });

    } else if (method === 'PATCH') {
      // PATCH: update by id — passed as query param ?id=xxx
      const id = params.id;
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      result = await sbFetch(`outfits?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        adminToken: true,
        body: event.body,
      });

    } else if (method === 'DELETE') {
      // DELETE: delete by id — passed as query param ?id=xxx
      const id = params.id;
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      result = await sbFetch(`outfits?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        adminToken: true,
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
