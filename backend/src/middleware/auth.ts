import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload, Role } from '../types/auth.js'
import { getUserById } from '../users-store.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'pareeksha-dev-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 }) // 7 days in seconds
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch {
    return null
  }
}

export interface AuthLocals {
  userId: string
  email: string
  role: Role
  studentId?: string
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' })
    return
  }
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
    return
  }
  const user = getUserById(payload.sub)
  if (!user) {
    res.status(401).json({ success: false, message: 'User not found' })
    return
  }
  res.locals.auth = {
    userId: user.id,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
  } as AuthLocals
  next()
}

export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = res.locals.auth as AuthLocals | undefined
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }
    if (!allowed.includes(auth.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' })
      return
    }
    next()
  }
}
