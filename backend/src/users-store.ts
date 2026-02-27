import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import type { User } from './types/auth.js'

const DATA_DIR = join(process.cwd(), 'data')
const USERS_FILE = join(DATA_DIR, 'users.json')

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@pareeksha.local'
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'

function loadUsers(): User[] {
  if (!existsSync(USERS_FILE)) return []
  try {
    const raw = readFileSync(USERS_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as User[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUsers(users: User[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

let users: User[] = loadUsers()

export function getUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function addUser(user: User): void {
  users.push(user)
  try {
    saveUsers(users)
  } catch {
    // best-effort
  }
}

export function updateUserPassword(userId: string, passwordHash: string): boolean {
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return false
  users[index] = { ...users[index], passwordHash }
  try {
    saveUsers(users)
    return true
  } catch {
    return false
  }
}

export function initUsersStore(): void {
  users = loadUsers()
}

export function ensureDefaultAdmin(): void {
  if (users.some((u) => u.role === 'admin')) return
  const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10)
  const admin: User = {
    id: randomUUID(),
    email: DEFAULT_ADMIN_EMAIL,
    passwordHash: hash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  }
  users.push(admin)
  try {
    saveUsers(users)
    console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`)
  } catch {
    // ignore
  }
}
