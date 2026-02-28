import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getAttemptResult, type AttemptResultResponse } from '@/api/exam-schedules'

export function ExamResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState<AttemptResultResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!attemptId || !isAuthenticated || user?.role !== 'student') return
    setLoading(true)
    setError(null)
    getAttemptResult(attemptId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load result'))
      .finally(() => setLoading(false))
  }, [attemptId, isAuthenticated, user?.role])

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
        <p className="text-muted">Loading result…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-base p-4">
        <p className="text-error text-center">{error ?? 'Result not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/exams')}
          className="min-h-[44px] py-2 px-4 bg-accent text-white rounded font-medium touch-manipulation"
        >
          Back to Upcoming exams
        </button>
      </div>
    )
  }

  const pct = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0

  return (
    <div className="min-h-screen bg-base p-4 sm:p-6">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="font-semibold text-accent m-0 mb-1">{data.schedule.title}</h1>
        <p className="text-sm text-muted m-0 mb-6">Exam result</p>

        <div className="mb-8 p-4 bg-card border border-border rounded text-center">
          <p className="text-3xl font-bold m-0 mb-1 text-text">
            {data.score} / {data.total}
          </p>
          <p className="text-muted m-0">{pct}% correct</p>
        </div>

        <h2 className="text-base font-semibold text-text m-0 mb-4">Question-wise result</h2>
        <ol className="list-decimal list-inside space-y-4">
          {data.results.map((r) => (
            <li key={r.questionId} className="border border-border rounded p-4 bg-card">
              <p className="font-medium m-0 mb-2 text-text">{r.questionText}</p>
              <ul className="m-0 pl-4 space-y-1 text-sm">
                {r.options.map((opt, j) => (
                  <li
                    key={j}
                    className={
                      j === r.correctIndex
                        ? 'text-success font-medium'
                        : j === r.selectedIndex && !r.correct
                          ? 'text-error'
                          : 'text-muted'
                    }
                  >
                    {opt}
                    {j === r.correctIndex && ' ✓ Correct'}
                    {j === r.selectedIndex && !r.correct && j !== r.correctIndex && ' (Your answer)'}
                  </li>
                ))}
              </ul>
              <p className="text-sm m-0 mt-2">
                {r.correct ? (
                  <span className="text-success">Correct</span>
                ) : (
                  <span className="text-error">Incorrect</span>
                )}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/exams')}
            className="py-2 px-4 bg-accent text-white rounded font-medium hover:bg-accent-hover"
          >
            Back to Upcoming exams
          </button>
        </div>
      </div>
    </div>
  )
}
