import { CreateWorkflowData, Workflow } from '@agentfleet/types'
import express from 'express'
import request from 'supertest'
import { WorkflowService } from '../../services/agentWorkflow'
import workflowRoutes from '../agentWorkflows'

jest.mock('../../services/agentWorkflow')

describe('Workflow Routes', () => {
  let app: express.Application
  const mockDate = new Date('2024-01-01T00:00:00.000Z')

  const mockWorkflows: Workflow[] = [
    {
      id: '1',
      agentId: '1',
      name: '테스트 워크플로우 1',
      description: '테스트 설명 1',
      nodes: [
        {
          id: 'node-1',
          type: 'start',
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
          type: 'start',
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
    app.use('/api/workflows', workflowRoutes)

    const mockWorkflowService = WorkflowService as jest.MockedClass<
      typeof WorkflowService
    >

    mockWorkflowService.prototype.getAllWorkflows.mockResolvedValue(
      mockWorkflows,
    )

    mockWorkflowService.prototype.getWorkflowById.mockImplementation(
      (id: string) => Promise.resolve(mockWorkflows.find((w) => w.id === id)),
    )
    mockWorkflowService.prototype.createWorkflow.mockImplementation(
      (data: CreateWorkflowData) =>
        Promise.resolve({
          id: '3',
          agentId: '1',
          ...data,
          createdAt: mockDate,
          updatedAt: mockDate,
        }),
    )
    mockWorkflowService.prototype.updateWorkflow.mockImplementation(
      (id: string, data: Partial<CreateWorkflowData>) => {
        const workflow = mockWorkflows.find((w) => w.id === id)
        if (!workflow) return Promise.resolve(undefined)
        return Promise.resolve({
          ...workflow,
          ...data,
          updatedAt: mockDate,
        })
      },
    )
    mockWorkflowService.prototype.deleteWorkflow.mockImplementation(
      (id: string) => Promise.resolve(mockWorkflows.some((w) => w.id === id)),
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/workflows', () => {
    it('모든 워크플로우 목록을 반환해야 함', async () => {
      const response = await request(app).get('/api/workflows')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('테스트 워크플로우 1')
    })
  })

  describe('GET /api/workflows/:id', () => {
    it('존재하는 ID로 워크플로우를 찾아야 함', async () => {
      const response = await request(app).get('/api/workflows/1')

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('테스트 워크플로우 1')
    })

    it('존재하지 않는 ID로 404를 반환해야 함', async () => {
      const response = await request(app).get('/api/workflows/999')

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('워크플로우를 찾을 수 없습니다.')
    })
  })

  describe('POST /api/workflows', () => {
    it('새로운 워크플로우를 생성해야 함', async () => {
      const newWorkflowData: CreateWorkflowData = {
        name: '새 워크플로우',
        description: '새 설명',
        nodes: [
          {
            id: 'node-1',
            type: 'start',
            position: { x: 50, y: 100 },
            data: {
              name: '시작',
            },
          },
        ],
        edges: [],
      }

      const response = await request(app)
        .post('/api/workflows')
        .send(newWorkflowData)

      expect(response.status).toBe(201)
      expect(response.body.name).toBe('새 워크플로우')
    })
  })

  describe('PUT /api/workflows/:id', () => {
    it('존재하는 워크플로우를 업데이트해야 함', async () => {
      const updateData = {
        name: '수정된 워크플로우',
        description: '수정된 설명',
      }

      const response = await request(app)
        .put('/api/workflows/1')
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('수정된 워크플로우')
    })

    it('존재하지 않는 워크플로우 업데이트 시 404를 반환해야 함', async () => {
      const response = await request(app)
        .put('/api/workflows/999')
        .send({ name: '수정된 워크플로우' })

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('워크플로우를 찾을 수 없습니다.')
    })
  })

  describe('DELETE /api/workflows/:id', () => {
    it('존재하는 워크플로우를 삭제해야 함', async () => {
      const response = await request(app).delete('/api/workflows/1')

      expect(response.status).toBe(204)
    })

    it('존재하지 않는 워크플로우 삭제 시 404를 반환해야 함', async () => {
      const response = await request(app).delete('/api/workflows/999')

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('워크플로우를 찾을 수 없습니다.')
    })
  })
})
