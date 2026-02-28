import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ExamScheduleForm } from '@/components/ExamScheduleForm'
import { ExamScheduleList } from '@/components/ExamScheduleList'
import type { ExamSchedule } from '@/types/exam-schedule'

export function ExamSchedulesPage() {
  const { user, isAuthenticated } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editing, setEditing] = useState<ExamSchedule | null>(null)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="flex flex-col gap-8">
      <section className="w-full">
        <ExamScheduleForm
          editing={editing}
          onSuccess={() => {
            setRefreshTrigger((r) => r + 1)
            setEditing(null)
          }}
          onCancelEdit={() => setEditing(null)}
        />
      </section>
      <section className="w-full">
        <h3 className="text-base font-semibold text-accent m-0 mb-4 tracking-wide">Scheduled exams</h3>
        <ExamScheduleList refreshTrigger={refreshTrigger} onEdit={setEditing} />
      </section>
    </div>
  )
}
