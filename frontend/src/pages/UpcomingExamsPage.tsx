import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { fetchUpcomingExamSchedules, registerForExam, unregisterFromExam } from '@/api/exam-schedules'
import type { ExamScheduleWithRegistration } from '@/types/exam-schedule'

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

export function UpcomingExamsPage() {
  const { user, isAuthenticated } = useAuth()
  const [schedules, setSchedules] = useState<ExamScheduleWithRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchUpcomingExamSchedules()
      .then(setSchedules)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleRegister = async (id: string) => {
    if (actionId) return
    setActionId(id)
    try {
      await registerForExam(id)
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, registered: true } : s))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register')
    } finally {
      setActionId(null)
    }
  }

  const handleUnregister = async (id: string) => {
    if (actionId) return
    setActionId(id)
    try {
      await unregisterFromExam(id)
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, registered: false } : s))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unregister')
    } finally {
      setActionId(null)
    }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'student') return <Navigate to="/" replace />

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-semibold text-accent m-0 tracking-wide">Upcoming exams</h2>
      <p className="text-sm text-muted m-0">
        View and register for scheduled exams. You can unregister before the exam date.
      </p>

      {loading && <p className="text-muted my-4">Loading…</p>}
      {error && (
        <div className="py-2 px-3 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && schedules.length === 0 && (
        <p className="text-muted my-4">No upcoming exams at the moment.</p>
      )}

      {!loading && schedules.length > 0 && (
        <div className="flex flex-col gap-3">
          {schedules.map((s) => (
            <article
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 px-4 bg-input border border-border rounded"
            >
              <div>
                <h3 className="font-semibold m-0 mb-1 text-text">{s.title}</h3>
                <p className="text-sm text-muted m-0">
                  {formatDateTime(s.scheduledAt)}
                  {s.durationMinutes != null && (
                    <span className="ml-2"> · {s.durationMinutes} min</span>
                  )}
                  {s.questionIds?.length ? (
                    <span className="ml-2"> · {s.questionIds.length} question(s)</span>
                  ) : null}
                </p>
              </div>
              <div>
                {s.registered ? (
                  <button
                    type="button"
                    onClick={() => handleUnregister(s.id)}
                    disabled={actionId === s.id}
                    className="py-2 px-4 border border-border rounded text-sm font-medium text-muted hover:bg-input hover:text-text disabled:opacity-50"
                  >
                    {actionId === s.id ? '…' : 'Unregister'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRegister(s.id)}
                    disabled={actionId === s.id}
                    className="py-2 px-4 bg-accent text-white border-0 rounded text-sm font-semibold hover:bg-accent-hover disabled:opacity-50"
                  >
                    {actionId === s.id ? '…' : 'Register'}
                  </button>
                )}
                {s.registered && (
                  <span className="ml-2 text-sm text-success font-medium">Registered</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
