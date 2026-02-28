import { useState, useEffect, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { fetchUpcomingExamSchedules, registerForExam, unregisterFromExam, startAttempt, getCurrentAttempt } from '@/api/exam-schedules'
import type { ExamScheduleWithRegistration } from '@/types/exam-schedule'

function isExamActive(schedule: ExamScheduleWithRegistration): boolean {
  const now = Date.now()
  const start = new Date(schedule.scheduledAt).getTime()
  const durationMs = (schedule.durationMinutes ?? 60) * 60 * 1000
  const end = start + durationMs
  return now >= start && now < end
}

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
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<ExamScheduleWithRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [hasActiveAttempt, setHasActiveAttempt] = useState(false)

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

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') return
    getCurrentAttempt()
      .then(() => setHasActiveAttempt(true))
      .catch(() => setHasActiveAttempt(false))
  }, [isAuthenticated, user?.role])

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

  const handleStartExam = async (scheduleId: string) => {
    if (startingId) return
    setStartingId(scheduleId)
    setError(null)
    try {
      await startAttempt(scheduleId)
      navigate('/exam/attempt')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start exam')
    } finally {
      setStartingId(null)
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

      {hasActiveAttempt && (
        <div className="py-3 px-4 bg-accent/10 border border-accent rounded flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">You have an exam in progress.</span>
          <button
            type="button"
            onClick={() => navigate('/exam/attempt')}
            className="py-2 px-4 min-h-[44px] bg-accent text-white rounded font-semibold hover:bg-accent-hover touch-manipulation"
          >
            Continue exam
          </button>
        </div>
      )}

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
              className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 py-4 px-4 bg-input border border-border rounded"
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
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {s.registered && isExamActive(s) ? (
                  <button
                    type="button"
                    onClick={() => handleStartExam(s.id)}
                    disabled={startingId === s.id}
                    className="py-2 px-4 min-h-[44px] bg-success text-white border-0 rounded text-sm font-semibold hover:opacity-90 disabled:opacity-50 touch-manipulation"
                  >
                    {startingId === s.id ? 'Starting…' : 'Start exam'}
                  </button>
                ) : null}
                {s.registered ? (
                  <button
                    type="button"
                    onClick={() => handleUnregister(s.id)}
                    disabled={actionId === s.id || isExamActive(s)}
                    className="py-2 px-4 min-h-[44px] border border-border rounded text-sm font-medium text-muted hover:bg-input hover:text-text disabled:opacity-50 touch-manipulation"
                  >
                    {actionId === s.id ? '…' : 'Unregister'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRegister(s.id)}
                    disabled={actionId === s.id}
                    className="py-2 px-4 min-h-[44px] bg-accent text-white border-0 rounded text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 touch-manipulation"
                  >
                    {actionId === s.id ? '…' : 'Register'}
                  </button>
                )}
                {s.registered && !isExamActive(s) && (
                  <span className="text-sm text-success font-medium">Registered</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
