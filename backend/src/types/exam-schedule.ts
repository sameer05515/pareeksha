export interface ExamSchedule {
  id: string
  title: string
  scheduledAt: string // ISO 8601 datetime
  durationMinutes?: number
  questionIds?: string[] // if empty/absent, may mean "all questions" in future
  createdAt: string
  createdBy?: string
}

export interface CreateExamScheduleBody {
  title: string
  scheduledAt: string
  durationMinutes?: number
  questionIds?: string[]
}

export interface UpdateExamScheduleBody {
  title?: string
  scheduledAt?: string
  durationMinutes?: number
  questionIds?: string[]
}
