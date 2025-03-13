import express from 'express'
import request from 'supertest'
import { mockPipelineJobs } from '../../mocks/pipelineJobs'
import { pipelineExecutionService } from '../../services/pipelineExecutionService'
import pipelineJobs from '../pipelineJobs'

jest.mock('../../services/pipelineExecutionService')

const app = express()
app.use(express.json())
app.use('/api/pipeline-execution', pipelineJobs)

// 날짜를 문자열로 변환하는 헬퍼 함수
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

  describe('GET /api/pipeline-execution/jobs', () => {
    it('모든 실행 기록을 성공적으로 조회해야 합니다', async () => {
      // Mock 설정
      jest
        .spyOn(pipelineExecutionService, 'getAllExecutionRecords')
        .mockResolvedValue(mockPipelineJobs)

      // 테스트 실행
      const response = await request(app).get('/api/pipeline-execution/jobs')

      // 검증
      expect(response.status).toBe(200)
      expect(response.body).toEqual(convertDatesToStrings(mockPipelineJobs))
      expect(pipelineExecutionService.getAllExecutionRecords).toHaveBeenCalled()
    })

    it('서비스 오류 발생 시 500 에러를 반환해야 합니다', async () => {
      // Mock 설정
      jest
        .spyOn(pipelineExecutionService, 'getAllExecutionRecords')
        .mockRejectedValue(new Error('서비스 오류'))

      // 테스트 실행
      const response = await request(app).get('/api/pipeline-execution/jobs')

      // 검증
      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        success: false,
        error: '서비스 오류',
      })
    })
  })

  describe('GET /api/pipeline-execution/jobs/:jobId', () => {
    const testJobId = mockPipelineJobs[0].jobId

    it('특정 Job ID로 실행 기록을 성공적으로 조회해야 합니다', async () => {
      // Mock 설정
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecord')
        .mockResolvedValue(mockPipelineJobs[0])

      // 테스트 실행
      const response = await request(app).get(
        `/api/pipeline-execution/jobs/${testJobId}`,
      )

      // 검증
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: convertDatesToStrings(mockPipelineJobs[0]),
      })
      expect(pipelineExecutionService.getExecutionRecord).toHaveBeenCalledWith(
        testJobId,
      )
    })

    it('존재하지 않는 Job ID 조회 시 404 에러를 반환해야 합니다', async () => {
      // Mock 설정
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecord')
        .mockResolvedValue(undefined)

      // 테스트 실행
      const response = await request(app).get(
        '/api/pipeline-execution/jobs/non-existent-id',
      )

      // 검증
      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        success: false,
        error: '해당 실행 기록을 찾을 수 없습니다.',
      })
    })

    it('서비스 오류 발생 시 500 에러를 반환해야 합니다', async () => {
      // Mock 설정
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecord')
        .mockRejectedValue(new Error('서비스 오류'))

      // 테스트 실행
      const response = await request(app).get(
        `/api/pipeline-execution/jobs/${testJobId}`,
      )

      // 검증
      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        success: false,
        error: '서비스 오류',
      })
    })
  })

  describe('GET /api/pipeline-execution/pipelines/:pipelineId/jobs', () => {
    const testPipelineId = mockPipelineJobs[0].pipelineId

    it('파이프라인 ID로 실행 기록을 성공적으로 조회해야 합니다', async () => {
      // Mock 설정
      const pipelineJobs = mockPipelineJobs.filter(
        (job) => job.pipelineId === testPipelineId,
      )
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecordsByPipelineId')
        .mockResolvedValue(pipelineJobs)

      // 테스트 실행
      const response = await request(app).get(
        `/api/pipeline-execution/pipelines/${testPipelineId}/jobs`,
      )

      // 검증
      expect(response.status).toBe(200)
      expect(response.body).toEqual(convertDatesToStrings(pipelineJobs))
      expect(
        pipelineExecutionService.getExecutionRecordsByPipelineId,
      ).toHaveBeenCalledWith(testPipelineId)
    })

    it('서비스 오류 발생 시 500 에러를 반환해야 합니다', async () => {
      // Mock 설정
      jest
        .spyOn(pipelineExecutionService, 'getExecutionRecordsByPipelineId')
        .mockRejectedValue(new Error('서비스 오류'))

      // 테스트 실행
      const response = await request(app).get(
        `/api/pipeline-execution/pipelines/${testPipelineId}/jobs`,
      )

      // 검증
      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        success: false,
        error: '서비스 오류',
      })
    })
  })
})
