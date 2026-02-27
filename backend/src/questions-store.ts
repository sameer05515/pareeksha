import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Question } from './types/question.js'

const DATA_DIR = join(process.cwd(), 'data')
const QUESTIONS_FILE = join(DATA_DIR, 'questions.json')

function loadQuestions(): Question[] {
  if (!existsSync(QUESTIONS_FILE)) return []
  try {
    const raw = readFileSync(QUESTIONS_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as Question[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveQuestions(questions: Question[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8')
}

let questions: Question[] = loadQuestions()

export function getAllQuestions(): Question[] {
  return [...questions]
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id)
}

export function addQuestion(question: Question): void {
  questions.push(question)
  try {
    saveQuestions(questions)
  } catch {
    // best-effort
  }
}

export function initQuestionsStore(): void {
  questions = loadQuestions()
}
