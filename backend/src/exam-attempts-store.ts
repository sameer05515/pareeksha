import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ExamAttempt } from './types/exam-attempt.js'

const DATA_DIR = join(process.cwd(), 'data')
const FILE = join(DATA_DIR, 'exam-attempts.json')

function load(): ExamAttempt[] {
  if (!existsSync(FILE)) return []
  try {
    const raw = readFileSync(FILE, 'utf-8')
    const parsed = JSON.parse(raw) as ExamAttempt[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(items: ExamAttempt[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf-8')
}

let attempts: ExamAttempt[] = load()

export function getAttemptById(id: string): ExamAttempt | undefined {
  return attempts.find((a) => a.id === id)
}

/** True if any attempt exists for this exam schedule (submitted or in progress). */
export function hasAttemptsForSchedule(examScheduleId: string): boolean {
  return attempts.some((a) => a.examScheduleId === examScheduleId)
}

export function getActiveAttemptByStudent(studentId: string): ExamAttempt | undefined {
  return attempts.find((a) => a.studentId === studentId && !a.submittedAt)
}

export function getSubmittedAttemptsByStudent(studentId: string): ExamAttempt[] {
  return attempts.filter((a) => a.studentId === studentId && a.submittedAt).sort((a, b) => {
    const tA = a.submittedAt ?? ''
    const tB = b.submittedAt ?? ''
    return tB.localeCompare(tA) // newest first
  })
}

export function createAttempt(examScheduleId: string, studentId: string): ExamAttempt {
  const attempt: ExamAttempt = {
    id: randomUUID(),
    examScheduleId,
    studentId,
    startedAt: new Date().toISOString(),
  }
  attempts.push(attempt)
  try {
    save(attempts)
  } catch {
    // best-effort
  }
  return attempt
}

export function submitAttempt(attemptId: string, answers: Record<string, number>): ExamAttempt | undefined {
  const idx = attempts.findIndex((a) => a.id === attemptId)
  if (idx === -1) return undefined
  attempts[idx] = {
    ...attempts[idx],
    submittedAt: new Date().toISOString(),
    answers: { ...answers },
  }
  try {
    save(attempts)
  } catch {
    // best-effort
  }
  return attempts[idx]
}

export function initExamAttemptsStore(): void {
  attempts = load()
}
