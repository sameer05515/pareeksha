import { getAuthHeaders } from '@/api/auth'
import type { ExamSchedule, CreateExamScheduleBody, UpdateExamScheduleBody } from '@/types/exam-schedule'

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

export async function fetchExamScheduleById(id: string): Promise<ExamSchedule> {
  const res = await fetch(`${API_BASE}/api/exam-schedules/${id}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load exam schedule')
  }
  const json = (await res.json()) as { success: boolean; schedule: ExamSchedule }
  if (!json.schedule) throw new Error('Invalid response')
  return json.schedule
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
