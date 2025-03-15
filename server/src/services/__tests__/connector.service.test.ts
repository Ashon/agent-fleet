import { Connector, ConnectorStatus } from '@agentfleet/types'
import { S3RepositoryDriver } from '../../drivers/s3RepositoryDriver'
import { mockConnectors } from '../../mocks/connectors'
import { ConnectorRepository } from '../../repositories/connector.repository'
import { ConnectorService } from '../connector.service'

jest.mock('../../repositories/connector.repository')

describe('ConnectorService', () => {
  let connectorService: ConnectorService
  let testConnector: Connector
  let mockRepository: jest.Mocked<ConnectorRepository>

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      driver: {} as S3RepositoryDriver,
      entityName: 'connectors',
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ConnectorRepository>

    connectorService = new ConnectorService(mockRepository)
    testConnector = { ...mockConnectors[0] }
  })

  describe('getAllConnectors', () => {
    it('모든 커넥터를 반환해야 합니다', async () => {
      mockRepository.findAll.mockResolvedValue([...mockConnectors])
      const connectors = await connectorService.getAllConnectors()
      expect(connectors).toEqual(mockConnectors)
    })

    it('반환된 배열은 원본과 다른 참조여야 합니다', async () => {
      mockRepository.findAll.mockResolvedValue([...mockConnectors])
      const connectors = await connectorService.getAllConnectors()
      expect(connectors).not.toBe(mockConnectors)
    })
  })

  describe('getConnectorById', () => {
    it('존재하는 ID로 커넥터를 찾아야 합니다', async () => {
      mockRepository.findById.mockResolvedValue({ ...testConnector })
      const connector = await connectorService.getConnectorById(
        testConnector.id,
      )
      expect(connector).toEqual(testConnector)
    })

    it('존재하지 않는 ID는 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const connector = await connectorService.getConnectorById('999')
      expect(connector).toBeUndefined()
    })

    it('빈 ID는 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const connector = await connectorService.getConnectorById('')
      expect(connector).toBeUndefined()
    })
  })

  describe('createConnector', () => {
    it('새로운 커넥터를 생성해야 합니다', async () => {
      const newConnector = {
        name: 'Test Connector',
        type: 'input' as const,
        description: '테스트용 Slack 커넥터',
        category: 'communication' as const,
        icon: 'slack',
        config: {
          token: 'test-token',
          channel: 'test-channel',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const expectedConnector: Connector = {
        ...newConnector,
        id: 'test-id',
        status: 'active',
        lastSync: null,
      }

      mockRepository.create.mockResolvedValue(expectedConnector)

      const createdConnector =
        await connectorService.createConnector(newConnector)
      expect(createdConnector).toMatchObject({
        ...newConnector,
        id: expect.any(String),
        status: 'active',
        lastSync: null,
      })
    })

    it('필수 필드가 누락된 경우 에러를 발생시켜야 합니다', async () => {
      const invalidConnector = {
        name: 'Test Connector',
        // type, description, category, icon, config가 누락됨
      }

      await expect(
        connectorService.createConnector(
          invalidConnector as unknown as Omit<
            Connector,
            'id' | 'status' | 'lastSync'
          >,
        ),
      ).rejects.toThrow()
    })

    it('존재하지 않는 커넥터는 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await connectorService.updateConnector('999', {
        name: '수정된 커넥터',
      })
      expect(result).toBeUndefined()
    })
  })

  describe('updateConnector', () => {
    it('존재하는 커넥터를 업데이트해야 합니다', async () => {
      const updateData = {
        name: 'Updated Connector',
        config: {
          token: 'updated-token',
        },
      }

      const updatedConnector = {
        ...testConnector,
        ...updateData,
      }

      mockRepository.findById.mockResolvedValue(testConnector)
      mockRepository.save.mockResolvedValue(updatedConnector)

      const result = await connectorService.updateConnector(
        testConnector.id,
        updateData,
      )
      expect(result).toMatchObject(updatedConnector)
    })

    it('존재하지 않는 커넥터는 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await connectorService.updateConnector('999', {
        name: '수정된 커넥터',
      })
      expect(result).toBeUndefined()
    })

    it('ID는 변경할 수 없어야 합니다', async () => {
      const updateData = {
        id: 'new-id',
      }

      const updatedConnector = {
        ...testConnector,
        id: testConnector.id,
      }

      mockRepository.findById.mockResolvedValue(testConnector)
      mockRepository.save.mockResolvedValue(updatedConnector)

      const result = await connectorService.updateConnector(
        testConnector.id,
        updateData,
      )
      expect(result?.id).toBe(testConnector.id)
    })
  })

  describe('deleteConnector', () => {
    it('존재하는 커넥터를 삭제해야 합니다', async () => {
      mockRepository.delete.mockResolvedValue(undefined)

      const result = await connectorService.deleteConnector(testConnector.id)
      expect(result).toBe(true)
      expect(mockRepository.delete).toHaveBeenCalledWith(testConnector.id)
    })

    it('존재하지 않는 커넥터 삭제는 false를 반환해야 합니다', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Entity not found'))

      const result = await connectorService.deleteConnector('999')
      expect(result).toBe(false)
      expect(mockRepository.delete).toHaveBeenCalledWith('999')
    })
  })

  describe('updateConnectorStatus', () => {
    it('커넥터 상태를 업데이트해야 합니다', async () => {
      const updatedConnector = {
        ...testConnector,
        status: 'inactive' as ConnectorStatus,
      }

      mockRepository.findById.mockResolvedValue(testConnector)
      mockRepository.save.mockResolvedValue(updatedConnector)

      const result = await connectorService.updateConnectorStatus(
        testConnector.id,
        'inactive',
      )
      expect(result?.status).toBe('inactive')
    })

    it('유효하지 않은 상태는 에러를 발생시켜야 합니다', async () => {
      await expect(
        connectorService.updateConnectorStatus(
          testConnector.id,
          'invalid' as ConnectorStatus,
        ),
      ).rejects.toThrow()
    })
  })

  describe('updateLastSync', () => {
    it('마지막 동기화 시간을 업데이트해야 합니다', async () => {
      const now = new Date()
      const updatedConnector = {
        ...testConnector,
        lastSync: now,
      }

      mockRepository.findById.mockResolvedValue(testConnector)
      mockRepository.save.mockResolvedValue(updatedConnector)

      const result = await connectorService.updateLastSync(testConnector.id)
      expect(result?.lastSync).toBeDefined()
      expect(new Date(result?.lastSync || '')).toBeInstanceOf(Date)
    })

    it('존재하지 않는 커넥터는 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await connectorService.updateLastSync('999')
      expect(result).toBeUndefined()
    })
  })

  describe('testConnector', () => {
    it('존재하는 커넥터를 테스트해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(testConnector)
      const result = await connectorService.testConnector(testConnector.id)
      expect(result.success).toBe(true)
      expect(result.message).toBe('커넥터 테스트 성공')
    })

    it('존재하지 않는 커넥터는 실패를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await connectorService.testConnector('999')
      expect(result.success).toBe(false)
      expect(result.message).toBe('커넥터를 찾을 수 없습니다.')
    })
  })
})
