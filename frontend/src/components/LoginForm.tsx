import { useState, FormEvent } from 'react'
import { login } from '@/api/auth'
import type { AuthUser } from '@/api/auth'

interface LoginFormProps {
  onSuccess: (user: AuthUser, token: string) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email.trim(), password)
      if (res.success && res.user && res.token) {
        onSuccess(res.user as AuthUser, res.token)
        return
      }
      setError(res.message ?? 'Login failed')
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[360px]">
      <h2 className="m-0 mb-2 text-xl">Sign in</h2>
      {error && (
        <div className="py-2 px-3 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {error}
        </div>
      )}
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-w-0 py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
          required
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-w-0 py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
          required
          autoComplete="current-password"
        />
      </label>
      <button
        type="submit"
        className="w-full min-h-[44px] py-3 px-6 bg-accent text-white border-0 rounded font-semibold mt-1 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation"
        disabled={loading}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
