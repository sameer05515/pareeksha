export interface Question {
  id: string
  questionText: string
  options: string[]
  correctIndex: number
  createdAt: string
  createdBy?: string
}

export interface CreateQuestionBody {
  questionText: string
  options: string[]
  correctIndex: number
}

export interface BulkCreateQuestionsBody {
  questions: CreateQuestionBody[]
}
