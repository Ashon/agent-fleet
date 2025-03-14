import { CreatePipelinePayload, Pipeline } from '@agentfleet/types'
import express from 'express'
import request from 'supertest'
import { errorHandler } from '../../middleware/errorHandler'
import { PipelineService } from '../../services/agentReasoningPipeline'
import { PipelineExecutionService } from '../../services/pipelineExecutionService'
import pipelineRoutes from '../agentReasoningPipelines'

jest.mock('../../services/agentReasoningPipeline')
jest.mock('../../services/pipelineExecutionService')

describe('Pipeline Routes', () => {
  let app: express.Application
  const mockDate = new Date('2024-01-01T00:00:00.000Z')

  const mockPipelines: Pipeline[] = [
    {
      id: '1',
      agentId: 'agent-1',
      name: '테스트 파이프라인 1',
      description: '테스트 설명 1',
      nodes: [],
      edges: [],
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      id: '2',
      agentId: 'agent-2',
      name: '테스트 파이프라인 2',
      description: '테스트 설명 2',
      nodes: [],
      edges: [],
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ]

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/reasoning-pipelines', pipelineRoutes)
    app.use(errorHandler)

    const mockPipelineService = PipelineService as jest.MockedClass<
      typeof PipelineService
    >
    const mockPipelineExecutionService =
      PipelineExecutionService as jest.MockedClass<
        typeof PipelineExecutionService
      >

    mockPipelineService.prototype.getAllPipelines.mockImplementation(
      (filter?: { agentId?: string }) => {
        if (filter?.agentId) {
          return Promise.resolve(
            mockPipelines.filter((p) => p.agentId === filter.agentId),
          )
        }
        return Promise.resolve(mockPipelines)
      },
    )
    mockPipelineService.prototype.getPipelineById.mockImplementation(
      (id: string) => Promise.resolve(mockPipelines.find((p) => p.id === id)),
    )
    mockPipelineService.prototype.createPipeline.mockImplementation(
      (data: CreatePipelinePayload) =>
        Promise.resolve({
          id: '3',
          ...data,
          createdAt: mockDate,
          updatedAt: mockDate,
        }),
    )
    mockPipelineService.prototype.updatePipeline.mockImplementation(
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
    mockPipelineService.prototype.deletePipeline.mockImplementation(
      (id: string) => Promise.resolve(mockPipelines.some((p) => p.id === id)),
    )
    mockPipelineService.prototype.validatePipeline.mockResolvedValue({
      isValid: true,
    })
    mockPipelineService.prototype.updatePipelineNodes.mockImplementation(
      (id: string, nodes: any[]) => {
        const pipeline = mockPipelines.find((p) => p.id === id)
        if (!pipeline) return Promise.resolve(undefined)
        return Promise.resolve({
          ...pipeline,
          nodes,
          updatedAt: mockDate,
        })
      },
    )
    mockPipelineService.prototype.updatePipelineEdges.mockImplementation(
      (id: string, edges: any[]) => {
        const pipeline = mockPipelines.find((p) => p.id === id)
        if (!pipeline) return Promise.resolve(undefined)
        return Promise.resolve({
          ...pipeline,
          edges,
          updatedAt: mockDate,
        })
      },
    )
    mockPipelineService.prototype.testPipeline.mockResolvedValue({
      output: '테스트 성공',
      executionPath: [
        {
          nodeId: 'node-1',
          status: 'success',
          output: '테스트 결과',
          timestamp: mockDate,
        },
      ],
    })
    mockPipelineExecutionService.prototype.streamPipelineExecution.mockImplementation(
      (pipeline, input, res) => {
        if (!pipeline) {
          res.write(
            `data: ${JSON.stringify({ error: 'Pipeline not found' })}\n\n`,
          )
          return Promise.resolve('error')
        }
        res.write(
          `data: ${JSON.stringify({ type: 'success', message: '실행 완료' })}\n\n`,
        )
        return Promise.resolve('success')
      },
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/reasoning-pipelines', () => {
    it('모든 파이프라인 목록을 반환해야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('테스트 파이프라인 1')
    })

    it('agentId로 필터링된 파이프라인 목록을 반환해야 함', async () => {
      const response = await request(app).get(
        '/api/reasoning-pipelines?agentId=agent-1',
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].agentId).toBe('agent-1')
    })
  })

  describe('GET /api/reasoning-pipelines/:id', () => {
    it('존재하는 ID로 파이프라인을 찾아야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines/1')

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('테스트 파이프라인 1')
    })

    it('존재하지 않는 ID로 404를 반환해야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines/999')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Pipeline not found')
    })
  })

  describe('POST /api/reasoning-pipelines', () => {
    it('새로운 파이프라인을 생성해야 함', async () => {
      const newPipelineData: CreatePipelinePayload = {
        name: '새 파이프라인',
        agentId: 'agent-1',
        description: '새 설명',
        nodes: [],
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
        .send({
          name: '수정된 파이프라인',
          description: '수정된 설명',
        })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Pipeline not found')
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
      expect(response.body.error).toBe('Pipeline not found')
    })
  })

  describe('POST /api/reasoning-pipelines/:id/execute', () => {
    it('파이프라인 실행이 성공적으로 시작되어야 함', async () => {
      const response = await request(app)
        .post('/api/reasoning-pipelines/1/execute')
        .send({ input: '테스트 입력' })

      expect(response.status).toBe(200)
    })

    it('존재하지 않는 파이프라인 실행 시 404를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/reasoning-pipelines/999/execute')
        .send({ input: '테스트 입력' })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Pipeline not found')
    })

    it('유효하지 않은 파이프라인 실행 시 400을 반환해야 함', async () => {
      const mockPipelineService = PipelineService as jest.MockedClass<
        typeof PipelineService
      >
      mockPipelineService.prototype.validatePipeline.mockResolvedValueOnce({
        isValid: false,
        message: '유효하지 않은 파이프라인',
      })

      const response = await request(app)
        .post('/api/reasoning-pipelines/1/execute')
        .send({ input: '테스트 입력' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('유효하지 않은 파이프라인')
    })
  })

  describe('PUT /api/reasoning-pipelines/:id/nodes', () => {
    it('파이프라인 노드를 업데이트해야 함', async () => {
      const nodes = [
        {
          id: 'node-1',
          type: 'input',
          position: { x: 100, y: 100 },
          data: {
            name: '입력 노드',
            description: '테스트 입력',
          },
        },
      ]

      const response = await request(app)
        .put('/api/reasoning-pipelines/1/nodes')
        .send(nodes)

      expect(response.status).toBe(200)
      expect(response.body.nodes).toHaveLength(1)
      expect(response.body.nodes[0].id).toBe('node-1')
    })

    it('존재하지 않는 파이프라인의 노드 업데이트 시 404를 반환해야 함', async () => {
      const response = await request(app)
        .put('/api/reasoning-pipelines/999/nodes')
        .send([])

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Pipeline not found')
    })
  })

  describe('PUT /api/reasoning-pipelines/:id/edges', () => {
    it('파이프라인 엣지를 업데이트해야 함', async () => {
      const edges = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
          type: 'default',
        },
      ]

      const response = await request(app)
        .put('/api/reasoning-pipelines/1/edges')
        .send(edges)

      expect(response.status).toBe(200)
      expect(response.body.edges).toHaveLength(1)
      expect(response.body.edges[0].id).toBe('edge-1')
    })

    it('존재하지 않는 파이프라인의 엣지 업데이트 시 404를 반환해야 함', async () => {
      const response = await request(app)
        .put('/api/reasoning-pipelines/999/edges')
        .send([])

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Pipeline not found')
    })
  })

  describe('GET /api/reasoning-pipelines/test/stream', () => {
    it('파이프라인 테스트 스트림이 성공적으로 시작되어야 함', async () => {
      const response = await request(app).get(
        '/api/reasoning-pipelines/test/stream?pipelineId=1&input=테스트 입력',
      )

      expect(response.status).toBe(200)
    })

    it('필수 파라미터가 누락된 경우 400을 반환해야 함', async () => {
      const response = await request(app).get(
        '/api/reasoning-pipelines/test/stream',
      )

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Pipeline ID and input are required')
    })

    it('존재하지 않는 파이프라인 테스트 시 에러를 스트림으로 전송해야 함', async () => {
      const response = await request(app).get(
        '/api/reasoning-pipelines/test/stream?pipelineId=999&input=테스트 입력',
      )

      expect(response.status).toBe(200)
      expect(response.text).toContain('Pipeline not found')
    })
  })

  describe('POST /api/reasoning-pipelines/test', () => {
    it('파이프라인 구성 테스트가 성공적으로 실행되어야 함', async () => {
      const testConfig = {
        name: '테스트 파이프라인',
        agentId: 'agent-1',
        nodes: [
          {
            id: 'node-1',
            type: 'input',
            position: { x: 100, y: 100 },
            data: {
              name: '입력 노드',
              description: '테스트 입력',
            },
          },
        ],
        edges: [],
      }

      const response = await request(app)
        .post('/api/reasoning-pipelines/test')
        .send(testConfig)

      expect(response.status).toBe(200)
    })
  })
})
