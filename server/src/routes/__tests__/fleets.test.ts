import { CreateFleetData, Fleet } from '@agentfleet/types'
import express from 'express'
import request from 'supertest'
import { FleetService } from '../../services/fleetService'
import fleetRoutes from '../fleets'

// FleetService 모킹
jest.mock('../../services/fleetService')

describe('Fleet Routes', () => {
  let app: express.Application
  const mockDate = '2024-01-01T00:00:00.000Z'

  // 테스트용 초기 데이터
  const mockFleets: Fleet[] = [
    {
      id: '1',
      name: '테스트 플릿 1',
      description: '테스트 설명 1',
      status: 'active',
      agents: [],
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      id: '2',
      name: '테스트 플릿 2',
      description: '테스트 설명 2',
      status: 'active',
      agents: [],
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ]

  beforeEach(() => {
    // Express 앱 설정
    app = express()
    app.use(express.json())
    app.use('/api/fleets', fleetRoutes)

    // FleetService 메서드 모킹
    const mockFleetService = FleetService as jest.MockedClass<
      typeof FleetService
    >
    mockFleetService.prototype.getAllFleets.mockReturnValue(mockFleets)
    mockFleetService.prototype.getFleetById.mockImplementation((id: string) =>
      mockFleets.find((f) => f.id === id),
    )
    mockFleetService.prototype.createFleet.mockImplementation(
      (data: CreateFleetData) => ({
        id: '3',
        name: data.name,
        description: data.description,
        status: 'active',
        agents: data.agents || [],
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
    )
    mockFleetService.prototype.updateFleet.mockImplementation(
      (id: string, data: Partial<CreateFleetData>) => {
        const fleet = mockFleets.find((f) => f.id === id)
        if (!fleet) return undefined
        return {
          ...fleet,
          ...data,
          updatedAt: mockDate,
        }
      },
    )
    mockFleetService.prototype.deleteFleet.mockImplementation((id: string) =>
      mockFleets.some((f) => f.id === id),
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/fleets', () => {
    it('모든 플릿 목록을 반환해야 함', async () => {
      const response = await request(app).get('/api/fleets')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('테스트 플릿 1')
    })
  })

  describe('GET /api/fleets/:id', () => {
    it('존재하는 ID로 플릿을 찾아야 함', async () => {
      const response = await request(app).get('/api/fleets/1')

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('테스트 플릿 1')
    })

    it('존재하지 않는 ID로 404를 반환해야 함', async () => {
      const response = await request(app).get('/api/fleets/999')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Fleet not found')
    })
  })

  describe('POST /api/fleets', () => {
    it('새로운 플릿을 생성해야 함', async () => {
      const newFleetData: CreateFleetData = {
        name: '새 플릿',
        description: '새 설명',
        agents: [],
      }

      const response = await request(app).post('/api/fleets').send(newFleetData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        id: '3',
        name: '새 플릿',
        description: '새 설명',
        status: 'active',
        agents: [],
        createdAt: mockDate,
        updatedAt: mockDate,
      })
    })
  })

  describe('PUT /api/fleets/:id', () => {
    it('존재하는 플릿을 업데이트해야 함', async () => {
      const updateData = {
        name: '수정된 플릿',
        description: '수정된 설명',
      }

      const response = await request(app).put('/api/fleets/1').send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('수정된 플릿')
      expect(response.body.description).toBe('수정된 설명')
    })

    it('존재하지 않는 플릿 업데이트 시 404를 반환해야 함', async () => {
      const response = await request(app)
        .put('/api/fleets/999')
        .send({ name: '수정된 플릿' })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Fleet not found')
    })
  })

  describe('DELETE /api/fleets/:id', () => {
    it('존재하는 플릿을 삭제해야 함', async () => {
      const response = await request(app).delete('/api/fleets/1')

      expect(response.status).toBe(204)
    })

    it('존재하지 않는 플릿 삭제 시 404를 반환해야 함', async () => {
      const response = await request(app).delete('/api/fleets/999')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Fleet not found')
    })
  })
})
