import { CreateFleetData, Fleet } from '@agentfleet/types'
import { S3RepositoryDriver } from '../../drivers/s3RepositoryDriver'
import { FleetRepository } from '../../repositories/fleetRepository'
import { FleetService } from '../fleetService'

jest.mock('../../repositories/fleetRepository')

describe('FleetService', () => {
  let fleetService: FleetService
  let mockRepository: jest.Mocked<FleetRepository>
  const mockDate = '2024-01-01T00:00:00.000Z'

  const testFleet: Fleet = {
    id: '1',
    name: '테스트 플릿 1',
    description: '테스트 설명 1',
    status: 'active',
    agents: [],
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      driver: {} as S3RepositoryDriver,
      entityName: 'fleets',
    } as unknown as jest.Mocked<FleetRepository>

    fleetService = new FleetService(mockRepository)

    jest.spyOn(global, 'Date').mockImplementation(
      () =>
        ({
          toISOString: () => mockDate,
        }) as unknown as Date,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getAllFleets', () => {
    it('모든 플릿 목록을 반환해야 함', async () => {
      mockRepository.findAll.mockResolvedValue([testFleet])
      const result = await fleetService.getAllFleets()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('테스트 플릿 1')
    })
  })

  describe('getFleetById', () => {
    it('존재하는 ID로 플릿을 찾아야 함', async () => {
      mockRepository.findById.mockResolvedValue(testFleet)
      const result = await fleetService.getFleetById('1')
      expect(result).toBeDefined()
      expect(result?.name).toBe('테스트 플릿 1')
    })

    it('존재하지 않는 ID로 undefined를 반환해야 함', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await fleetService.getFleetById('999')
      expect(result).toBeUndefined()
    })
  })

  describe('createFleet', () => {
    it('새로운 플릿을 생성해야 함', async () => {
      const newFleetData: CreateFleetData = {
        name: '새 플릿',
        description: '새 설명',
        agents: [],
      }

      const expectedFleet: Fleet = {
        id: expect.any(String),
        name: '새 플릿',
        description: '새 설명',
        status: 'active',
        agents: [],
        createdAt: mockDate,
        updatedAt: mockDate,
      }

      mockRepository.create.mockResolvedValue(expectedFleet)
      const result = await fleetService.createFleet(newFleetData)
      expect(result).toEqual(expectedFleet)
      expect(mockRepository.create).toHaveBeenCalled()
    })
  })

  describe('updateFleet', () => {
    it('존재하는 플릿을 업데이트해야 함', async () => {
      const updateData = {
        name: '수정된 플릿',
        description: '수정된 설명',
      }

      mockRepository.findById.mockResolvedValue(testFleet)
      const updatedFleet = { ...testFleet, ...updateData, updatedAt: mockDate }
      mockRepository.save.mockResolvedValue(updatedFleet)

      const result = await fleetService.updateFleet('1', updateData)
      expect(result).toBeDefined()
      expect(result?.name).toBe('수정된 플릿')
      expect(result?.description).toBe('수정된 설명')
      expect(result?.updatedAt).toBe(mockDate)
    })

    it('존재하지 않는 플릿 업데이트 시 undefined를 반환해야 함', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await fleetService.updateFleet('999', {
        name: '수정된 플릿',
      })
      expect(result).toBeUndefined()
    })
  })

  describe('deleteFleet', () => {
    it('존재하는 플릿을 삭제해야 함', async () => {
      mockRepository.delete.mockResolvedValue(undefined)

      const result = await fleetService.deleteFleet('1')
      expect(result).toBe(true)
      expect(mockRepository.delete).toHaveBeenCalledWith('1')
    })

    it('존재하지 않는 플릿 삭제 시 false를 반환해야 함', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Entity not found'))

      const result = await fleetService.deleteFleet('999')
      expect(result).toBe(false)
      expect(mockRepository.delete).toHaveBeenCalledWith('999')
    })
  })
})
