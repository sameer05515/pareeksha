import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { requireAuth, requireRole, type AuthLocals } from '../middleware/auth.js'
import {
  getAllExamSchedules,
  getExamScheduleById,
  addExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
} from '../exam-schedules-store.js'
import type { ExamSchedule, CreateExamScheduleBody, UpdateExamScheduleBody } from '../types/exam-schedule.js'

export const examSchedulesRouter = Router()

function validateCreate(body: unknown): { success: true; data: CreateExamScheduleBody } | { success: false; message: string } {
  if (!body || typeof body !== 'object') {
    return { success: false, message: 'Request body must be a JSON object' }
  }
  const b = body as Record<string, unknown>
  const title = b.title
  if (!title || typeof title !== 'string' || String(title).trim() === '') {
    return { success: false, message: 'title is required' }
  }
  const scheduledAt = b.scheduledAt
  if (!scheduledAt || typeof scheduledAt !== 'string' || String(scheduledAt).trim() === '') {
    return { success: false, message: 'scheduledAt is required (ISO 8601 datetime)' }
  }
  const parsed = new Date(String(scheduledAt))
  if (Number.isNaN(parsed.getTime())) {
    return { success: false, message: 'scheduledAt must be a valid ISO 8601 datetime' }
  }
  let durationMinutes: number | undefined
  if (b.durationMinutes != null) {
    const d = Number(b.durationMinutes)
    if (Number.isNaN(d) || d < 1 || d > 9999) {
      return { success: false, message: 'durationMinutes must be between 1 and 9999' }
    }
    durationMinutes = d
  }
  let questionIds: string[] | undefined
  if (b.questionIds != null) {
    if (!Array.isArray(b.questionIds)) {
      return { success: false, message: 'questionIds must be an array of strings' }
    }
    questionIds = (b.questionIds as unknown[]).map((x) => String(x)).filter(Boolean)
  }
  return {
    success: true,
    data: {
      title: String(title).trim(),
      scheduledAt: String(scheduledAt).trim(),
      durationMinutes,
      questionIds: questionIds?.length ? questionIds : undefined,
    },
  }
}

function validateUpdate(body: unknown): { success: true; data: UpdateExamScheduleBody } | { success: false; message: string } {
  if (!body || typeof body !== 'object') {
    return { success: false, message: 'Request body must be a JSON object' }
  }
  const b = body as Record<string, unknown>
  const data: UpdateExamScheduleBody = {}
  if (b.title !== undefined) {
    if (typeof b.title !== 'string' || String(b.title).trim() === '') {
      return { success: false, message: 'title must be a non-empty string' }
    }
    data.title = String(b.title).trim()
  }
  if (b.scheduledAt !== undefined) {
    if (typeof b.scheduledAt !== 'string' || String(b.scheduledAt).trim() === '') {
      return { success: false, message: 'scheduledAt must be a non-empty string' }
    }
    const parsed = new Date(String(b.scheduledAt))
    if (Number.isNaN(parsed.getTime())) {
      return { success: false, message: 'scheduledAt must be a valid ISO 8601 datetime' }
    }
    data.scheduledAt = String(b.scheduledAt).trim()
  }
  if (b.durationMinutes !== undefined) {
    const d = Number(b.durationMinutes)
    if (Number.isNaN(d) || d < 1 || d > 9999) {
      return { success: false, message: 'durationMinutes must be between 1 and 9999' }
    }
    data.durationMinutes = d
  }
  if (b.questionIds !== undefined) {
    if (!Array.isArray(b.questionIds)) {
      return { success: false, message: 'questionIds must be an array of strings' }
    }
    data.questionIds = (b.questionIds as unknown[]).map((x) => String(x)).filter(Boolean)
  }
  return { success: true, data }
}

examSchedulesRouter.get('/', (_req, res, next) => {
  try {
    const schedules = getAllExamSchedules()
    res.json({ success: true, schedules })
  } catch (err) {
    next(err)
  }
})

examSchedulesRouter.get('/:id', (req, res, next) => {
  try {
    const schedule = getExamScheduleById(req.params.id)
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Exam schedule not found' })
      return
    }
    res.json({ success: true, schedule })
  } catch (err) {
    next(err)
  }
})

examSchedulesRouter.post('/', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const result = validateCreate(req.body)
    if (!result.success) {
      res.status(400).json({ success: false, message: result.message })
      return
    }
    const auth = res.locals.auth as AuthLocals
    const record: ExamSchedule = {
      ...result.data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: auth.userId,
    }
    addExamSchedule(record)
    res.status(201).json({ success: true, message: 'Exam schedule created', schedule: record })
  } catch (err) {
    next(err)
  }
})

examSchedulesRouter.put('/:id', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const result = validateUpdate(req.body)
    if (!result.success) {
      res.status(400).json({ success: false, message: result.message })
      return
    }
    if (Object.keys(result.data).length === 0) {
      res.status(400).json({ success: false, message: 'No fields to update' })
      return
    }
    const updated = updateExamSchedule(req.params.id, result.data)
    if (!updated) {
      res.status(404).json({ success: false, message: 'Exam schedule not found' })
      return
    }
    res.json({ success: true, message: 'Exam schedule updated', schedule: updated })
  } catch (err) {
    next(err)
  }
})

examSchedulesRouter.delete('/:id', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const deleted = deleteExamSchedule(req.params.id)
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Exam schedule not found' })
      return
    }
    res.json({ success: true, message: 'Exam schedule deleted' })
  } catch (err) {
    next(err)
  }
})
