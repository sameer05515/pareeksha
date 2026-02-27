import { useState, FormEvent } from 'react'
import { login } from '@/api/auth'
import type { AuthUser } from '@/api/auth'
import styles from './LoginForm.module.css'

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Sign in</h2>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <label className={styles.label}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
          autoComplete="email"
        />
      </label>
      <label className={styles.label}>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
          autoComplete="current-password"
        />
      </label>
      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
