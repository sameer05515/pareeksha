import { useState, useEffect } from 'react'
import { fetchMyProfile } from '@/api/students'
import type { StudentRecord } from '@/types/student'
import styles from './MyProfile.module.css'

export function MyProfile() {
  const [student, setStudent] = useState<StudentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchMyProfile()
      .then((data) => {
        if (!cancelled) setStudent(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className={styles.message}>Loading profile…</p>
  if (error) return <p className={styles.error}>{error}</p>
  if (!student) return <p className={styles.message}>No profile found.</p>

  const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>My profile</h3>
      <dl className={styles.profileList}>
        <dt>Name</dt>
        <dd>{fullName}</dd>
        <dt>Email</dt>
        <dd>{student.email}</dd>
        <dt>Mobile</dt>
        <dd>{student.mobile}</dd>
        <dt>Class</dt>
        <dd>{student.class}</dd>
        <dt>Board</dt>
        <dd>{student.board}</dd>
        <dt>School</dt>
        <dd>{student.schoolNameAndAddress}</dd>
        <dt>Address</dt>
        <dd>{[student.addressLine1, student.addressLine2, student.city, student.state, student.pincode].filter(Boolean).join(', ')}</dd>
      </dl>
    </div>
  )
}
