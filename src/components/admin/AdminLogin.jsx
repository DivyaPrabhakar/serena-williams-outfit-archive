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
    <div className="min-h-[calc(100vh-60px)] bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="bg-[#1A1A1A] border border-[#2a2a2a] p-8 w-full max-w-sm">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#F0EDE6] mb-1">
          Admin Access
        </h2>
        <p className="text-[#8A877F] text-sm mb-6">
          Enter the admin password to manage the gallery
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={checking || !password}
            className="bg-[#C9A84C] text-[#0D0D0D] font-medium text-sm py-2.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {checking ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
