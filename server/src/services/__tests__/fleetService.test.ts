import { CreateFleetData, Fleet } from '@agentfleet/types'
import { FleetService } from '../fleetService'

describe('FleetService', () => {
  let fleetService: FleetService
  const mockDate = '2024-01-01T00:00:00.000Z'

  // 테스트용 초기 데이터
  const initialFleets: Fleet[] = [
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
    // 각 테스트 전에 새로운 FleetService 인스턴스 생성
    fleetService = new FleetService(initialFleets)
    // Date 모킹
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
    it('모든 플릿 목록을 반환해야 함', () => {
      const result = fleetService.getAllFleets()
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('테스트 플릿 1')
    })
  })

  describe('getFleetById', () => {
    it('존재하는 ID로 플릿을 찾아야 함', () => {
      const result = fleetService.getFleetById('1')
      expect(result).toBeDefined()
      expect(result?.name).toBe('테스트 플릿 1')
    })

    it('존재하지 않는 ID로 undefined를 반환해야 함', () => {
      const result = fleetService.getFleetById('999')
      expect(result).toBeUndefined()
    })
  })

  describe('createFleet', () => {
    it('새로운 플릿을 생성해야 함', () => {
      const newFleetData: CreateFleetData = {
        name: '새 플릿',
        description: '새 설명',
        agents: [],
      }

      const result = fleetService.createFleet(newFleetData)

      expect(result).toEqual({
        id: '3',
        name: '새 플릿',
        description: '새 설명',
        status: 'active',
        agents: [],
        createdAt: mockDate,
        updatedAt: mockDate,
      })
      expect(fleetService.getAllFleets()).toHaveLength(3)
    })
  })

  describe('updateFleet', () => {
    it('존재하는 플릿을 업데이트해야 함', () => {
      const updateData = {
        name: '수정된 플릿',
        description: '수정된 설명',
      }

      const result = fleetService.updateFleet('1', updateData)

      expect(result).toBeDefined()
      expect(result?.name).toBe('수정된 플릿')
      expect(result?.description).toBe('수정된 설명')
      expect(result?.updatedAt).toBe(mockDate)
    })

    it('존재하지 않는 플릿 업데이트 시 undefined를 반환해야 함', () => {
      const result = fleetService.updateFleet('999', { name: '수정된 플릿' })
      expect(result).toBeUndefined()
    })
  })

  describe('deleteFleet', () => {
    it('존재하는 플릿을 삭제해야 함', () => {
      const result = fleetService.deleteFleet('1')

      expect(result).toBe(true)
      expect(fleetService.getAllFleets()).toHaveLength(1)
      expect(fleetService.getFleetById('1')).toBeUndefined()
    })

    it('존재하지 않는 플릿 삭제 시 false를 반환해야 함', () => {
      const result = fleetService.deleteFleet('999')
      expect(result).toBe(false)
      expect(fleetService.getAllFleets()).toHaveLength(2)
    })
  })
})
