import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AddQuestionForm } from '@/components/AddQuestionForm'
import { QuestionsList } from '@/components/QuestionsList'
import styles from './QuestionsPage.module.css'

export function QuestionsPage() {
  const { user, isAuthenticated } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <AddQuestionForm onSuccess={() => setRefreshTrigger((r) => r + 1)} />
      </section>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Existing questions</h3>
        <QuestionsList refreshTrigger={refreshTrigger} />
      </section>
    </div>
  )
}
