const API_BASE = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'pareeksha_token'
const USER_KEY = 'pareeksha_user'

export type Role = 'student' | 'admin' | 'public'

export interface AuthUser {
  id: string
  email: string
  role: Role
  studentId?: string
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function setStoredAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export interface LoginResponse {
  success: boolean
  message?: string
  token?: string
  user?: AuthUser
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = (await res.json()) as LoginResponse
  if (!res.ok) return json
  if (json.success && json.token && json.user) {
    setStoredAuth(json.token, json.user)
  }
  return json
}

export interface ChangePasswordResponse {
  success: boolean
  message?: string
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  const res = await fetch(`${API_BASE}/api/auth/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const json = (await res.json()) as ChangePasswordResponse
  return json
}
