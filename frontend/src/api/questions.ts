import { getAuthHeaders } from '@/api/auth'
import type { Question, CreateQuestionBody } from '@/types/question'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchQuestions(): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/api/questions`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load questions')
  }
  const json = (await res.json()) as { success: boolean; questions: Question[] }
  return json.questions ?? []
}

export async function createQuestion(data: CreateQuestionBody): Promise<Question> {
  const res = await fetch(`${API_BASE}/api/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  const json = (await res.json()) as { success: boolean; message?: string; question?: Question }
  if (!res.ok) throw new Error(json?.message ?? 'Failed to add question')
  if (!json.question) throw new Error('Invalid response')
  return json.question
}
