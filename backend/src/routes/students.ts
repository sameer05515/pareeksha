import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { addStudent, getAllStudents, getStudentById } from '../store.js'
import { validateRegistration } from '../validation.js'
import { addUser, getUserByEmail } from '../users-store.js'
import { requireAuth, requireRole, type AuthLocals } from '../middleware/auth.js'
import type { StudentRecord } from '../types/student.js'

export const studentsRouter = Router()

// Public: register (creates student + user with role student)
studentsRouter.post('/register', async (req, res, next) => {
  try {
    const result = validateRegistration(req.body)
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.errors,
      })
      return
    }
    const existing = getUserByEmail(result.data.email)
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
        errors: [{ field: 'email', message: 'Email already registered' }],
      })
      return
    }

    const record: StudentRecord = {
      ...result.data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    }
    await addStudent(record)

    const passwordHash = bcrypt.hashSync(result.data.password, 10)
    addUser({
      id: randomUUID(),
      email: result.data.email.trim().toLowerCase(),
      passwordHash,
      role: 'student',
      studentId: record.id,
      createdAt: new Date().toISOString(),
    })

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: record,
    })
  } catch (err) {
    next(err)
  }
})

// Student: get own profile
studentsRouter.get('/me', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    if (!auth.studentId) {
      res.status(404).json({ success: false, message: 'Student profile not found' })
      return
    }
    const student = await getStudentById(auth.studentId)
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' })
      return
    }
    res.json({ success: true, student })
  } catch (err) {
    next(err)
  }
})

// Admin: list all students
studentsRouter.get('/', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const students = await getAllStudents()
    res.json({ success: true, students })
  } catch (err) {
    next(err)
  }
})

// Admin: any student; Student: own record only
studentsRouter.get('/:id', requireAuth, requireRole('admin', 'student'), async (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const { id } = req.params
    if (auth.role === 'student' && id !== auth.studentId) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' })
      return
    }
    const student = await getStudentById(id)
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' })
      return
    }
    res.json({ success: true, student })
  } catch (err) {
    next(err)
  }
})
