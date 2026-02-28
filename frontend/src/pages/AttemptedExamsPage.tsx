import { useState, useEffect, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getMyAttempts } from '@/api/exam-schedules'

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function AttemptedExamsPage() {
  const { user, isAuthenticated } = useAuth()
  const [attempts, setAttempts] = useState<Awaited<ReturnType<typeof getMyAttempts>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getMyAttempts()
      .then(setAttempts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'student') return <Navigate to="/" replace />

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-semibold text-accent m-0 tracking-wide">Attempted exams</h2>
      <p className="text-sm text-muted m-0">
        View results of exams you have already attempted.
      </p>

      {loading && <p className="text-muted my-4">Loading…</p>}
      {error && (
        <div className="py-2 px-3 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && attempts.length === 0 && (
        <p className="text-muted my-4">You have not attempted any exam yet.</p>
      )}

      {!loading && attempts.length > 0 && (
        <div className="flex flex-col gap-3">
          {attempts.map((a) => (
            <article
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 px-4 bg-input border border-border rounded"
            >
              <div>
                <h3 className="font-semibold m-0 mb-1 text-text">{a.scheduleTitle}</h3>
                <p className="text-sm text-muted m-0">
                  Submitted: {formatDateTime(a.submittedAt)}
                  {a.total > 0 && (
                    <span className="ml-2">
                      · Score: <span className="font-medium text-text">{a.score} / {a.total}</span>
                      {' '}({Math.round((a.score / a.total) * 100)}%)
                    </span>
                  )}
                </p>
              </div>
              <Link
                to={`/exam/result/${a.id}`}
                className="py-2 px-4 bg-accent text-white rounded text-sm font-semibold no-underline hover:bg-accent-hover"
              >
                See result
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
