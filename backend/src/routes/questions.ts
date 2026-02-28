import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { requireAuth, requireRole, type AuthLocals } from '../middleware/auth.js'
import { getAllQuestions, getQuestionById, addQuestion } from '../questions-store.js'
import type { Question, CreateQuestionBody } from '../types/question.js'

export const questionsRouter = Router()

function validateOneQuestion(
  item: unknown,
  index: number
): { success: true; data: CreateQuestionBody } | { success: false; message: string; index: number } {
  if (!item || typeof item !== 'object') {
    return { success: false, message: 'Each item must be an object', index }
  }
  const b = item as Record<string, unknown>
  const questionText = b.questionText
  if (!questionText || typeof questionText !== 'string' || String(questionText).trim() === '') {
    return { success: false, message: 'questionText is required', index }
  }
  const options = b.options
  if (!Array.isArray(options) || options.length < 2) {
    return { success: false, message: 'options must be an array with at least 2 items', index }
  }
  const optionsStrings = options.map((o) => (o != null ? String(o).trim() : '')).filter(Boolean)
  if (optionsStrings.length < 2) {
    return { success: false, message: 'At least 2 non-empty options are required', index }
  }
  const correctIndex = b.correctIndex
  if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= optionsStrings.length) {
    return {
      success: false,
      message: `correctIndex must be 0 to ${optionsStrings.length - 1}`,
      index,
    }
  }
  return {
    success: true,
    data: {
      questionText: String(questionText).trim(),
      options: optionsStrings,
      correctIndex,
    },
  }
}

function validateCreateQuestion(body: unknown): { success: true; data: CreateQuestionBody } | { success: false; message: string } {
  if (!body || typeof body !== 'object') {
    return { success: false, message: 'Request body must be a JSON object' }
  }
  const result = validateOneQuestion(body, 0)
  if (!result.success) {
    return { success: false, message: result.message }
  }
  return { success: true, data: result.data }
}

questionsRouter.get('/', (_req, res, next) => {
  try {
    const questions = getAllQuestions()
    res.json({ success: true, questions })
  } catch (err) {
    next(err)
  }
})

questionsRouter.get('/:id', (req, res, next) => {
  try {
    const question = getQuestionById(req.params.id)
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found' })
      return
    }
    res.json({ success: true, question })
  } catch (err) {
    next(err)
  }
})

questionsRouter.post('/', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const result = validateCreateQuestion(req.body)
    if (!result.success) {
      res.status(400).json({ success: false, message: result.message })
      return
    }
    const auth = res.locals.auth as AuthLocals
    const record: Question = {
      ...result.data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: auth.userId,
    }
    addQuestion(record)
    res.status(201).json({ success: true, message: 'Question added', question: record })
  } catch (err) {
    next(err)
  }
})

// POST /api/questions/bulk — admin only, body: { questions: CreateQuestionBody[] }
questionsRouter.post('/bulk', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const body = req.body
    if (!body || typeof body !== 'object') {
      res.status(400).json({ success: false, message: 'Request body must be a JSON object' })
      return
    }
    const raw = (body as Record<string, unknown>).questions
    if (!Array.isArray(raw)) {
      res.status(400).json({ success: false, message: 'questions must be an array' })
      return
    }
    const errors: { index: number; message: string }[] = []
    const valid: CreateQuestionBody[] = []
    for (let i = 0; i < raw.length; i++) {
      const result = validateOneQuestion(raw[i], i)
      if (result.success) {
        valid.push(result.data)
      } else {
        errors.push({ index: i, message: result.message })
      }
    }
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: `Validation failed for ${errors.length} item(s)`,
        errors,
      })
      return
    }
    const auth = res.locals.auth as AuthLocals
    const created: Question[] = valid.map((data) => ({
      ...data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: auth.userId,
    }))
    for (const q of created) {
      addQuestion(q)
    }
    res.status(201).json({
      success: true,
      message: `Added ${created.length} question(s)`,
      count: created.length,
      questions: created,
    })
  } catch (err) {
    next(err)
  }
})
