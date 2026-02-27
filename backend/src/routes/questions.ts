import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { requireAuth, requireRole, type AuthLocals } from '../middleware/auth.js'
import { getAllQuestions, getQuestionById, addQuestion } from '../questions-store.js'
import type { Question, CreateQuestionBody } from '../types/question.js'

export const questionsRouter = Router()

function validateCreateQuestion(body: unknown): { success: true; data: CreateQuestionBody } | { success: false; message: string } {
  if (!body || typeof body !== 'object') {
    return { success: false, message: 'Request body must be a JSON object' }
  }
  const b = body as Record<string, unknown>
  const questionText = b.questionText
  if (!questionText || typeof questionText !== 'string' || String(questionText).trim() === '') {
    return { success: false, message: 'questionText is required' }
  }
  const options = b.options
  if (!Array.isArray(options) || options.length < 2) {
    return { success: false, message: 'options must be an array with at least 2 items' }
  }
  const optionsStrings = options.map((o) => (o != null ? String(o).trim() : '')).filter(Boolean)
  if (optionsStrings.length < 2) {
    return { success: false, message: 'At least 2 non-empty options are required' }
  }
  const correctIndex = b.correctIndex
  if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= optionsStrings.length) {
    return { success: false, message: 'correctIndex must be a valid option index (0 to options.length - 1)' }
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
