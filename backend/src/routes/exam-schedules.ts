import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { requireAuth, requireRole, optionalAuth, type AuthLocals } from '../middleware/auth.js'
import {
  getAllExamSchedules,
  getExamScheduleById,
  addExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
} from '../exam-schedules-store.js'
import { isStudentRegistered, addRegistration, removeRegistration } from '../exam-registrations-store.js'
import { getActiveAttemptByStudent, createAttempt, getAttemptById, submitAttempt, getSubmittedAttemptsByStudent, hasAttemptsForSchedule, getSubmittedAttemptsBySchedule } from '../exam-attempts-store.js'
import { getQuestionsByIds } from '../questions-store.js'
import { getStudentById } from '../store.js'
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

const DEFAULT_EXAM_DURATION_MINUTES = 60

function getExamEndTime(schedule: ExamSchedule): number {
  const start = new Date(schedule.scheduledAt).getTime()
  const durationMs = (schedule.durationMinutes ?? DEFAULT_EXAM_DURATION_MINUTES) * 60 * 1000
  return start + durationMs
}

function isExamWindowOpen(schedule: ExamSchedule): boolean {
  const now = Date.now()
  const start = new Date(schedule.scheduledAt).getTime()
  const end = getExamEndTime(schedule)
  return now >= start && now < end
}

// Student: get current active attempt (must be before /:id)
examSchedulesRouter.get('/attempts/current', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const studentId = auth.studentId
    if (!studentId) {
      res.status(403).json({ success: false, message: 'Student profile not linked' })
      return
    }
    const attempt = getActiveAttemptByStudent(studentId)
    if (!attempt) {
      res.status(404).json({ success: false, message: 'No active attempt' })
      return
    }
    const schedule = getExamScheduleById(attempt.examScheduleId)
    if (!schedule || !isExamWindowOpen(schedule)) {
      res.status(404).json({ success: false, message: 'Exam window closed' })
      return
    }
    const questionIds = schedule.questionIds?.length ? schedule.questionIds : []
    const allQs = questionIds.length ? getQuestionsByIds(questionIds) : []
    const questions = allQs.map((q) => ({ id: q.id, questionText: q.questionText, options: q.options }))
    res.json({
      success: true,
      attempt: { id: attempt.id, startedAt: attempt.startedAt },
      schedule: { id: schedule.id, title: schedule.title, durationMinutes: schedule.durationMinutes ?? DEFAULT_EXAM_DURATION_MINUTES },
      questions,
    })
  } catch (err) {
    next(err)
  }
})

// Student: start new attempt (body: { scheduleId })
examSchedulesRouter.post('/attempts/start', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const studentId = auth.studentId
    if (!studentId) {
      res.status(403).json({ success: false, message: 'Student profile not linked' })
      return
    }
    const existing = getActiveAttemptByStudent(studentId)
    if (existing) {
      res.status(409).json({ success: false, message: 'You already have an active attempt', attemptId: existing.id })
      return
    }
    const scheduleId = (req.body as Record<string, unknown>)?.scheduleId
    if (typeof scheduleId !== 'string' || !scheduleId) {
      res.status(400).json({ success: false, message: 'scheduleId is required' })
      return
    }
    const schedule = getExamScheduleById(scheduleId)
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Exam schedule not found' })
      return
    }
    if (!isStudentRegistered(schedule.id, studentId)) {
      res.status(403).json({ success: false, message: 'Not registered for this exam' })
      return
    }
    if (!isExamWindowOpen(schedule)) {
      res.status(400).json({ success: false, message: 'Exam is not open for attempt at this time' })
      return
    }
    const attempt = createAttempt(schedule.id, studentId)
    const questionIds = schedule.questionIds?.length ? schedule.questionIds : []
    const allQs = questionIds.length ? getQuestionsByIds(questionIds) : []
    const questions = allQs.map((q) => ({ id: q.id, questionText: q.questionText, options: q.options }))
    res.status(201).json({
      success: true,
      attempt: { id: attempt.id, startedAt: attempt.startedAt },
      schedule: { id: schedule.id, title: schedule.title, durationMinutes: schedule.durationMinutes ?? DEFAULT_EXAM_DURATION_MINUTES },
      questions,
    })
  } catch (err) {
    next(err)
  }
})

// Student: submit attempt (body: { answers: Record<questionId, number> })
examSchedulesRouter.post('/attempts/:attemptId/submit', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const studentId = auth.studentId
    if (!studentId) {
      res.status(403).json({ success: false, message: 'Student profile not linked' })
      return
    }
    const attempt = getAttemptById(req.params.attemptId)
    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found' })
      return
    }
    if (attempt.studentId !== studentId) {
      res.status(403).json({ success: false, message: 'Not your attempt' })
      return
    }
    if (attempt.submittedAt) {
      res.status(400).json({ success: false, message: 'Attempt already submitted' })
      return
    }
    const body = req.body as Record<string, unknown>
    const answers = body?.answers
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      res.status(400).json({ success: false, message: 'answers object is required' })
      return
    }
    const normalized: Record<string, number> = {}
    for (const [qId, val] of Object.entries(answers)) {
      if (typeof val === 'number' && Number.isInteger(val) && val >= 0) normalized[qId] = val
    }
    const updated = submitAttempt(attempt.id, normalized)
    res.json({ success: true, message: 'Exam submitted', attempt: updated })
  } catch (err) {
    next(err)
  }
})

// Student: list my submitted attempts (must be before /attempts/:attemptId/result)
examSchedulesRouter.get('/attempts/mine', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const studentId = auth.studentId
    if (!studentId) {
      res.status(403).json({ success: false, message: 'Student profile not linked' })
      return
    }
    const submitted = getSubmittedAttemptsByStudent(studentId)
    const list = submitted.map((attempt) => {
      const schedule = getExamScheduleById(attempt.examScheduleId)
      const title = schedule?.title ?? 'Unknown exam'
      let score = 0
      let total = 0
      if (schedule && attempt.answers) {
        const questionIds = schedule.questionIds?.length ? schedule.questionIds : []
        const questions = questionIds.length ? getQuestionsByIds(questionIds) : []
        total = questions.length
        score = questions.filter((q) => attempt.answers![q.id] === q.correctIndex).length
      }
      return {
        id: attempt.id,
        examScheduleId: attempt.examScheduleId,
        scheduleTitle: title,
        submittedAt: attempt.submittedAt,
        score,
        total,
      }
    })
    res.json({ success: true, attempts: list })
  } catch (err) {
    next(err)
  }
})

// Student: get attempt result (score + breakdown) for a submitted attempt
examSchedulesRouter.get('/attempts/:attemptId/result', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const studentId = auth.studentId
    if (!studentId) {
      res.status(403).json({ success: false, message: 'Student profile not linked' })
      return
    }
    const attempt = getAttemptById(req.params.attemptId)
    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found' })
      return
    }
    if (attempt.studentId !== studentId) {
      res.status(403).json({ success: false, message: 'Not your attempt' })
      return
    }
    if (!attempt.submittedAt || !attempt.answers) {
      res.status(400).json({ success: false, message: 'Attempt not yet submitted' })
      return
    }
    const schedule = getExamScheduleById(attempt.examScheduleId)
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Schedule not found' })
      return
    }
    const questionIds = schedule.questionIds?.length ? schedule.questionIds : []
    const questions = questionIds.length ? getQuestionsByIds(questionIds) : []
    const results = questions.map((q) => {
      const selectedIndex = attempt.answers![q.id]
      const correct = selectedIndex === q.correctIndex
      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex: selectedIndex ?? -1,
        correct,
      }
    })
    const score = results.filter((r) => r.correct).length
    res.json({
      success: true,
      schedule: { id: schedule.id, title: schedule.title },
      attempt: { id: attempt.id, submittedAt: attempt.submittedAt },
      score,
      total: results.length,
      results,
    })
  } catch (err) {
    next(err)
  }
})

// Student: upcoming exam schedules with registration status (must be before /:id)
// Includes both future exams (scheduledAt > now) and currently active exams (in time window) so "Start exam" stays visible
examSchedulesRouter.get('/upcoming', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const studentId = auth.studentId
    if (!studentId) {
      res.status(403).json({ success: false, message: 'Student profile not linked' })
      return
    }
    const now = new Date().toISOString()
    const all = getAllExamSchedules()
    const upcoming = all
      .filter((s) => {
        if (s.scheduledAt > now) return true // future
        return isExamWindowOpen(s) // currently in exam window
      })
      .map((s) => ({
        ...s,
        registered: isStudentRegistered(s.id, studentId),
      }))
    res.json({ success: true, schedules: upcoming })
  } catch (err) {
    next(err)
  }
})

// Admin: score and rank report for an exam (all locations + school-wise) — must be before GET /:id
examSchedulesRouter.get('/:id/score-report', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const scheduleId = req.params.id
    const schedule = getExamScheduleById(scheduleId)
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Exam schedule not found' })
      return
    }
    const attempts = getSubmittedAttemptsBySchedule(scheduleId)
    const questionIds = schedule.questionIds?.length ? schedule.questionIds : []
    const questions = questionIds.length ? getQuestionsByIds(questionIds) : []
    const totalMarks = questions.length

    type Row = {
      attemptId: string
      studentId: string
      studentName: string
      schoolNameAndAddress: string
      city: string
      state: string
      score: number
      total: number
      submittedAt: string
    }

    const rows: Row[] = []
    for (const attempt of attempts) {
      if (!attempt.answers) continue
      let score = 0
      for (const q of questions) {
        if (attempt.answers[q.id] === q.correctIndex) score += 1
      }
      const student = await getStudentById(attempt.studentId)
      const nameParts = student ? [student.firstName, student.middleName, student.lastName].filter(Boolean) : []
      const studentName = nameParts.length ? nameParts.join(' ').trim() : attempt.studentId
      rows.push({
        attemptId: attempt.id,
        studentId: attempt.studentId,
        studentName,
        schoolNameAndAddress: student?.schoolNameAndAddress ?? '—',
        city: student?.city ?? '—',
        state: student?.state ?? '—',
        score,
        total: totalMarks,
        submittedAt: attempt.submittedAt ?? '',
      })
    }

    // All locations: sort by score desc, then submittedAt asc (earlier first for tie-break), assign rank
    const byScoreDesc = [...rows].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (a.submittedAt || '').localeCompare(b.submittedAt || '')
    })
    const allLocations = byScoreDesc.map((r, i) => ({ ...r, rank: i + 1 }))

    // School-wise: group by schoolNameAndAddress, within each group sort by score desc and assign rank
    const schoolMap = new Map<string, Row[]>()
    for (const r of rows) {
      const key = (r.schoolNameAndAddress || '').trim() || '(No school)'
      if (!schoolMap.has(key)) schoolMap.set(key, [])
      schoolMap.get(key)!.push(r)
    }
    const schoolWise: { schoolNameAndAddress: string; city: string; state: string; students: Array<Row & { rank: number }> }[] = []
    for (const [schoolNameAndAddress, students] of schoolMap) {
      const sorted = [...students].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (a.submittedAt || '').localeCompare(b.submittedAt || '')
      })
      const withRank = sorted.map((r, i) => ({ ...r, rank: i + 1 }))
      const firstRow = sorted[0]
      schoolWise.push({
        schoolNameAndAddress: schoolNameAndAddress === '(No school)' ? '' : schoolNameAndAddress,
        city: firstRow?.city ?? '—',
        state: firstRow?.state ?? '—',
        students: withRank,
      })
    }
    schoolWise.sort((a, b) => a.schoolNameAndAddress.localeCompare(b.schoolNameAndAddress))

    res.json({
      success: true,
      schedule: { id: schedule.id, title: schedule.title, scheduledAt: schedule.scheduledAt },
      allLocations,
      schoolWise,
    })
  } catch (err) {
    next(err)
  }
})

examSchedulesRouter.get('/:id', optionalAuth, (req, res, next) => {
  try {
    const schedule = getExamScheduleById(req.params.id)
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Exam schedule not found' })
      return
    }
    const auth = res.locals.auth as AuthLocals | undefined
    const isAdmin = auth?.role === 'admin'
    const payload: { success: true; schedule: ExamSchedule; hasAttempts?: boolean } = { success: true, schedule }
    if (isAdmin) payload.hasAttempts = hasAttemptsForSchedule(schedule.id)
    res.json(payload)
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
    const scheduleId = req.params.id
    const existing = getExamScheduleById(scheduleId)
    if (!existing) {
      res.status(404).json({ success: false, message: 'Exam schedule not found' })
      return
    }
    // If any user has attempted this exam, only rescheduling is allowed; questions list cannot be edited.
    if (hasAttemptsForSchedule(scheduleId)) {
      if (result.data.questionIds !== undefined) {
        res.status(400).json({
          success: false,
          message: 'This exam has been attempted. Only rescheduling (title, scheduledAt, durationMinutes) is allowed. The questions list cannot be edited.',
        })
        return
      }
      // Strip to reschedule fields only
      const rescheduleOnly: UpdateExamScheduleBody = {}
      if (result.data.title !== undefined) rescheduleOnly.title = result.data.title
      if (result.data.scheduledAt !== undefined) rescheduleOnly.scheduledAt = result.data.scheduledAt
      if (result.data.durationMinutes !== undefined) rescheduleOnly.durationMinutes = result.data.durationMinutes
      if (Object.keys(rescheduleOnly).length === 0) {
        res.status(400).json({ success: false, message: 'No fields to update' })
        return
      }
      const updated = updateExamSchedule(scheduleId, rescheduleOnly)
      res.json({ success: true, message: 'Exam schedule updated (reschedule only)', schedule: updated })
      return
    }
    const updated = updateExamSchedule(scheduleId, result.data)
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

// Student: register for an exam
examSchedulesRouter.post('/:id/register', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const studentId = auth.studentId
    if (!studentId) {
      res.status(403).json({ success: false, message: 'Student profile not linked' })
      return
    }
    const schedule = getExamScheduleById(req.params.id)
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Exam schedule not found' })
      return
    }
    if (schedule.scheduledAt <= new Date().toISOString()) {
      res.status(400).json({ success: false, message: 'Cannot register for a past exam' })
      return
    }
    const added = addRegistration(schedule.id, studentId)
    if (!added) {
      res.status(409).json({ success: false, message: 'Already registered for this exam' })
      return
    }
    res.status(201).json({ success: true, message: 'Registered for exam' })
  } catch (err) {
    next(err)
  }
})

// Student: unregister from an exam
examSchedulesRouter.delete('/:id/register', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const studentId = auth.studentId
    if (!studentId) {
      res.status(403).json({ success: false, message: 'Student profile not linked' })
      return
    }
    const removed = removeRegistration(req.params.id, studentId)
    if (!removed) {
      res.status(404).json({ success: false, message: 'Not registered for this exam' })
      return
    }
    res.json({ success: true, message: 'Unregistered from exam' })
  } catch (err) {
    next(err)
  }
})
