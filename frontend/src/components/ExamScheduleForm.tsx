import { useState, FormEvent, useEffect, useMemo } from 'react'
import { createExamSchedule, updateExamSchedule } from '@/api/exam-schedules'
import type { ExamSchedule, CreateExamScheduleBody } from '@/types/exam-schedule'
import { fetchQuestions } from '@/api/questions'
import type { Question } from '@/types/question'

function toLocalDatetime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day}T${h}:${min}`
  } catch {
    return ''
  }
}

function fromLocalDatetime(local: string): string {
  if (!local) return ''
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

export function ExamScheduleForm({
  editing,
  onSuccess,
  onCancelEdit,
}: {
  editing?: (ExamSchedule & { hasAttempts?: boolean }) | null
  onSuccess?: () => void
  onCancelEdit?: () => void
}) {
  const isEdit = !!editing
  const questionsLocked = isEdit && !!editing?.hasAttempts
  const [title, setTitle] = useState(editing?.title ?? '')
  const [datetimeLocal, setDatetimeLocal] = useState(editing ? toLocalDatetime(editing.scheduledAt) : '')
  const [durationMinutes, setDurationMinutes] = useState<string>(
    editing?.durationMinutes != null ? String(editing.durationMinutes) : ''
  )
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [questionsError, setQuestionsError] = useState<string | null>(null)
  const [questionSearch, setQuestionSearch] = useState('')
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(editing?.questionIds ?? [])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setDatetimeLocal(toLocalDatetime(editing.scheduledAt))
      setDurationMinutes(editing.durationMinutes != null ? String(editing.durationMinutes) : '')
      setSelectedQuestionIds(editing.questionIds ?? [])
    } else {
      setTitle('')
      setDatetimeLocal('')
      setDurationMinutes('')
      setSelectedQuestionIds([])
    }
    setError(null)
  }, [editing])

  useEffect(() => {
    let cancelled = false
    setQuestionsLoading(true)
    setQuestionsError(null)
    fetchQuestions()
      .then((qs) => {
        if (!cancelled) setAllQuestions(qs)
      })
      .catch((err) => {
        if (!cancelled) setQuestionsError(err instanceof Error ? err.message : 'Failed to load questions')
      })
      .finally(() => {
        if (!cancelled) setQuestionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredQuestions = useMemo(() => {
    const q = questionSearch.trim().toLowerCase()
    if (!q) return allQuestions
    return allQuestions.filter((x) => x.questionText.toLowerCase().includes(q))
  }, [allQuestions, questionSearch])

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const selectAllVisible = () => {
    const visible = filteredQuestions.map((q) => q.id)
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...visible])))
  }

  const clearSelection = () => setSelectedQuestionIds([])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return
    }
    const scheduledAt = fromLocalDatetime(datetimeLocal)
    if (!scheduledAt) {
      setError('Date and time is required')
      return
    }
    const body: CreateExamScheduleBody = {
      title: trimmedTitle,
      scheduledAt,
    }
    const dur = durationMinutes.trim() ? parseInt(durationMinutes, 10) : undefined
    if (dur !== undefined && (Number.isNaN(dur) || dur < 1 || dur > 9999)) {
      setError('Duration must be between 1 and 9999 minutes')
      return
    }
    if (dur !== undefined) body.durationMinutes = dur
    if (selectedQuestionIds.length > 0) body.questionIds = selectedQuestionIds

    setLoading(true)
    try {
      if (isEdit && editing) {
        const updatePayload: Parameters<typeof updateExamSchedule>[1] = {
          title: body.title,
          scheduledAt: body.scheduledAt,
          durationMinutes: body.durationMinutes,
        }
        if (!questionsLocked) updatePayload.questionIds = selectedQuestionIds.length > 0 ? selectedQuestionIds : undefined
        await updateExamSchedule(editing.id, updatePayload)
      } else {
        await createExamSchedule(body)
      }
      setTitle('')
      setDatetimeLocal('')
      setDurationMinutes('')
      setSelectedQuestionIds([])
      onSuccess?.()
      onCancelEdit?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exam schedule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[480px]">
      <h3 className="font-semibold text-accent m-0 tracking-wide">
        {isEdit ? 'Edit exam schedule' : 'Add exam schedule'}
      </h3>
      {error && (
        <div className="py-2 px-3 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {error}
        </div>
      )}
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
          placeholder="e.g. Mathematics Mid-term"
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Date & time
        <input
          type="datetime-local"
          value={datetimeLocal}
          onChange={(e) => setDatetimeLocal(e.target.value)}
          className="py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Duration (minutes, optional)
        <input
          type="number"
          min={1}
          max={9999}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          className="py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
          placeholder="e.g. 60"
        />
      </label>

      <fieldset className="border border-border rounded p-4 m-0" disabled={questionsLocked}>
        <legend className="text-sm text-muted px-2">Questions (optional)</legend>
        {questionsLocked && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-3 m-0">
            This exam has been attempted. Only rescheduling (title, date, duration) is allowed. Questions cannot be edited.
          </p>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              placeholder="Search questions…"
              className="flex-1 min-w-[220px] py-2 px-3 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
            />
            <button
              type="button"
              onClick={selectAllVisible}
              disabled={questionsLoading || filteredQuestions.length === 0}
              className="py-2 px-3 bg-transparent border border-border rounded text-sm text-muted hover:bg-input hover:text-text disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearSelection}
              disabled={selectedQuestionIds.length === 0}
              className="py-2 px-3 bg-transparent border border-border rounded text-sm text-muted hover:bg-input hover:text-text disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <span className="text-sm text-muted">
              Selected: <span className="text-text font-medium">{selectedQuestionIds.length}</span>
            </span>
          </div>

          {questionsLoading && <p className="text-sm text-muted m-0">Loading questions…</p>}
          {questionsError && <p className="text-sm text-error m-0">{questionsError}</p>}

          {!questionsLoading && !questionsError && (
            <div className="max-h-64 overflow-auto border border-border rounded">
              {filteredQuestions.length === 0 ? (
                <p className="text-sm text-muted m-0 p-3">No questions found.</p>
              ) : (
                <ul className="m-0 p-0 list-none">
                  {filteredQuestions.map((q) => (
                    <li key={q.id} className="border-b border-border last:border-b-0">
                      <label className="flex items-start gap-2 p-3 cursor-pointer hover:bg-card">
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.includes(q.id)}
                          onChange={() => toggleQuestion(q.id)}
                          className="mt-1 accent-accent"
                        />
                        <span className="text-sm text-text leading-snug">{q.questionText}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="py-2.5 px-4 bg-accent text-white border-0 rounded font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (isEdit ? 'Updating…' : 'Creating…') : isEdit ? 'Update' : 'Create'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="py-2.5 px-4 bg-transparent border border-border rounded font-medium text-muted hover:bg-input hover:text-text"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
