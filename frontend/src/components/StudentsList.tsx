import { useState, useEffect } from 'react'
import { fetchStudents } from '@/api/students'
import type { StudentRecord } from '@/types/student'

export function StudentsList() {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchStudents()
      .then((data) => {
        if (!cancelled) setStudents(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load students')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <p className="text-center text-muted my-6">Loading students…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <p className="text-center text-error my-6">{error}</p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="w-full">
        <p className="text-center text-muted my-6">No students registered yet.</p>
      </div>
    )
  }

  const formatDate = (s: string) => {
    try {
      const d = new Date(s)
      return isNaN(d.getTime()) ? s : d.toLocaleDateString()
    } catch {
      return s
    }
  }

  return (
    <div className="w-full">
      <p className="text-sm text-muted m-0 mb-4">{students.length} student(s) registered</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs">#</th>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs">Name</th>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs">Class</th>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs">Board</th>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs max-md:after:content-['_/_\u2026']">School</th>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs max-md:hidden">Email</th>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs max-md:hidden">Mobile</th>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs max-md:hidden">City</th>
              <th className="py-2.5 px-3 text-left font-semibold text-muted uppercase tracking-wider text-xs max-md:hidden">Registered</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} className="hover:bg-input">
                <td className="py-2.5 px-3 border-b border-border">{i + 1}</td>
                <td className="py-2.5 px-3 border-b border-border">
                  {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}
                </td>
                <td className="py-2.5 px-3 border-b border-border">{s.class}</td>
                <td className="py-2.5 px-3 border-b border-border">{s.board}</td>
                <td className="py-2.5 px-3 border-b border-border max-w-[180px] truncate" title={s.schoolNameAndAddress}>
                  {s.schoolNameAndAddress}
                </td>
                <td className="py-2.5 px-3 border-b border-border max-md:hidden">{s.email}</td>
                <td className="py-2.5 px-3 border-b border-border max-md:hidden">{s.mobile}</td>
                <td className="py-2.5 px-3 border-b border-border max-md:hidden">{s.city}</td>
                <td className="py-2.5 px-3 border-b border-border max-md:hidden">{formatDate(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
