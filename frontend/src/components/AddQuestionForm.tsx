import { useState, FormEvent } from 'react'
import { createQuestion } from '@/api/questions'
import type { CreateQuestionBody } from '@/types/question'
import styles from './AddQuestionForm.module.css'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 10

export function AddQuestionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return
    setOptions((prev) => [...prev, ''])
  }

  const removeOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return
    setOptions((prev) => prev.filter((_, i) => i !== index))
    setCorrectIndex((prev) => {
      if (prev === index) return 0
      if (prev > index) return prev - 1
      return prev
    })
  }

  const setOptionAt = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const text = questionText.trim()
    if (!text) {
      setError('Question text is required')
      return
    }
    const opts = options.map((o) => o.trim()).filter(Boolean)
    if (opts.length < MIN_OPTIONS) {
      setError(`At least ${MIN_OPTIONS} options are required`)
      return
    }
    if (correctIndex < 0 || correctIndex >= opts.length) {
      setError('Please select the correct answer')
      return
    }
    setLoading(true)
    try {
      await createQuestion({
        questionText: text,
        options: opts,
        correctIndex,
      })
      onSuccess?.()
      setSuccess(true)
      setQuestionText('')
      setOptions(['', ''])
      setCorrectIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <p>Question added successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Add question</h2>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <label className={styles.label}>
        Question
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className={styles.textarea}
          rows={3}
          required
          placeholder="Enter the question text"
        />
      </label>
      <fieldset className={styles.optionsFieldset}>
        <legend className={styles.legend}>Options (select correct answer)</legend>
        {options.map((opt, i) => (
          <div key={i} className={styles.optionRow}>
            <input
              type="radio"
              name="correct"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              className={styles.radio}
              aria-label={`Correct answer is option ${i + 1}`}
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => setOptionAt(i, e.target.value)}
              className={styles.optionInput}
              placeholder={`Option ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => removeOption(i)}
              className={styles.removeBtn}
              disabled={options.length <= MIN_OPTIONS}
              aria-label="Remove option"
            >
              −
            </button>
          </div>
        ))}
        {options.length < MAX_OPTIONS && (
          <button type="button" onClick={addOption} className={styles.addBtn}>
            + Add option
          </button>
        )}
      </fieldset>
      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'Adding…' : 'Add question'}
      </button>
    </form>
  )
}
