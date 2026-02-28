import { useState, FormEvent } from 'react'
import { createQuestion } from '@/api/questions'

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
      <div className="py-4 text-success">
        <p className="m-0">Question added successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[560px]">
      <h2 className="m-0 mb-2 text-xl">Add question</h2>
      {error && (
        <div className="py-2 px-3 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {error}
        </div>
      )}
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Question
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="py-2.5 px-3.5 bg-input border border-border rounded text-zinc-100 resize-y font-inherit focus:outline-none focus:border-border-focus"
          rows={3}
          required
          placeholder="Enter the question text"
        />
      </label>
      <fieldset className="border border-border rounded p-4 m-0">
        <legend className="text-sm text-muted px-2">Options (select correct answer)</legend>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name="correct"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              className="shrink-0 accent-accent"
              aria-label={`Correct answer is option ${i + 1}`}
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => setOptionAt(i, e.target.value)}
              className="flex-1 py-2 px-3 bg-input border border-border rounded text-zinc-100 focus:outline-none focus:border-border-focus"
              placeholder={`Option ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => removeOption(i)}
              className="w-8 h-8 p-0 bg-transparent border border-border rounded text-muted text-xl leading-none shrink-0 hover:border-error hover:text-error disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={options.length <= MIN_OPTIONS}
              aria-label="Remove option"
            >
              −
            </button>
          </div>
        ))}
        {options.length < MAX_OPTIONS && (
          <button
            type="button"
            onClick={addOption}
            className="mt-1 py-2 px-3 bg-transparent border border-dashed border-border rounded text-sm text-muted self-start hover:border-accent hover:text-accent"
          >
            + Add option
          </button>
        )}
      </fieldset>
      <button
        type="submit"
        className="py-3 px-6 bg-accent text-white border-0 rounded font-semibold self-start hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Adding…' : 'Add question'}
      </button>
    </form>
  )
}
