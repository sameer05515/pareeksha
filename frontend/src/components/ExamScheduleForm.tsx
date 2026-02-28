import { useState, FormEvent, useEffect } from 'react'
import { createExamSchedule, updateExamSchedule } from '@/api/exam-schedules'
import type { ExamSchedule, CreateExamScheduleBody } from '@/types/exam-schedule'

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
  editing?: ExamSchedule | null
  onSuccess?: () => void
  onCancelEdit?: () => void
}) {
  const isEdit = !!editing
  const [title, setTitle] = useState(editing?.title ?? '')
  const [datetimeLocal, setDatetimeLocal] = useState(editing ? toLocalDatetime(editing.scheduledAt) : '')
  const [durationMinutes, setDurationMinutes] = useState<string>(
    editing?.durationMinutes != null ? String(editing.durationMinutes) : ''
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setDatetimeLocal(toLocalDatetime(editing.scheduledAt))
      setDurationMinutes(editing.durationMinutes != null ? String(editing.durationMinutes) : '')
    } else {
      setTitle('')
      setDatetimeLocal('')
      setDurationMinutes('')
    }
    setError(null)
  }, [editing])

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

    setLoading(true)
    try {
      if (isEdit && editing) {
        await updateExamSchedule(editing.id, {
          title: body.title,
          scheduledAt: body.scheduledAt,
          durationMinutes: body.durationMinutes,
        })
      } else {
        await createExamSchedule(body)
      }
      setTitle('')
      setDatetimeLocal('')
      setDurationMinutes('')
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
      <h3 className="text-base font-semibold text-accent m-0 tracking-wide">
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
