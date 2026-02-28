import { useState, useEffect, useCallback } from 'react'
import { fetchExamSchedules, deleteExamSchedule } from '@/api/exam-schedules'
import type { ExamSchedule } from '@/types/exam-schedule'

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

export function ExamScheduleList({
  refreshTrigger,
  onEdit,
}: {
  refreshTrigger?: number
  onEdit?: (schedule: ExamSchedule) => void
}) {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchExamSchedules()
      .then(setSchedules)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshTrigger])

  const handleDelete = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await deleteExamSchedule(id)
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <p className="text-muted my-4">Loading schedules…</p>
  if (error) return <p className="text-error my-4">{error}</p>
  if (schedules.length === 0) return <p className="text-muted my-4">No exam schedules yet. Create one above.</p>

  return (
    <div className="flex flex-col gap-3">
      {schedules.map((s) => (
        <article
          key={s.id}
          className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-input border border-border rounded"
        >
          <div>
            <h4 className="font-semibold m-0 mb-1 text-text">{s.title}</h4>
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
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(s)}
                className="py-2 px-3 border border-border rounded text-sm text-muted hover:bg-input hover:text-text transition-colors"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id}
              className="py-2 px-3 border border-error rounded text-sm text-error hover:bg-error/10 disabled:opacity-50"
            >
              {deletingId === s.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
