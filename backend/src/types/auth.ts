export type Role = 'student' | 'admin' | 'public'

export interface User {
  id: string
  email: string
  passwordHash: string
  role: Role
  studentId?: string // for role student: link to students.id
  createdAt: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: Role
  studentId?: string
  iat?: number
  exp?: number
}
