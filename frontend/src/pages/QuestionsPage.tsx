import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AddQuestionForm } from '@/components/AddQuestionForm'
import { QuestionsList } from '@/components/QuestionsList'

export function QuestionsPage() {
  const { user, isAuthenticated } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="flex flex-col gap-8">
      <section className="w-full">
        <AddQuestionForm onSuccess={() => setRefreshTrigger((r) => r + 1)} />
      </section>
      <section className="w-full">
        <h3 className="text-base font-semibold text-accent m-0 mb-4 tracking-wide">Existing questions</h3>
        <QuestionsList refreshTrigger={refreshTrigger} />
      </section>
    </div>
  )
}
