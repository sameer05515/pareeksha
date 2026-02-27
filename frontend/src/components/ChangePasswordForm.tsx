import { useState, FormEvent } from 'react'
import { changePassword } from '@/api/auth'
import styles from './ChangePasswordForm.module.css'

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
      <div className={styles.success}>
        <p>Your password has been updated successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Change password</h2>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <label className={styles.label}>
        Current password
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={styles.input}
          required
          autoComplete="current-password"
        />
      </label>
      <label className={styles.label}>
        New password
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={styles.input}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>
      <label className={styles.label}>
        Confirm new password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>
      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
