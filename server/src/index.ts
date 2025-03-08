import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import agentsRouter from './routes/agents'
import connectorsRouter from './routes/connectors'
import agentWorkflowsRouter from './routes/agentWorkflows'
import fleetsRouter from './routes/fleets'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// 미들웨어 설정
app.use(cors())
app.use(express.json())
app.use(morgan('dev')) // 개발 환경용 로그 포맷

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Arcana API Server' })
})

// API 라우트
app.use('/api/agents', agentsRouter)
app.use('/api/connectors', connectorsRouter)
app.use('/api/workflows', agentWorkflowsRouter)
app.use('/api/fleets', fleetsRouter)

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' })
})

// 에러 처리 미들웨어
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
  }
)

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
