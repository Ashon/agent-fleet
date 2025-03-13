import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import agentsRouter from './routes/agents'
import connectorsRouter from './routes/connectors'
import fleetsRouter from './routes/fleets'
import pipelineJobRoutes from './routes/pipelineJobs'
import reasoningPipelinesRouter from './routes/reasoningPipelines'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// 미들웨어 설정
app.use(cors())
app.use(express.json())
app.use(morgan('dev')) // 개발 환경용 로그 포맷

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'AgentFleet API Server' })
})

// API 라우트
app.use('/api/agents', agentsRouter)
app.use('/api/connectors', connectorsRouter)
app.use('/api/reasoning-pipelines', reasoningPipelinesRouter)
app.use('/api/fleets', fleetsRouter)
app.use('/api/pipeline-execution', pipelineJobRoutes)

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
    next: express.NextFunction,
  ) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
  },
)

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
