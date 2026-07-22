import { useState, useEffect, useCallback } from 'react'
import { getBuildStatus, triggerRebuildNow } from '../../lib/api'

// The scheduled function rebuilds at the top of every hour (UTC). Compute ms
// until the next UTC :00 — done in UTC so it stays correct in timezones with a
// non-whole-hour offset (e.g. UTC+5:30).
function msUntilNextHour(now = new Date()) {
  const next = new Date(now)
  next.setUTCMinutes(0, 0, 0)
  next.setUTCHours(now.getUTCHours() + 1)
  return next - now
}

function formatDuration(ms) {
  const mins = Math.max(0, Math.round(ms / 60000))
  if (mins < 1)  return 'under a minute'
  if (mins < 60) return `~${mins} min`
  return '~1 hour'
}

function formatAgo(iso) {
  if (!iso) return 'never'
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (secs < 60)    return 'just now'
  const mins = Math.round(secs / 60)
  if (mins < 60)    return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24)     return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.round(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

export default function RebuildStatusPanel({ adminToken }) {
  const [status,  setStatus]  = useState(null)
  const [now,     setNow]     = useState(() => new Date())
  const [error,   setError]   = useState(null)
  const [busy,    setBusy]    = useState(false)
  const [flash,   setFlash]   = useState(null)

  const refresh = useCallback(async () => {
    try {
      const s = await getBuildStatus(adminToken)
      setStatus(s)
      setNow(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [adminToken])

  // Poll every 15s so the pending count reflects writes from any admin path.
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 15000)
    return () => clearInterval(id)
  }, [refresh])

  async function handleRebuildNow() {
    setBusy(true)
    setError(null)
    try {
      const out = await triggerRebuildNow(adminToken)
      setFlash(out.triggered ? 'Rebuild triggered.' : 'No build hook configured on the server.')
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
      setTimeout(() => setFlash(null), 4000)
    }
  }

  const pending = status?.pendingCount ?? 0
  const hasPending = pending > 0

  return (
    <div className="mt-8 bg-[#1A1A1A] border border-[#2a2a2a] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-[#F0EDE6]">
            Rebuilds
          </h3>
          {status ? (
            <p className="text-sm text-[#8A877F] mt-0.5">
              {hasPending ? (
                <>
                  <span className="text-[#C9A84C] font-medium">{pending}</span> pending
                  change{pending !== 1 ? 's' : ''}
                  {' · next hourly rebuild in '}
                  <span className="text-[#F0EDE6]">{formatDuration(msUntilNextHour(now))}</span>
                </>
              ) : (
                <>No pending changes · site is up to date</>
              )}
            </p>
          ) : (
            <p className="text-sm text-[#555] mt-0.5">Loading status…</p>
          )}
          {status && (
            <p className="text-[11px] text-[#555] mt-0.5">
              Last built {formatAgo(status.lastTriggeredAt)}
            </p>
          )}
        </div>

        <button
          onClick={handleRebuildNow}
          disabled={busy}
          className={`flex-none px-4 py-2 rounded text-xs font-medium transition-colors ${
            busy
              ? 'bg-[#1A1A1A] text-[#555] cursor-not-allowed border border-[#333]'
              : 'bg-[#C9A84C] text-[#0D0D0D] hover:bg-[#F0D98A] cursor-pointer'
          }`}
        >
          {busy ? 'Triggering…' : 'Rebuild now'}
        </button>
      </div>

      {flash && <p className="text-xs text-[#C9A84C] mt-3">{flash}</p>}
      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
    </div>
  )
}
