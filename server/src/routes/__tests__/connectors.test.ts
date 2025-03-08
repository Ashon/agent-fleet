import {
  Connector,
  ConnectorType,
  CreateConnectorData,
} from '@agentfleet/types'
import express from 'express'
import request from 'supertest'
import { ConnectorService } from '../../services/connector'
import connectorRoutes from '../connectors'

jest.mock('../../services/connector')

describe('Connector Routes', () => {
  let app: express.Application
  const mockDate = new Date('2024-01-01T00:00:00.000Z')

  const mockConnectors: Connector[] = [
    {
      id: '1',
      name: '테스트 커넥터 1',
      description: '테스트 설명 1',
      type: 'input',
      category: 'communication',
      icon: 'slack',
      config: {
        webhookUrl: 'https://hooks.slack.com/services/xxx',
      },
      status: 'active',
      lastSync: null,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      id: '2',
      name: '테스트 커넥터 2',
      description: '테스트 설명 2',
      type: 'action',
      category: 'communication',
      icon: 'discord',
      config: {
        webhookUrl: 'https://discord.com/api/webhooks/xxx',
      },
      status: 'active',
      lastSync: null,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ]

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/connectors', connectorRoutes)

    const mockConnectorService = ConnectorService as jest.MockedClass<
      typeof ConnectorService
    >

    // 모든 메서드가 Promise를 반환하도록 수정
    mockConnectorService.prototype.getAllConnectors.mockResolvedValue(
      mockConnectors,
    )

    mockConnectorService.prototype.getConnectorById.mockImplementation(
      (id: string) => Promise.resolve(mockConnectors.find((c) => c.id === id)),
    )

    mockConnectorService.prototype.createConnector.mockImplementation(
      (data: CreateConnectorData) =>
        Promise.resolve({
          id: '3',
          ...data,
          status: 'active',
          lastSync: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        }),
    )

    mockConnectorService.prototype.updateConnector.mockImplementation(
      (id: string, data: Partial<CreateConnectorData>) => {
        const connector = mockConnectors.find((c) => c.id === id)
        if (!connector) return Promise.resolve(undefined)
        return Promise.resolve({
          ...connector,
          ...data,
          updatedAt: mockDate,
        })
      },
    )

    mockConnectorService.prototype.deleteConnector.mockImplementation(
      (id: string) => Promise.resolve(mockConnectors.some((c) => c.id === id)),
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/connectors', () => {
    it('모든 커넥터 목록을 반환해야 함', async () => {
      const response = await request(app).get('/api/connectors')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('테스트 커넥터 1')
    })
  })

  describe('GET /api/connectors/:id', () => {
    it('존재하는 ID로 커넥터를 찾아야 함', async () => {
      const response = await request(app).get('/api/connectors/1')

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('테스트 커넥터 1')
      expect(response.body.type).toBe('input')
      expect(response.body.category).toBe('communication')
    })

    it('존재하지 않는 ID로 404를 반환해야 함', async () => {
      const response = await request(app).get('/api/connectors/999')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Connector not found')
    })
  })

  describe('POST /api/connectors', () => {
    it('새로운 커넥터를 생성해야 함', async () => {
      const newConnectorData: CreateConnectorData = {
        name: '새 커넥터',
        description: '새 설명',
        type: 'input',
        category: 'communication',
        icon: 'slack',
        config: {
          webhookUrl: 'https://hooks.slack.com/services/xxx',
        },
      }

      const response = await request(app)
        .post('/api/connectors')
        .send(newConnectorData)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: '새 커넥터',
        type: 'input',
        category: 'communication',
        status: 'active',
      })
    })
  })

  describe('PUT /api/connectors/:id', () => {
    it('존재하는 커넥터를 업데이트해야 함', async () => {
      const updateData = {
        name: '수정된 커넥터',
        description: '수정된 설명',
        config: {
          webhookUrl: 'https://hooks.slack.com/services/yyy',
        },
      }

      const response = await request(app)
        .put('/api/connectors/1')
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('수정된 커넥터')
      expect(response.body.config.webhookUrl).toBe(
        'https://hooks.slack.com/services/yyy',
      )
    })

    it('존재하지 않는 커넥터 업데이트 시 404를 반환해야 함', async () => {
      const response = await request(app)
        .put('/api/connectors/999')
        .send({ name: '수정된 커넥터' })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Connector not found')
    })
  })

  describe('DELETE /api/connectors/:id', () => {
    it('존재하는 커넥터를 삭제해야 함', async () => {
      const response = await request(app).delete('/api/connectors/1')

      expect(response.status).toBe(204)
    })

    it('존재하지 않는 커넥터 삭제 시 404를 반환해야 함', async () => {
      const response = await request(app).delete('/api/connectors/999')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Connector not found')
    })
  })
})
