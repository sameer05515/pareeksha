import express from 'express'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import swaggerUi from 'swagger-ui-express'
import { studentsRouter } from './routes/students.js'
import { authRouter } from './routes/auth.js'
import { questionsRouter } from './routes/questions.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(express.json())

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

// OpenAPI spec (used by Swagger UI and ReDoc)
let openApiSpec: object | null = null
function getOpenApiSpec(): object {
  if (!openApiSpec) {
    const specPath = path.join(process.cwd(), 'openapi.json')
    openApiSpec = JSON.parse(readFileSync(specPath, 'utf-8')) as object
  }
  return openApiSpec
}

app.get('/openapi.json', (_req, res) => {
  res.json(getOpenApiSpec())
})

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getOpenApiSpec(), {
  customCss: '.swagger-ui .topbar { display: none }',
}))

// ReDoc (static HTML that loads /openapi.json)
app.get('/redoc', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'redoc.html'))
})

app.use('/api/auth', authRouter)
app.use('/api/students', studentsRouter)
app.use('/api/questions', questionsRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : 'Internal server error',
  })
})

async function start() {
  const { initStore } = await import('./store.js')
  const { initUsersStore, ensureDefaultAdmin } = await import('./users-store.js')
  const { initQuestionsStore } = await import('./questions-store.js')
  await initStore()
  initUsersStore()
  ensureDefaultAdmin()
  initQuestionsStore()
  app.listen(PORT, () => {
    console.log(`🚀 Pareeksha backend running at http://localhost:${PORT}`);
    console.log('🔁 OpenAPI spec: http://localhost:3000/openapi.json');
    console.log('🔗 Swagger UI: http://localhost:3000/api-docs');
    console.log('🔗 ReDoc: http://localhost:3000/redoc');
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
