import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ExamSchedule } from './types/exam-schedule.js'

const DATA_DIR = join(process.cwd(), 'data')
const FILE = join(DATA_DIR, 'exam-schedules.json')

function load(): ExamSchedule[] {
  if (!existsSync(FILE)) return []
  try {
    const raw = readFileSync(FILE, 'utf-8')
    const parsed = JSON.parse(raw) as ExamSchedule[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(items: ExamSchedule[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf-8')
}

let schedules: ExamSchedule[] = load()

export function getAllExamSchedules(): ExamSchedule[] {
  return [...schedules]
}

export function getExamScheduleById(id: string): ExamSchedule | undefined {
  return schedules.find((s) => s.id === id)
}

export function addExamSchedule(schedule: ExamSchedule): void {
  schedules.push(schedule)
  try {
    save(schedules)
  } catch {
    // best-effort
  }
}

export function updateExamSchedule(id: string, updates: Partial<ExamSchedule>): ExamSchedule | undefined {
  const idx = schedules.findIndex((s) => s.id === id)
  if (idx === -1) return undefined
  schedules[idx] = { ...schedules[idx], ...updates }
  try {
    save(schedules)
  } catch {
    // best-effort
  }
  return schedules[idx]
}

export function deleteExamSchedule(id: string): boolean {
  const before = schedules.length
  schedules = schedules.filter((s) => s.id !== id)
  if (schedules.length === before) return false
  try {
    save(schedules)
  } catch {
    // best-effort
  }
  return true
}

export function initExamSchedulesStore(): void {
  schedules = load()
}
