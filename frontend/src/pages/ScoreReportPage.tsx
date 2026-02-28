import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { fetchExamSchedules, getScoreReport } from '@/api/exam-schedules'
import type { ExamSchedule } from '@/types/exam-schedule'
import type { ScoreReportResponse, ScoreReportRow } from '@/api/exam-schedules'

function formatDateTime(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function ReportTable({ rows, title }: { rows: ScoreReportRow[]; title?: string }) {
  if (rows.length === 0) return null
  return (
    <div className="overflow-x-auto">
      {title && <h4 className="text-sm font-semibold text-accent mb-2">{title}</h4>}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-input/50">
            <th className="text-left py-2.5 px-3 font-semibold text-muted">Rank</th>
            <th className="text-left py-2.5 px-3 font-semibold text-muted">Name</th>
            <th className="text-left py-2.5 px-3 font-semibold text-muted">School</th>
            <th className="text-left py-2.5 px-3 font-semibold text-muted">Location</th>
            <th className="text-right py-2.5 px-3 font-semibold text-muted">Score</th>
            <th className="text-left py-2.5 px-3 font-semibold text-muted">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.attemptId} className="border-b border-border hover:bg-card">
              <td className="py-2.5 px-3 font-medium text-text">{r.rank}</td>
              <td className="py-2.5 px-3 text-text">{r.studentName}</td>
              <td className="py-2.5 px-3 text-muted max-w-[200px] truncate" title={r.schoolNameAndAddress}>{r.schoolNameAndAddress || '—'}</td>
              <td className="py-2.5 px-3 text-muted">{[r.city, r.state].filter(Boolean).join(', ') || '—'}</td>
              <td className="py-2.5 px-3 text-right font-medium text-text">{r.score} / {r.total}</td>
              <td className="py-2.5 px-3 text-muted">{formatDateTime(r.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ScoreReportPage() {
  const { user, isAuthenticated } = useAuth()
  const [schedules, setSchedules] = useState<ExamSchedule[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [report, setReport] = useState<ScoreReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSchedules = useCallback(() => {
    setLoadingSchedules(true)
    setError(null)
    fetchExamSchedules()
      .then((list) => {
        setSchedules(list)
        if (list.length === 0) setSelectedId('')
        else if (!selectedId || !list.some((s) => s.id === selectedId)) setSelectedId(list[0].id)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load exams'))
      .finally(() => setLoadingSchedules(false))
  }, [selectedId])

  useEffect(() => {
    loadSchedules()
  }, [loadSchedules])

  useEffect(() => {
    if (!selectedId) {
      setReport(null)
      return
    }
    setLoading(true)
    setError(null)
    setReport(null)
    getScoreReport(selectedId)
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false))
  }, [selectedId])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-semibold text-accent m-0 tracking-wide">Score &amp; rank report</h2>
      <p className="text-sm text-muted m-0">
        View score and rank for each exam: all locations (combined) and school-wise.
      </p>

      <label className="flex flex-col gap-1.5 text-sm text-muted max-w-md">
        Select exam
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loadingSchedules}
          className="py-2.5 px-3.5 bg-input border border-border rounded text-text focus:outline-none focus:border-border-focus"
        >
          <option value="">— Select exam —</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({new Date(s.scheduledAt).toLocaleDateString()})
            </option>
          ))}
        </select>
      </label>

      {error && (
        <div className="py-2 px-3 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="text-muted my-2">Loading report…</p>}

      {report && !loading && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-text">{report.schedule.title}</span>
            <span className="text-muted">{new Date(report.schedule.scheduledAt).toLocaleString()}</span>
          </div>

          <section className="flex flex-col gap-4">
            <h3 className=" font-semibold text-accent m-0">All locations</h3>
            {report.allLocations.length === 0 ? (
              <p className="text-muted">No attempts for this exam yet.</p>
            ) : (
              <ReportTable rows={report.allLocations} />
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h3 className=" font-semibold text-accent m-0">School-wise</h3>
            {report.schoolWise.length === 0 ? (
              <p className="text-muted">No attempts for this exam yet.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {report.schoolWise.map((group, idx) => (
                  <div key={idx} className="border border-border rounded p-4 bg-card">
                    <div className="mb-3">
                      <p className="font-medium text-text m-0">
                        {group.schoolNameAndAddress || '(No school)'}
                      </p>
                      <p className="text-sm text-muted m-0">
                        {[group.city, group.state].filter(Boolean).join(', ') || '—'}
                      </p>
                    </div>
                    <ReportTable rows={group.students} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
