import type { StudentFormData, StudentRecord } from '@/types/student'
import { getAuthHeaders } from '@/api/auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchStudents(): Promise<StudentRecord[]> {
  const res = await fetch(`${API_BASE}/api/students`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load students')
  }
  const json = (await res.json()) as { success: boolean; students: StudentRecord[] }
  return json.students ?? []
}

export async function fetchMyProfile(): Promise<StudentRecord> {
  const res = await fetch(`${API_BASE}/api/students/me`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err?.message ?? 'Failed to load profile')
  }
  const json = (await res.json()) as { success: boolean; student: StudentRecord }
  return json.student
}

export interface RegisterSuccess {
  success: true
  message: string
  student: { id: string; createdAt: string } & StudentFormData
}

export interface RegisterValidationError {
  success: false
  message: string
  errors: { field: string; message: string }[]
}

export type RegisterResponse = RegisterSuccess | RegisterValidationError

export async function registerStudent(
  data: StudentFormData
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/students/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  let json: RegisterResponse
  try {
    json = (await res.json()) as RegisterResponse
  } catch {
    throw new Error('Registration failed. Please try again.')
  }

  if (res.ok || res.status === 400) return json

  throw new Error(
    json && typeof (json as { message?: string }).message === 'string'
      ? (json as { message: string }).message
      : 'Registration failed. Please try again.'
  )
}
