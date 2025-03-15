import express from 'express'
import request from 'supertest'
import { errorHandler } from '../../middleware/errorHandler'
import { mockPipelineExecutions } from '../../mocks/mockPipelineExecutions'
import { pipelineExecutionService } from '../index'
import { createPipelineExecutionsRouter } from '../pipelineJobs.routes'

jest.mock('../../services/pipelineExecution.service')

const app = express()
const router = createPipelineExecutionsRouter(pipelineExecutionService)
app.use(express.json())
app.use('/api/pipeline-executions', router)
app.use(errorHandler)

// 날짜를 문자열로 변환하는 헬퍼 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertDatesToStrings = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(convertDatesToStrings)

  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertDatesToStrings(value),
      ]),
    )
  }
  return obj
}

describe('Pipeline Job Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/pipeline-executions/jobs', () => {
    it('모든 실행 기록을 성공적으로 조회해야 합니다', async () => {
      jest
        .spyOn(pipelineExecutionService, 'getAllExecutionRecords')
        .mockResolvedValue(mockPipelineExecutions)

      const response = await request(app).get('/api/pipeline-executions/jobs')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        convertDatesToStrings(mockPipelineExecutions),
      )
      expect(pipelineExecutionService.getAllExecutionRecords).toHaveBeenCalled()
    })

    it('서비스 오류 발생 시 500 에러를 반환해야 합니다', async () => {
      jest
        .spyOn(pipelineExecutionService, 'getAllExecutionRecords')
        .mockRejectedValue(new Error('Service error'))

      const response = await request(app).get('/api/pipeline-executions/jobs')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('서버 오류가 발생했습니다.')
    })
  })

  describe('GET /api/pipeline-executions/jobs/:id', () => {
    const testid = mockPipelineExecutions[0].id

    it('특정 Job ID로 실행 기록을 성공적으로 조회해야 합니다', async () => {
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecord')
        .mockResolvedValue(mockPipelineExecutions[0])

      const response = await request(app).get(
        `/api/pipeline-executions/jobs/${testid}`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: convertDatesToStrings(mockPipelineExecutions[0]),
      })
      expect(pipelineExecutionService.getExecutionRecord).toHaveBeenCalledWith(
        testid,
      )
    })

    it('존재하지 않는 Job ID 조회 시 404 에러를 반환해야 합니다', async () => {
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecord')
        .mockResolvedValue(undefined)

      const response = await request(app).get(
        '/api/pipeline-executions/jobs/non-existent-id',
      )

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Execution record not found')
    })

    it('서비스 오류 발생 시 500 에러를 반환해야 합니다', async () => {
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecord')
        .mockRejectedValue(new Error('Service error'))

      const response = await request(app).get(
        `/api/pipeline-executions/jobs/${testid}`,
      )

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('서버 오류가 발생했습니다.')
    })
  })

  describe('GET /api/pipeline-executions/pipelines/:pipelineId/jobs', () => {
    const testPipelineId = mockPipelineExecutions[0].pipelineId

    it('파이프라인 ID로 실행 기록을 성공적으로 조회해야 합니다', async () => {
      const pipelineExecutions = mockPipelineExecutions.filter(
        (execution) => execution.pipelineId === testPipelineId,
      )
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecordsByPipelineId')
        .mockResolvedValue(pipelineExecutions)

      const response = await request(app).get(
        `/api/pipeline-executions/pipelines/${testPipelineId}/jobs`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual(convertDatesToStrings(pipelineExecutions))
      expect(
        pipelineExecutionService.getExecutionRecordsByPipelineId,
      ).toHaveBeenCalledWith(testPipelineId)
    })

    it('실행 기록이 없는 경우 404 에러를 반환해야 합니다', async () => {
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecordsByPipelineId')
        .mockResolvedValue([])

      const response = await request(app).get(
        `/api/pipeline-executions/pipelines/${testPipelineId}/jobs`,
      )

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(
        'No execution records found for this pipeline',
      )
    })

    it('서비스 오류 발생 시 500 에러를 반환해야 합니다', async () => {
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecordsByPipelineId')
        .mockRejectedValue(new Error('Service error'))

      const response = await request(app).get(
        `/api/pipeline-executions/pipelines/${testPipelineId}/jobs`,
      )

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('서버 오류가 발생했습니다.')
    })
  })
})
