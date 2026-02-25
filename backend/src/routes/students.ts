import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { addStudent, getAllStudents, getStudentById } from '../store.js'
import { validateRegistration } from '../validation.js'
import type { StudentRecord } from '../types/student.js'

export const studentsRouter = Router()

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

    const record: StudentRecord = {
      ...result.data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    }
    await addStudent(record)

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: record,
    })
  } catch (err) {
    next(err)
  }
})

studentsRouter.get('/', async (_req, res, next) => {
  try {
    const students = await getAllStudents()
    res.json({ success: true, students })
  } catch (err) {
    next(err)
  }
})

studentsRouter.get('/:id', async (req, res, next) => {
  try {
    const student = await getStudentById(req.params.id)
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' })
      return
    }
    res.json({ success: true, student })
  } catch (err) {
    next(err)
  }
})
