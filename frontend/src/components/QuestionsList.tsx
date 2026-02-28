import { useState, useEffect, useCallback } from 'react'
import { fetchQuestions } from '@/api/questions'
import type { Question } from '@/types/question'

export function QuestionsList({ refreshTrigger }: { refreshTrigger?: number }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchQuestions()
      .then(setQuestions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshTrigger])

  if (loading) return <p className="text-center text-muted my-4">Loading questions…</p>
  if (error) return <p className="text-center text-error my-4">{error}</p>
  if (questions.length === 0) return <p className="text-center text-muted my-4">No questions yet. Add one above.</p>

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString()
    } catch {
      return s
    }
  }

  return (
    <div className="w-full">
      <p className="text-sm text-muted m-0 mb-4">{questions.length} question(s)</p>
      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <article key={q.id} className="bg-input border border-border rounded p-4 py-5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-accent text-sm">Q{i + 1}</span>
              <span className="text-xs text-muted">{formatDate(q.createdAt)}</span>
            </div>
            <p className="m-0 mb-3 text-base leading-relaxed">{q.questionText}</p>
            <ul className="m-0 pl-5 list-none">
              {q.options.map((opt, j) => (
                <li
                  key={j}
                  className={`relative pl-2 mb-1.5 before:content-['•'] before:absolute before:left-[-1rem] before:text-muted ${
                    j === q.correctIndex ? 'text-success font-medium before:text-success' : 'text-muted'
                  }`}
                >
                  {opt}
                  {j === q.correctIndex && (
                    <span className="ml-2 text-[0.7rem] py-0.5 px-1.5 bg-success/20 text-success rounded">
                      Correct
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
