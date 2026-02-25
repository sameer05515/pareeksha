import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'

const MYSQL_HOST = process.env.MYSQL_HOST ?? 'localhost'
const MYSQL_PORT = Number(process.env.MYSQL_PORT) || 3306
const MYSQL_USER = process.env.MYSQL_USER ?? 'root'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD ?? ''
const MYSQL_DATABASE = process.env.MYSQL_DATABASE ?? 'student'

let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function ensureTable(): Promise<void> {
  const p = getPool()
  await p.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(36) PRIMARY KEY,
      createdAt DATETIME(3) NOT NULL,
      firstName VARCHAR(100) NOT NULL,
      lastName VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      dateOfBirth DATE NOT NULL,
      phone VARCHAR(20) NOT NULL DEFAULT '',
      adhaarNumber VARCHAR(20) NOT NULL DEFAULT '',
      schoolName VARCHAR(255) NOT NULL,
      \`class\` VARCHAR(50) NOT NULL,
      gender VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      guardianName VARCHAR(255) NOT NULL,
      guardianPhone VARCHAR(20) NOT NULL DEFAULT ''
    )
  `)
}

export type StudentRow = RowDataPacket & {
  id: string
  createdAt: Date
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  phone: string
  adhaarNumber: string
  schoolName: string
  class: string
  gender: string
  address: string
  city: string
  state: string
  pincode: string
  guardianName: string
  guardianPhone: string
}
