import { getAuthHeaders } from '@/api/auth'
import type {
  ExamSchedule,
  CreateExamScheduleBody,
  UpdateExamScheduleBody,
  ExamScheduleWithRegistration,
} from '@/types/exam-schedule'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchExamSchedules(): Promise<ExamSchedule[]> {
  const res = await fetch(`${API_BASE}/api/exam-schedules`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load exam schedules')
  }
  const json = (await res.json()) as { success: boolean; schedules: ExamSchedule[] }
  return json.schedules ?? []
}

export async function fetchExamScheduleById(id: string): Promise<ExamSchedule & { hasAttempts?: boolean }> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/${id}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load exam schedule')
  }
  const json = (await res.json()) as { success: boolean; schedule: ExamSchedule; hasAttempts?: boolean }
  if (!json.schedule) throw new Error('Invalid response')
  return { ...json.schedule, ...(json.hasAttempts !== undefined && { hasAttempts: json.hasAttempts }) }
}

export async function createExamSchedule(data: CreateExamScheduleBody): Promise<ExamSchedule> {
  const res = await fetch(`${API_BASE}/api/exam-schedules`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = (await res.json()) as { success: boolean; message?: string; schedule?: ExamSchedule }
  if (!res.ok) throw new Error(json?.message ?? 'Failed to create exam schedule')
  if (!json.schedule) throw new Error('Invalid response')
  return json.schedule
}

export async function updateExamSchedule(id: string, data: UpdateExamScheduleBody): Promise<ExamSchedule> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = (await res.json()) as { success: boolean; message?: string; schedule?: ExamSchedule }
  if (!res.ok) throw new Error(json?.message ?? 'Failed to update exam schedule')
  if (!json.schedule) throw new Error('Invalid response')
  return json.schedule
}

export async function deleteExamSchedule(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const json = (await res.json()) as { message?: string }
    throw new Error(json?.message ?? 'Failed to delete exam schedule')
  }
}

/** Student: upcoming exam schedules with registration status */
export async function fetchUpcomingExamSchedules(): Promise<ExamScheduleWithRegistration[]> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/upcoming`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load upcoming exams')
  }
  const json = (await res.json()) as { success: boolean; schedules: ExamScheduleWithRegistration[] }
  return json.schedules ?? []
}

/** Student: register for an exam */
export async function registerForExam(scheduleId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/${scheduleId}/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const json = (await res.json()) as { message?: string }
    throw new Error(json?.message ?? 'Failed to register')
  }
}

/** Student: unregister from an exam */
export async function unregisterFromExam(scheduleId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/${scheduleId}/register`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const json = (await res.json()) as { message?: string }
    throw new Error(json?.message ?? 'Failed to unregister')
  }
}

/** Attempt: question without correct answer (for student view) */
export interface AttemptQuestion {
  id: string
  questionText: string
  options: string[]
}

export interface ActiveAttemptResponse {
  attempt: { id: string; startedAt: string }
  schedule: { id: string; title: string; durationMinutes: number }
  questions: AttemptQuestion[]
}

/** Student: get current active attempt */
export async function getCurrentAttempt(): Promise<ActiveAttemptResponse> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/attempts/current`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const json = (await res.json()) as { message?: string }
    throw new Error(json?.message ?? 'No active attempt')
  }
  const json = (await res.json()) as { success: boolean; attempt: ActiveAttemptResponse['attempt']; schedule: ActiveAttemptResponse['schedule']; questions: AttemptQuestion[] }
  return { attempt: json.attempt, schedule: json.schedule, questions: json.questions ?? [] }
}

/** Student: start a new attempt */
export async function startAttempt(scheduleId: string): Promise<ActiveAttemptResponse> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/attempts/start`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId }),
  })
  if (!res.ok) {
    const json = (await res.json()) as { message?: string }
    throw new Error(json?.message ?? 'Failed to start attempt')
  }
  const json = (await res.json()) as { success: boolean; attempt: ActiveAttemptResponse['attempt']; schedule: ActiveAttemptResponse['schedule']; questions: AttemptQuestion[] }
  return { attempt: json.attempt, schedule: json.schedule, questions: json.questions ?? [] }
}

/** Student: submit attempt answers */
export async function submitAttemptAnswers(attemptId: string, answers: Record<string, number>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) {
    const json = (await res.json()) as { message?: string }
    throw new Error(json?.message ?? 'Failed to submit')
  }
}

export interface AttemptResultItem {
  questionId: string
  questionText: string
  options: string[]
  correctIndex: number
  selectedIndex: number
  correct: boolean
}

export interface AttemptResultResponse {
  schedule: { id: string; title: string }
  attempt: { id: string; submittedAt: string }
  score: number
  total: number
  results: AttemptResultItem[]
}

/** Student: get attempt result (score + breakdown) */
export async function getAttemptResult(attemptId: string): Promise<AttemptResultResponse> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/attempts/${attemptId}/result`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const json = (await res.json()) as { message?: string }
    throw new Error(json?.message ?? 'Failed to load result')
  }
  const json = (await res.json()) as { success: boolean } & AttemptResultResponse
  return {
    schedule: json.schedule,
    attempt: json.attempt,
    score: json.score,
    total: json.total,
    results: json.results ?? [],
  }
}

export interface MyAttemptItem {
  id: string
  examScheduleId: string
  scheduleTitle: string
  submittedAt: string
  score: number
  total: number
}

/** Student: list my submitted attempts */
export async function getMyAttempts(): Promise<MyAttemptItem[]> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/attempts/mine`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load attempts')
  }
  const json = (await res.json()) as { success: boolean; attempts: MyAttemptItem[] }
  return json.attempts ?? []
}

// --- Admin: Score & rank report ---

export interface ScoreReportRow {
  rank: number
  attemptId: string
  studentId: string
  studentName: string
  schoolNameAndAddress: string
  city: string
  state: string
  score: number
  total: number
  submittedAt: string
}

export interface ScoreReportSchoolGroup {
  schoolNameAndAddress: string
  city: string
  state: string
  students: ScoreReportRow[]
}

export interface ScoreReportResponse {
  schedule: { id: string; title: string; scheduledAt: string }
  allLocations: ScoreReportRow[]
  schoolWise: ScoreReportSchoolGroup[]
}

/** Admin: get score and rank report for an exam (all locations + school-wise) */
export async function getScoreReport(scheduleId: string): Promise<ScoreReportResponse> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/${scheduleId}/score-report`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load score report')
  }
  const json = (await res.json()) as { success: boolean; schedule: ScoreReportResponse['schedule']; allLocations: ScoreReportRow[]; schoolWise: ScoreReportSchoolGroup[] }
  return {
    schedule: json.schedule,
    allLocations: json.allLocations ?? [],
    schoolWise: json.schoolWise ?? [],
  }
}
