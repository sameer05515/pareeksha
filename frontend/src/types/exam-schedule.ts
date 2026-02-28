export interface ExamSchedule {
  id: string
  title: string
  scheduledAt: string
  durationMinutes?: number
  questionIds?: string[]
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
