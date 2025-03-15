import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import config from './config'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'

const app = express()

// 미들웨어 설정
app.use(cors())
app.use(express.json())
app.use(errorHandler)
app.use(morgan('dev')) // 개발 환경용 로그 포맷

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'AgentFleet API Server' })
})

// API 라우트
app.use('/api', routes)

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' })
})

// 서버 시작
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`)
})
