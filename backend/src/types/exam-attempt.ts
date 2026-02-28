export interface ExamAttempt {
  id: string
  examScheduleId: string
  studentId: string
  startedAt: string
  submittedAt?: string
  answers?: Record<string, number> // questionId -> selected option index
}
