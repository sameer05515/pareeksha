import { useState, useEffect } from 'react'
import { fetchStudents } from '@/api/students'
import type { StudentRecord } from '@/types/student'
import styles from './StudentsList.module.css'

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
      <div className={styles.wrapper}>
        <p className={styles.message}>Loading students…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.message}>No students registered yet.</p>
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
    <div className={styles.wrapper}>
      <p className={styles.count}>{students.length} student(s) registered</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Class</th>
              <th>Board</th>
              <th>School</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>City</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>
                  {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}
                </td>
                <td>{s.class}</td>
                <td>{s.board}</td>
                <td className={styles.cellClip} title={s.schoolNameAndAddress}>
                  {s.schoolNameAndAddress}
                </td>
                <td>{s.email}</td>
                <td>{s.mobile}</td>
                <td>{s.city}</td>
                <td>{formatDate(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
