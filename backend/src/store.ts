import { getPool, ensureTable, type StudentRow } from './db.js'
import type { StudentRecord } from './types/student.js'
import {
  getAllStudentsFile,
  addStudentFile,
  getStudentByIdFile,
  initFileStore,
} from './store-file.js'

let useFileStore = false

function rowToRecord(row: StudentRow): StudentRecord {
  const toDateStr = (v: unknown): string =>
    v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? '')
  const toIso = (v: unknown): string =>
    v instanceof Date ? v.toISOString() : String(v ?? '')
  return {
    id: row.id,
    createdAt: toIso(row.createdAt),
    preferredLanguage: row.preferredLanguage ?? '',
    adhaarNumber: row.adhaarNumber ?? '',
    firstName: row.firstName,
    middleName: row.middleName ?? '',
    lastName: row.lastName,
    password: row.password,
    dateOfBirth: toDateStr(row.dateOfBirth),
    gender: row.gender,
    schoolNameAndAddress: row.schoolNameAndAddress,
    schoolEnrollmentNumber: row.schoolEnrollmentNumber,
    class: row.class,
    board: row.board,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2 ?? '',
    city: row.city,
    state: row.state,
    country: row.country,
    pincode: row.pincode,
    email: row.email,
    mobile: row.mobile ?? '',
  }
}

const COLS = `id, createdAt, preferredLanguage, adhaarNumber, firstName, middleName, lastName,
  password, dateOfBirth, gender, schoolNameAndAddress, schoolEnrollmentNumber, \`class\`, board,
  addressLine1, addressLine2, city, state, country, pincode, email, mobile`

export async function getAllStudents(): Promise<StudentRecord[]> {
  if (useFileStore) return Promise.resolve(getAllStudentsFile())
  const [rows] = await getPool().execute<StudentRow[]>(
    `SELECT ${COLS} FROM students ORDER BY createdAt DESC`
  )
  return (rows ?? []).map(rowToRecord)
}

export async function addStudent(record: StudentRecord): Promise<void> {
  if (useFileStore) {
    addStudentFile(record)
    return
  }
  const createdAt = new Date(record.createdAt)
  await getPool().execute(
    `INSERT INTO students (
      id, createdAt, preferredLanguage, adhaarNumber, firstName, middleName, lastName,
      password, dateOfBirth, gender, schoolNameAndAddress, schoolEnrollmentNumber, \`class\`, board,
      addressLine1, addressLine2, city, state, country, pincode, email, mobile
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      createdAt,
      record.preferredLanguage,
      record.adhaarNumber,
      record.firstName,
      record.middleName,
      record.lastName,
      record.password,
      record.dateOfBirth,
      record.gender,
      record.schoolNameAndAddress,
      record.schoolEnrollmentNumber,
      record.class,
      record.board,
      record.addressLine1,
      record.addressLine2,
      record.city,
      record.state,
      record.country,
      record.pincode,
      record.email,
      record.mobile,
    ]
  )
}

export async function getStudentById(id: string): Promise<StudentRecord | undefined> {
  if (useFileStore) return Promise.resolve(getStudentByIdFile(id))
  const [rows] = await getPool().execute<StudentRow[]>(
    `SELECT ${COLS} FROM students WHERE id = ?`,
    [id]
  )
  const row = (rows ?? [])[0]
  return row ? rowToRecord(row) : undefined
}

export async function initStore(): Promise<void> {
  try {
    await ensureTable()
    console.log('Using MySQL store (database: student)')
  } catch (err) {
    const code = err && typeof (err as { code?: string }).code === 'string' ? (err as { code: string }).code : ''
    const msg = err instanceof Error ? err.message : String(err)
    if (code === 'AUTH_SWITCH_PLUGIN_ERROR' || msg.includes('auth_gssapi_client')) {
      console.warn(
        'MySQL auth plugin (GSSAPI) not supported by this driver. Using file store instead. Data will be saved to backend/data/students.json'
      )
      console.warn(
        'To use MySQL, create a user with: ALTER USER \'your_user\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'password\';'
      )
    } else {
      console.warn('MySQL connection failed:', msg)
      console.warn('Using file store. Data will be saved to backend/data/students.json')
    }
    useFileStore = true
    initFileStore()
  }
}
