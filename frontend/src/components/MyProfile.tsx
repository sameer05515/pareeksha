import { useState, useEffect } from 'react'
import { fetchMyProfile } from '@/api/students'
import type { StudentRecord } from '@/types/student'

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

  if (loading) return <p className="text-center text-muted my-6">Loading profile…</p>
  if (error) return <p className="text-center text-error my-6">{error}</p>
  if (!student) return <p className="text-center text-muted my-6">No profile found.</p>

  const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')
  return (
    <div className="w-full">
      <h3 className="text-base font-semibold text-accent m-0 mb-4">My profile</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-6 m-0">
        <dt className="text-muted text-sm">Name</dt>
        <dd className="m-0">{fullName}</dd>
        <dt className="text-muted text-sm">Email</dt>
        <dd className="m-0">{student.email}</dd>
        <dt className="text-muted text-sm">Mobile</dt>
        <dd className="m-0">{student.mobile}</dd>
        <dt className="text-muted text-sm">Class</dt>
        <dd className="m-0">{student.class}</dd>
        <dt className="text-muted text-sm">Board</dt>
        <dd className="m-0">{student.board}</dd>
        <dt className="text-muted text-sm">School</dt>
        <dd className="m-0">{student.schoolNameAndAddress}</dd>
        <dt className="text-muted text-sm">Address</dt>
        <dd className="m-0">
          {[student.addressLine1, student.addressLine2, student.city, student.state, student.pincode]
            .filter(Boolean)
            .join(', ')}
        </dd>
      </dl>
    </div>
  )
}
