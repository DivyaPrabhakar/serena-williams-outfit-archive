import { useState } from 'react'
import { authCheck } from '../../lib/api'

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const [error,    setError]    = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) return
    setChecking(true)
    setError(null)
    try {
      const ok = await authCheck(password)
      if (ok) {
        onSuccess(password)
      } else {
        setError('Incorrect password')
        setPassword('')
      }
    } catch {
      setError('Could not reach server — try again')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-dark flex items-center justify-center px-4">
      <div className="bg-dark2 border-2 border-white p-8 w-full max-w-sm">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-ink mb-1">
          Admin Access
        </h2>
        <p className="text-muted text-sm mb-6">
          Enter the admin password to manage the gallery
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="w-full bg-dark border-2 border-white text-ink px-3 py-2.5 text-sm outline-none focus:border-brand placeholder-line-strong"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={checking || !password}
            className="bg-brand text-dark font-medium text-sm py-2.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {checking ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
