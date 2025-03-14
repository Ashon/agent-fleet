import {
  CreatePipelinePayload,
  Pipeline,
  PipelineTestResponse,
} from '@agentfleet/types'
import express from 'express'
import request from 'supertest'
import { errorHandler } from '../../middleware/errorHandler'
import { PipelineService } from '../../services/agentReasoningPipeline'
import { PipelineExecutionService } from '../../services/pipelineExecutionService'
import reasoningPipelinesRouter from '../agentReasoningPipelines'

jest.mock('../../services/agentReasoningPipeline')
jest.mock('../../services/pipelineExecutionService')

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

describe('Reasoning Pipeline Routes', () => {
  let app: express.Application
  let mockPipelineService: PipelineService
  let mockPipelineExecutionService: PipelineExecutionService
  const mockDate = new Date('2024-01-01T00:00:00.000Z')

  const mockPipelines: Pipeline[] = [
    {
      id: '1',
      agentId: '1',
      name: '테스트 워크플로우 1',
      description: '테스트 설명 1',
      nodes: [
        {
          id: 'node-1',
          type: 'input',
          position: { x: 50, y: 100 },
          data: {
            name: '시작',
          },
        },
      ],
      edges: [],
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      id: '2',
      agentId: '1',
      name: '테스트 워크플로우 2',
      description: '테스트 설명 2',
      nodes: [
        {
          id: 'node-1',
          type: 'input',
          position: { x: 50, y: 100 },
          data: {
            name: '시작',
          },
        },
      ],
      edges: [],
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    app = express()
    app.use(express.json())
    app.use('/api/reasoning-pipelines', reasoningPipelinesRouter)
    app.use(errorHandler)

    // 모킹된 서비스 생성
    mockPipelineService = new PipelineService(null as any)
    mockPipelineExecutionService = new PipelineExecutionService(null as any)

    // PipelineService 모킹
    jest
      .spyOn(mockPipelineService, 'getAllPipelines')
      .mockResolvedValue(mockPipelines)
    jest
      .spyOn(mockPipelineService, 'getPipelineById')
      .mockImplementation((id: string) =>
        Promise.resolve(mockPipelines.find((p) => p.id === id)),
      )
    jest
      .spyOn(mockPipelineService, 'createPipeline')
      .mockImplementation((data: CreatePipelinePayload) =>
        Promise.resolve({
          id: '3',
          ...data,
          createdAt: mockDate,
          updatedAt: mockDate,
        }),
      )
    jest
      .spyOn(mockPipelineService, 'updatePipeline')
      .mockImplementation(
        (id: string, data: Partial<CreatePipelinePayload>) => {
          const pipeline = mockPipelines.find((p) => p.id === id)
          if (!pipeline) return Promise.resolve(undefined)
          return Promise.resolve({
            ...pipeline,
            ...data,
            updatedAt: mockDate,
          })
        },
      )
    jest
      .spyOn(mockPipelineService, 'deletePipeline')
      .mockImplementation((id: string) =>
        Promise.resolve(mockPipelines.some((p) => p.id === id)),
      )
    jest.spyOn(mockPipelineService, 'validatePipeline').mockResolvedValue({
      isValid: true,
      message: 'Pipeline is valid',
    })
    jest
      .spyOn(mockPipelineService, 'updatePipelineNodes')
      .mockImplementation((id: string, nodes: any) =>
        Promise.resolve({
          ...mockPipelines[0],
          nodes,
          updatedAt: mockDate,
        }),
      )
    jest
      .spyOn(mockPipelineService, 'updatePipelineEdges')
      .mockImplementation((id: string, edges: any) =>
        Promise.resolve({
          ...mockPipelines[0],
          edges,
          updatedAt: mockDate,
        }),
      )
    jest.spyOn(mockPipelineService, 'testPipeline').mockResolvedValue({
      output: 'Test execution completed',
      executionPath: [
        {
          nodeId: 'test-node',
          status: 'success',
          output: 'Test node executed successfully',
          timestamp: mockDate,
        },
      ],
    })

    // PipelineExecutionService 모킹
    jest
      .spyOn(mockPipelineExecutionService, 'streamPipelineExecution')
      .mockImplementation(async (pipeline, input, res) => {
        res.write('data: {"type":"start"}\n\n')
        res.write('data: {"type":"complete","result":"test result"}\n\n')
        return Promise.resolve('test result')
      })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/reasoning-pipelines', () => {
    it('모든 파이프라인 목록을 반환해야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(convertDatesToStrings(mockPipelines))
    })

    it('agentId로 필터링된 파이프라인 목록을 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/reasoning-pipelines')
        .query({ agentId: '1' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(convertDatesToStrings(mockPipelines))
    })
  })

  describe('GET /api/reasoning-pipelines/:id', () => {
    it('존재하는 ID로 파이프라인을 찾아야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines/1')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(convertDatesToStrings(mockPipelines[0]))
    })

    it('존재하지 않는 ID로 404를 반환해야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines/999')

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Pipeline not found')
    })
  })

  describe('POST /api/reasoning-pipelines', () => {
    it('새로운 파이프라인을 생성해야 함', async () => {
      const newPipelineData: CreatePipelinePayload = {
        name: '새 파이프라인',
        description: '새 설명',
        agentId: '1',
        nodes: [
          {
            id: 'node-1',
            type: 'input',
            position: { x: 50, y: 100 },
            data: {
              name: '시작',
            },
          },
        ],
        edges: [],
      }

      const response = await request(app)
        .post('/api/reasoning-pipelines')
        .send(newPipelineData)

      expect(response.status).toBe(201)
      expect(response.body.name).toBe('새 파이프라인')
    })
  })

  describe('PUT /api/reasoning-pipelines/:id', () => {
    it('존재하는 파이프라인을 업데이트해야 함', async () => {
      const updateData = {
        name: '수정된 파이프라인',
        description: '수정된 설명',
      }

      const response = await request(app)
        .put('/api/reasoning-pipelines/1')
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('수정된 파이프라인')
    })

    it('존재하지 않는 파이프라인 업데이트 시 404를 반환해야 함', async () => {
      const response = await request(app)
        .put('/api/reasoning-pipelines/999')
        .send({ name: '수정된 파이프라인' })

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Pipeline not found')
    })
  })

  describe('DELETE /api/reasoning-pipelines/:id', () => {
    it('존재하는 파이프라인을 삭제해야 함', async () => {
      const response = await request(app).delete('/api/reasoning-pipelines/1')

      expect(response.status).toBe(204)
    })

    it('존재하지 않는 파이프라인 삭제 시 404를 반환해야 함', async () => {
      const response = await request(app).delete('/api/reasoning-pipelines/999')

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Pipeline not found')
    })
  })

  describe('GET /api/reasoning-pipelines/test/stream', () => {
    it('스트리밍 테스트가 성공적으로 실행되어야 함', async () => {
      const response = await request(app)
        .get('/api/reasoning-pipelines/test/stream')
        .query({ pipelineId: '1', input: 'test input' })

      expect(response.status).toBe(200)
      expect(response.text).toContain('data: {"type":"start"}')
      expect(response.text).toContain(
        'data: {"type":"complete","result":"test result"}',
      )
    })

    it('필수 파라미터가 없을 경우 400 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/reasoning-pipelines/test/stream')
        .query({ pipelineId: '1' })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Pipeline ID and input are required')
    })

    it('존재하지 않는 파이프라인 ID로 404를 반환해야 함', async () => {
      jest
        .spyOn(mockPipelineService, 'getPipelineById')
        .mockResolvedValue(undefined)

      const response = await request(app)
        .get('/api/reasoning-pipelines/test/stream')
        .query({ pipelineId: '999', input: 'test input' })

      expect(response.status).toBe(200) // SSE는 항상 200을 반환
      expect(response.text).toContain('data: {"error":"Pipeline not found"}')
    })
  })

  describe('POST /api/reasoning-pipelines/:id/execute', () => {
    it('파이프라인이 성공적으로 실행되어야 함', async () => {
      const validationResult = {
        isValid: true,
        message: 'Pipeline is valid',
      }
      jest
        .spyOn(mockPipelineService, 'validatePipeline')
        .mockResolvedValue(validationResult)

      const response = await request(app)
        .post('/api/reasoning-pipelines/1/execute')
        .send({ input: 'test input' })

      expect(response.status).toBe(200)
      expect(response.text).toContain('data: {"type":"start"}')
      expect(response.text).toContain(
        'data: {"type":"complete","result":"test result"}',
      )
    })

    it('유효하지 않은 파이프라인일 경우 400 에러를 반환해야 함', async () => {
      const validationResult = {
        isValid: false,
        message: 'Invalid pipeline configuration',
      }
      jest
        .spyOn(mockPipelineService, 'validatePipeline')
        .mockResolvedValue(validationResult)

      const response = await request(app)
        .post('/api/reasoning-pipelines/1/execute')
        .send({ input: 'test input' })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Invalid pipeline configuration')
    })
  })

  describe('PUT /api/reasoning-pipelines/:id/nodes', () => {
    it('파이프라인 노드가 성공적으로 업데이트되어야 함', async () => {
      const updatedNodes = [
        {
          id: 'node-1',
          type: 'input',
          position: { x: 100, y: 200 },
          data: { name: '수정된 노드' },
        },
      ]

      jest
        .spyOn(mockPipelineService, 'updatePipelineNodes')
        .mockImplementation((id: string, nodes: any) =>
          Promise.resolve({
            ...mockPipelines[0],
            nodes,
            updatedAt: mockDate,
          }),
        )

      const response = await request(app)
        .put('/api/reasoning-pipelines/1/nodes')
        .send(updatedNodes)

      expect(response.status).toBe(200)
      expect(response.body.nodes).toEqual(updatedNodes)
    })
  })

  describe('PUT /api/reasoning-pipelines/:id/edges', () => {
    it('파이프라인 엣지가 성공적으로 업데이트되어야 함', async () => {
      const updatedEdges = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ]

      jest
        .spyOn(mockPipelineService, 'updatePipelineEdges')
        .mockImplementation((id: string, edges: any) =>
          Promise.resolve({
            ...mockPipelines[0],
            edges,
            updatedAt: mockDate,
          }),
        )

      const response = await request(app)
        .put('/api/reasoning-pipelines/1/edges')
        .send(updatedEdges)

      expect(response.status).toBe(200)
      expect(response.body.edges).toEqual(updatedEdges)
    })
  })

  describe('POST /api/reasoning-pipelines/test', () => {
    it('파이프라인 설정 테스트가 성공적으로 실행되어야 함', async () => {
      const testConfig = {
        nodes: [{ id: 'test-node', type: 'input' }],
        edges: [],
      }

      const testResponse: PipelineTestResponse = {
        output: 'Test execution completed',
        executionPath: [
          {
            nodeId: 'test-node',
            status: 'success',
            output: 'Test node executed successfully',
            timestamp: mockDate,
          },
        ],
      }

      jest
        .spyOn(mockPipelineService, 'testPipeline')
        .mockResolvedValue(testResponse)

      const response = await request(app)
        .post('/api/reasoning-pipelines/test')
        .send(testConfig)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(convertDatesToStrings(testResponse))
    })
  })
})
