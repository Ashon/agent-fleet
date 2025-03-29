import { Agent, CreateAgentData } from '@agentfleet/types'
import express from 'express'
import request from 'supertest'
import { agentService } from '..'
import { errorHandler } from '../../middleware/errorHandler'
import { AgentService } from '../../services/agent.service'
import { createAgentsRouter } from '../agents.routes'

jest.mock('../../services/agent.service')

describe('Agent Routes', () => {
  let app: express.Application
  const mockDate = new Date('2024-01-01T00:00:00.000Z').toISOString()

  const mockAgents: Agent[] = [
    {
      id: '1',
      name: '테스트 에이전트 1',
      description: '테스트 설명 1',
      status: 'active',
      createdAt: mockDate,
      updatedAt: mockDate,
      chatHistory: [],
      tools: [],
    },
    {
      id: '2',
      name: '테스트 에이전트 2',
      description: '테스트 설명 2',
      status: 'active',
      createdAt: mockDate,
      updatedAt: mockDate,
      chatHistory: [],
      tools: [],
    },
  ]

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/agents', createAgentsRouter(agentService))
    app.use(errorHandler)

    const mockAgentService = AgentService as jest.MockedClass<
      typeof AgentService
    >

    mockAgentService.prototype.getAllAgents.mockResolvedValue(mockAgents)
    mockAgentService.prototype.getAgentById.mockImplementation((id: string) =>
      Promise.resolve(mockAgents.find((a) => a.id === id)),
    )
    mockAgentService.prototype.createAgent.mockImplementation(
      (data: CreateAgentData) =>
        Promise.resolve({
          id: '3',
          ...data,
          status: 'active',
          createdAt: mockDate,
          updatedAt: mockDate,
          chatHistory: [],
          tools: [],
        }),
    )
    mockAgentService.prototype.updateAgent.mockImplementation(
      (id: string, data: Partial<CreateAgentData>) => {
        const agent = mockAgents.find((a) => a.id === id)
        if (!agent) return Promise.resolve(undefined)
        return Promise.resolve({
          ...agent,
          ...data,
          updatedAt: mockDate,
        })
      },
    )
    mockAgentService.prototype.deleteAgent.mockImplementation((id: string) =>
      Promise.resolve(mockAgents.some((a) => a.id === id)),
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/agents', () => {
    it('모든 에이전트 목록을 반환해야 함', async () => {
      const response = await request(app).get('/api/agents')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('테스트 에이전트 1')
    })
  })

  describe('GET /api/agents/:id', () => {
    it('존재하는 ID로 에이전트를 찾아야 함', async () => {
      const response = await request(app).get('/api/agents/1')

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('테스트 에이전트 1')
    })

    it('존재하지 않는 ID로 404를 반환해야 함', async () => {
      const response = await request(app).get('/api/agents/999')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Agent not found')
    })
  })

  describe('POST /api/agents', () => {
    it('새로운 에이전트를 생성해야 함', async () => {
      const newAgentData: CreateAgentData = {
        name: '새 에이전트',
        description: '새 설명',
      }

      const response = await request(app).post('/api/agents').send(newAgentData)

      expect(response.status).toBe(201)
      expect(response.body.name).toBe('새 에이전트')
    })

    it('필수 필드가 누락된 경우 400을 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/agents')
        .send({ name: '새 에이전트' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(
        'Name and description are required fields',
      )
    })
  })

  describe('PUT /api/agents/:id', () => {
    it('존재하는 에이전트를 업데이트해야 함', async () => {
      const updateData = {
        name: '수정된 에이전트',
        description: '수정된 설명',
      }

      const response = await request(app).put('/api/agents/1').send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('수정된 에이전트')
    })

    it('존재하지 않는 에이전트 업데이트 시 404를 반환해야 함', async () => {
      const response = await request(app).put('/api/agents/999').send({
        name: '수정된 에이전트',
        description: '수정된 설명',
      })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Agent not found')
    })

    it('필수 필드가 누락된 경우 400을 반환해야 함', async () => {
      const response = await request(app)
        .put('/api/agents/1')
        .send({ name: '수정된 에이전트' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(
        'Name and description are required fields',
      )
    })
  })

  describe('DELETE /api/agents/:id', () => {
    it('존재하는 에이전트를 삭제해야 함', async () => {
      const response = await request(app).delete('/api/agents/1')

      expect(response.status).toBe(204)
    })

    it('존재하지 않는 에이전트 삭제 시 404를 반환해야 함', async () => {
      const response = await request(app).delete('/api/agents/999')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Agent not found')
    })
  })
})
