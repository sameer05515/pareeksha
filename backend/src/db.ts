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
      preferredLanguage VARCHAR(50) NOT NULL DEFAULT '',
      adhaarNumber VARCHAR(20) NOT NULL DEFAULT '',
      firstName VARCHAR(100) NOT NULL,
      middleName VARCHAR(100) NOT NULL DEFAULT '',
      lastName VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      dateOfBirth DATE NOT NULL,
      gender VARCHAR(50) NOT NULL,
      schoolNameAndAddress VARCHAR(500) NOT NULL,
      schoolEnrollmentNumber VARCHAR(100) NOT NULL,
      \`class\` VARCHAR(10) NOT NULL,
      board VARCHAR(100) NOT NULL,
      addressLine1 VARCHAR(500) NOT NULL,
      addressLine2 VARCHAR(500) NOT NULL DEFAULT '',
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      country VARCHAR(100) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      email VARCHAR(255) NOT NULL,
      mobile VARCHAR(20) NOT NULL
    )
  `)
}

export type StudentRow = RowDataPacket & {
  id: string
  createdAt: Date
  preferredLanguage: string
  adhaarNumber: string
  firstName: string
  middleName: string
  lastName: string
  password: string
  dateOfBirth: string
  gender: string
  schoolNameAndAddress: string
  schoolEnrollmentNumber: string
  class: string
  board: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  pincode: string
  email: string
  mobile: string
}
