import { useState, useEffect, useCallback } from 'react'
import { fetchQuestions } from '@/api/questions'
import type { Question } from '@/types/question'
import styles from './QuestionsList.module.css'

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

  if (loading) return <p className={styles.message}>Loading questions…</p>
  if (error) return <p className={styles.error}>{error}</p>
  if (questions.length === 0) return <p className={styles.message}>No questions yet. Add one above.</p>

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString()
    } catch {
      return s
    }
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.count}>{questions.length} question(s)</p>
      <div className={styles.list}>
        {questions.map((q, i) => (
          <article key={q.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.number}>Q{i + 1}</span>
              <span className={styles.date}>{formatDate(q.createdAt)}</span>
            </div>
            <p className={styles.questionText}>{q.questionText}</p>
            <ul className={styles.optionsList}>
              {q.options.map((opt, j) => (
                <li key={j} className={j === q.correctIndex ? styles.correctOption : styles.option}>
                  {opt}
                  {j === q.correctIndex && <span className={styles.correctBadge}>Correct</span>}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
