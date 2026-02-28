import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  getCurrentAttempt,
  submitAttemptAnswers,
  startAttempt,
  type ActiveAttemptResponse,
  type AttemptQuestion,
} from '@/api/exam-schedules'

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ExamAttemptPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<ActiveAttemptResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reAttempting, setReAttempting] = useState(false)
  const [focusLost, setFocusLost] = useState(false)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fullscreenRequested = useRef(false)
  const autoSubmitDone = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const endTimeMs = data
    ? new Date(data.attempt.startedAt).getTime() + data.schedule.durationMinutes * 60 * 1000
    : null

  const tick = useCallback(() => {
    if (endTimeMs == null) return
    const r = endTimeMs - Date.now()
    setRemainingMs(r)
    if (r <= 0 && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [endTimeMs])

  useEffect(() => {
    if (endTimeMs == null) return
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [endTimeMs, tick])

  const loadAttempt = useCallback(() => {
    setLoading(true)
    setError(null)
    getCurrentAttempt()
      .then((d) => {
        setData(d)
        setAnswers({})
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No active attempt')
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadAttempt()
  }, [loadAttempt])

  useEffect(() => {
    if (!data || fullscreenRequested.current) return
    fullscreenRequested.current = true
    const el = document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    }
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [data])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && data && !submitted) setFocusLost(true)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [data, submitted])

  const handleSubmit = async () => {
    if (!data || submitting || submitted) return
    setSubmitting(true)
    try {
      await submitAttemptAnswers(data.attempt.id, answers)
      setSubmitted(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (
      remainingMs !== null &&
      remainingMs <= 0 &&
      data &&
      !submitted &&
      !submitting &&
      !autoSubmitDone.current
    ) {
      autoSubmitDone.current = true
      submitAttemptAnswers(data.attempt.id, answersRef.current)
        .then(() => setSubmitted(true))
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to submit'))
        .finally(() => {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
        })
    }
  }, [remainingMs, data, submitted, submitting])

  if (!isAuthenticated) {
    navigate('/login', { replace: true })
    return null
  }
  if (user?.role !== 'student') {
    navigate('/', { replace: true })
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base p-4">
        <p className="text-muted">Loading exam…</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-base p-4">
        <p className="text-error text-center">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/exams')}
          className="py-2 px-4 bg-accent text-white rounded font-medium"
        >
          Back to Upcoming exams
        </button>
      </div>
    )
  }

  if (submitted) {
    const scheduleId = data?.schedule.id
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-base p-4">
        <p className="text-success font-semibold text-lg">Exam submitted successfully.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/exams')}
            className="py-2 px-4 bg-transparent border border-border rounded font-medium text-muted hover:bg-input hover:text-text"
          >
            Back to Upcoming exams
          </button>
          {scheduleId && (
            <button
              type="button"
                onClick={async () => {
                if (!scheduleId || reAttempting) return
                setReAttempting(true)
                autoSubmitDone.current = false
                try {
                  await startAttempt(scheduleId)
                  setSubmitted(false)
                  setData(null)
                  loadAttempt()
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Cannot re-attempt')
                } finally {
                  setReAttempting(false)
                }
              }}
              disabled={reAttempting}
              className="py-2 px-4 bg-accent text-white rounded font-medium disabled:opacity-50"
            >
              {reAttempting ? 'Starting…' : 'Re-attempt'}
            </button>
          )}
          {data?.attempt.id && (
            <button
              type="button"
              onClick={() => navigate(`/exam/result/${data.attempt.id}`)}
              className="py-2 px-4 bg-card border border-accent text-accent rounded font-medium hover:bg-accent hover:text-white"
            >
              See results
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!data) return null

  const isTimeUp = remainingMs !== null && remainingMs <= 0

  return (
    <div className="min-h-screen bg-base text-text flex flex-col">
      {/* Screen block overlay when user leaves tab */}
      {focusLost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white p-6"
          role="alert"
        >
          <div className="text-center max-w-md">
            <p className="font-semibold text-lg mb-2">Focus lost</p>
            <p className="text-sm mb-4">
              Do not switch tabs or leave this window. Your attempt may be invalidated. Return to the exam tab to continue.
            </p>
            <button
              type="button"
              onClick={() => setFocusLost(false)}
              className="py-2 px-4 bg-accent text-white rounded"
            >
              I’m back
            </button>
          </div>
        </div>
      )}

      {/* Header with timer and title */}
      <header className="sticky top-0 z-10 bg-card border-b border-border py-3 px-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-semibold m-0">{data.schedule.title}</h1>
        <div className="flex items-center gap-4">
          <span
            className={`font-mono font-semibold tabular-nums ${
              remainingMs != null && remainingMs < 60_000 ? 'text-error' : 'text-accent'
            }`}
          >
            Time: {remainingMs != null ? formatRemaining(remainingMs) : '--:--'}
          </span>
          {!isTimeUp && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="py-2 px-4 bg-accent text-white rounded font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit exam'}
            </button>
          )}
        </div>
      </header>

      {/* Questions */}
      <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {data.questions.length === 0 ? (
          <p className="text-muted">No questions in this exam.</p>
        ) : (
          <ol className="list-decimal list-inside space-y-6">
            {data.questions.map((q: AttemptQuestion) => (
              <li key={q.id} className="border border-border rounded p-4 bg-card">
                <p className="font-medium mb-3 mt-0">{q.questionText}</p>
                <ul className="m-0 p-0 list-none">
                  {q.options.map((opt, j) => (
                    <li key={j} className="mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === j}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: j }))}
                          disabled={isTimeUp || submitting}
                          className="accent-accent"
                        />
                        <span>{opt}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  )
}
