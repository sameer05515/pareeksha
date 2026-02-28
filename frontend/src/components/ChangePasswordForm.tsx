import { useState, FormEvent } from 'react'
import { changePassword } from '@/api/auth'

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match')
      return
    }
    setLoading(true)
    try {
      const res = await changePassword(currentPassword, newPassword)
      if (res.success) {
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        return
      }
      setError(res.message ?? 'Failed to update password')
    } catch {
      setError('Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="py-4 text-success">
        <p className="m-0">Your password has been updated successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[360px]">
      <h2 className="m-0 mb-2 text-xl">Change password</h2>
      {error && (
        <div className="py-2 px-3 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {error}
        </div>
      )}
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Current password
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
          required
          autoComplete="current-password"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        New password
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Confirm new password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>
      <button
        type="submit"
        className="py-3 px-6 bg-accent text-white border-0 rounded font-semibold mt-1 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
