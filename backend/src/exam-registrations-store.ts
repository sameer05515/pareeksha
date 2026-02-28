import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export interface ExamRegistration {
  examScheduleId: string
  studentId: string
  registeredAt: string
}

const DATA_DIR = join(process.cwd(), 'data')
const FILE = join(DATA_DIR, 'exam-registrations.json')

function load(): ExamRegistration[] {
  if (!existsSync(FILE)) return []
  try {
    const raw = readFileSync(FILE, 'utf-8')
    const parsed = JSON.parse(raw) as ExamRegistration[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(items: ExamRegistration[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf-8')
}

let registrations: ExamRegistration[] = load()

export function getRegistrationsByExamScheduleId(examScheduleId: string): ExamRegistration[] {
  return registrations.filter((r) => r.examScheduleId === examScheduleId)
}

export function getRegistrationsByStudentId(studentId: string): ExamRegistration[] {
  return registrations.filter((r) => r.studentId === studentId)
}

export function isStudentRegistered(examScheduleId: string, studentId: string): boolean {
  return registrations.some((r) => r.examScheduleId === examScheduleId && r.studentId === studentId)
}

export function addRegistration(examScheduleId: string, studentId: string): boolean {
  if (registrations.some((r) => r.examScheduleId === examScheduleId && r.studentId === studentId)) {
    return false // already registered
  }
  registrations.push({
    examScheduleId,
    studentId,
    registeredAt: new Date().toISOString(),
  })
  try {
    save(registrations)
  } catch {
    // best-effort
  }
  return true
}

export function removeRegistration(examScheduleId: string, studentId: string): boolean {
  const before = registrations.length
  registrations = registrations.filter(
    (r) => !(r.examScheduleId === examScheduleId && r.studentId === studentId)
  )
  if (registrations.length === before) return false
  try {
    save(registrations)
  } catch {
    // best-effort
  }
  return true
}

export function initExamRegistrationsStore(): void {
  registrations = load()
}
