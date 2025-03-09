import { CreatePipelinePayload, Pipeline } from '@agentfleet/types'
import express from 'express'
import request from 'supertest'
import { PipelineService } from '../../services/agentReasoningPipeline'
import reasoningPipelinesRouter from '../reasoningPipelines'

jest.mock('../../services/agentReasoningPipeline')

describe('Workflow Routes', () => {
  let app: express.Application
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
    app = express()
    app.use(express.json())
    app.use('/api/reasoning-pipelines', reasoningPipelinesRouter)

    const mockPipelineService = PipelineService as jest.MockedClass<
      typeof PipelineService
    >

    mockPipelineService.prototype.getAllPipelines.mockResolvedValue(
      mockPipelines,
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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/reasoning-pipelines', () => {
    it('모든 파이프라인 목록을 반환해야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('테스트 워크플로우 1')
    })
  })

  describe('GET /api/reasoning-pipelines/:id', () => {
    it('존재하는 ID로 파이프라인을 찾아야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines/1')

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('테스트 워크플로우 1')
    })

    it('존재하지 않는 ID로 404를 반환해야 함', async () => {
      const response = await request(app).get('/api/reasoning-pipelines/999')

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('파이프라인을 찾을 수 없습니다.')
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
      expect(response.body.message).toBe('파이프라인을 찾을 수 없습니다.')
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
      expect(response.body.message).toBe('파이프라인을 찾을 수 없습니다.')
    })
  })
})
