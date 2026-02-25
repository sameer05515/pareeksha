import express from 'express'
import { studentsRouter } from './routes/students.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(express.json())

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

app.use('/api/students', studentsRouter)

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
  await initStore()
  app.listen(PORT, () => {
    console.log(`Pareeksha backend running at http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
