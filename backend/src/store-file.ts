import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { StudentRecord } from './types/student.js'

const DATA_DIR = join(process.cwd(), 'data')
const DATA_FILE = join(DATA_DIR, 'students.json')

function loadFromFile(): StudentRecord[] {
  if (!existsSync(DATA_FILE)) return []
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as StudentRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToFile(students: StudentRecord[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(students, null, 2), 'utf-8')
}

let students: StudentRecord[] = loadFromFile()

export function getAllStudentsFile(): StudentRecord[] {
  return [...students]
}

export function addStudentFile(record: StudentRecord): void {
  students.push(record)
  try {
    saveToFile(students)
  } catch {
    // best-effort
  }
}

export function getStudentByIdFile(id: string): StudentRecord | undefined {
  return students.find((s) => s.id === id)
}

export function initFileStore(): void {
  students = loadFromFile()
}
