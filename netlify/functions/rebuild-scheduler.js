// Netlify Scheduled Function — runs hourly (see `config.schedule` below).
//
// Writes to outfits don't rebuild the site directly; they just bump
// `build_state.pending_count` (see outfits.js). This function turns those
// accumulated changes into a SINGLE Netlify build per hour: it atomically claims
// the pending changes (resets the counter and stamps last_triggered_at, but only
// when pending_count > 0) and, if it claimed anything, pings the build hook.
//
// Net effect: cataloguing a whole session of images produces one rebuild at the
// next hourly tick instead of one build per edit — and if nothing changed, no
// build fires at all.

const SB_URL         = process.env.VITE_SUPABASE_URL;
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // service role — bypasses RLS

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': SB_SERVICE_KEY,
      'Authorization': `Bearer ${SB_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || '',
    },
  });
  return { status: res.status, body: await res.text() };
}

export const config = { schedule: '0 * * * *' }; // top of every hour, UTC

export const handler = async () => {
  const hook = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hook) {
    console.log('rebuild-scheduler: NETLIFY_BUILD_HOOK_URL not set — skipping.');
    return { statusCode: 200, body: 'no hook configured' };
  }

  try {
    // Atomic claim: only matches (and returns a row) when there are pending
    // changes. Resets the counter BEFORE firing so a write landing during the
    // build is still counted for the next tick (at worst one extra rebuild).
    const claim = await sbFetch('build_state?id=eq.1&pending_count=gt.0', {
      method: 'PATCH',
      prefer: 'return=representation',
      body: JSON.stringify({ last_triggered_at: new Date().toISOString(), pending_count: 0 }),
    });

    let rows = [];
    try { rows = JSON.parse(claim.body || '[]'); } catch (_) {}

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('rebuild-scheduler: no pending changes — no build triggered.');
      return { statusCode: 200, body: 'no pending changes' };
    }

    await fetch(hook, { method: 'POST' });
    console.log('rebuild-scheduler: build triggered for pending changes.');
    return { statusCode: 200, body: 'build triggered' };
  } catch (err) {
    console.error('rebuild-scheduler failed:', err.message);
    return { statusCode: 500, body: err.message };
  }
};
