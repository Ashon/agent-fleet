import { S3Client } from '@aws-sdk/client-s3'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { createS3Client } from './clients/s3'
import { config } from './config'
import { S3RepositoryDriver } from './drivers/s3RepositoryDriver'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'

const s3Client = createS3Client({ config })
const s3RepositoryDriver = new S3RepositoryDriver(s3Client, config.bucketName)
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
s3RepositoryDriver.preflight()
app.listen(config.listenPort, () => {
  console.log(`Server is running on port ${config.listenPort}`)
})
