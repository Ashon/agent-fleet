import { ConnectorService } from '../connector'
import { mockConnectors } from '../../mocks/connectors'
import { Connector, ConnectorStatus } from '@agentfleet/types'

describe('ConnectorService', () => {
  let connectorService: ConnectorService
  let testConnector: Connector

  beforeEach(() => {
    connectorService = new ConnectorService()
    testConnector = mockConnectors[0]
  })

  describe('getAllConnectors', () => {
    it('모든 커넥터를 반환해야 합니다', async () => {
      const connectors = await connectorService.getAllConnectors()
      expect(connectors).toEqual(mockConnectors)
    })

    it('반환된 배열은 원본과 다른 참조여야 합니다', async () => {
      const connectors = await connectorService.getAllConnectors()
      expect(connectors).not.toBe(mockConnectors)
    })
  })

  describe('getConnectorById', () => {
    it('존재하는 ID로 커넥터를 찾아야 합니다', async () => {
      const connector = await connectorService.getConnectorById(
        testConnector.id
      )
      expect(connector).toEqual(testConnector)
    })

    it('존재하지 않는 ID는 undefined를 반환해야 합니다', async () => {
      const connector = await connectorService.getConnectorById('999')
      expect(connector).toBeUndefined()
    })

    it('빈 ID는 undefined를 반환해야 합니다', async () => {
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
      }

      const createdConnector = await connectorService.createConnector(
        newConnector as unknown as Omit<Connector, 'id' | 'status' | 'lastSync'>
      )
      expect(createdConnector).toMatchObject(newConnector)
      expect(createdConnector.id).toBeDefined()
      expect(createdConnector.status).toBe('active')
      expect(createdConnector.lastSync).toBeNull()
      expect(createdConnector.createdAt).toBeDefined()
      expect(createdConnector.updatedAt).toBeDefined()
    })

    it('필수 필드가 누락된 경우 에러를 발생시켜야 합니다', async () => {
      const invalidConnector = {
        name: 'Test Connector',
        // type, description, category, icon, config가 누락됨
      }

      await expect(
        connectorService.createConnector(
          invalidConnector as unknown as Connector
        )
      ).rejects.toThrow()
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

      const updatedConnector = await connectorService.updateConnector(
        testConnector.id,
        updateData
      )
      expect(updatedConnector).toMatchObject({
        id: testConnector.id,
        ...updateData,
      })
    })

    it('존재하지 않는 커넥터는 undefined를 반환해야 합니다', async () => {
      const updateData = {
        name: 'Updated Connector',
      }

      const updatedConnector = await connectorService.updateConnector(
        '999',
        updateData
      )
      expect(updatedConnector).toBeUndefined()
    })

    it('ID는 변경할 수 없어야 합니다', async () => {
      const updateData = {
        id: 'new-id',
      }

      const updatedConnector = await connectorService.updateConnector(
        testConnector.id,
        updateData
      )
      expect(updatedConnector?.id).toBe(testConnector.id)
    })
  })

  describe('deleteConnector', () => {
    it('존재하는 커넥터를 삭제해야 합니다', async () => {
      const result = await connectorService.deleteConnector(testConnector.id)
      expect(result).toBe(true)

      const deletedConnector = await connectorService.getConnectorById(
        testConnector.id
      )
      expect(deletedConnector).toBeUndefined()
    })

    it('존재하지 않는 커넥터 삭제는 false를 반환해야 합니다', async () => {
      const result = await connectorService.deleteConnector('999')
      expect(result).toBe(false)
    })
  })

  describe('updateConnectorStatus', () => {
    it('커넥터 상태를 업데이트해야 합니다', async () => {
      const updatedConnector = await connectorService.updateConnectorStatus(
        testConnector.id,
        'inactive'
      )
      expect(updatedConnector?.status).toBe('inactive')
    })

    it('유효하지 않은 상태는 에러를 발생시켜야 합니다', async () => {
      await expect(
        connectorService.updateConnectorStatus(
          testConnector.id,
          'invalid' as ConnectorStatus
        )
      ).rejects.toThrow()
    })
  })

  describe('updateLastSync', () => {
    it('마지막 동기화 시간을 업데이트해야 합니다', async () => {
      const updatedConnector = await connectorService.updateLastSync(
        testConnector.id
      )
      expect(updatedConnector?.lastSync).toBeDefined()
      expect(
        new Date(updatedConnector?.lastSync || '').getTime()
      ).toBeLessThanOrEqual(Date.now())
    })

    it('존재하지 않는 커넥터는 undefined를 반환해야 합니다', async () => {
      const updatedConnector = await connectorService.updateLastSync('999')
      expect(updatedConnector).toBeUndefined()
    })
  })

  describe('testConnector', () => {
    it('존재하는 커넥터를 테스트해야 합니다', async () => {
      const result = await connectorService.testConnector(testConnector.id)
      expect(result.success).toBe(true)
      expect(result.message).toBe('커넥터 테스트 성공')
    })

    it('존재하지 않는 커넥터는 실패를 반환해야 합니다', async () => {
      const result = await connectorService.testConnector('999')
      expect(result.success).toBe(false)
      expect(result.message).toBe('커넥터를 찾을 수 없습니다.')
    })
  })
})
