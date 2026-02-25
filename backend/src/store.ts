import { getPool, ensureTable, type StudentRow } from './db.js'
import type { StudentRecord } from './types/student.js'

function rowToRecord(row: StudentRow): StudentRecord {
  const toDateStr = (v: unknown): string =>
    v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? '')
  const toIso = (v: unknown): string =>
    v instanceof Date ? v.toISOString() : String(v ?? '')
  return {
    id: row.id,
    createdAt: toIso(row.createdAt),
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    dateOfBirth: toDateStr(row.dateOfBirth),
    phone: row.phone ?? '',
    adhaarNumber: row.adhaarNumber ?? '',
    schoolName: row.schoolName,
    class: row.class,
    gender: row.gender,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    guardianName: row.guardianName,
    guardianPhone: row.guardianPhone ?? '',
  }
}

export async function getAllStudents(): Promise<StudentRecord[]> {
  const [rows] = await getPool().execute<StudentRow[]>(
    `SELECT id, createdAt, firstName, lastName, email, dateOfBirth, phone, adhaarNumber,
     schoolName, \`class\`, gender, address, city, state, pincode, guardianName, guardianPhone
     FROM students ORDER BY createdAt DESC`
  )
  return (rows ?? []).map(rowToRecord)
}

export async function addStudent(record: StudentRecord): Promise<void> {
  const createdAt = new Date(record.createdAt)
  await getPool().execute(
    `INSERT INTO students (
      id, createdAt, firstName, lastName, email, dateOfBirth, phone, adhaarNumber,
      schoolName, \`class\`, gender, address, city, state, pincode,
      guardianName, guardianPhone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      createdAt,
      record.firstName,
      record.lastName,
      record.email,
      record.dateOfBirth,
      record.phone,
      record.adhaarNumber,
      record.schoolName,
      record.class,
      record.gender,
      record.address,
      record.city,
      record.state,
      record.pincode,
      record.guardianName,
      record.guardianPhone,
    ]
  )
}

export async function getStudentById(id: string): Promise<StudentRecord | undefined> {
  const [rows] = await getPool().execute<StudentRow[]>(
    `SELECT id, createdAt, firstName, lastName, email, dateOfBirth, phone, adhaarNumber,
     schoolName, \`class\`, gender, address, city, state, pincode, guardianName, guardianPhone
     FROM students WHERE id = ?`,
    [id]
  )
  const row = (rows ?? [])[0]
  return row ? rowToRecord(row) : undefined
}

export async function initStore(): Promise<void> {
  await ensureTable()
}
