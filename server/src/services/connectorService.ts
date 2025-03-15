import { Connector, ConnectorStatus } from '@agentfleet/types'
import { v4 } from 'uuid'
import { ConnectorRepository } from '../repositories/connectorRepository'

export class ConnectorService {
  private readonly repository: ConnectorRepository

  constructor(repository: ConnectorRepository) {
    this.repository = repository
  }

  async getAllConnectors(): Promise<Connector[]> {
    return await this.repository.findAll()
  }

  async getConnectorById(id: string): Promise<Connector | undefined> {
    const connector = await this.repository.findById(id)
    return connector ?? undefined
  }

  async createConnector(
    connectorData: Omit<Connector, 'id' | 'status' | 'lastSync'>,
  ): Promise<Connector> {
    // 필수 필드 검증
    if (
      !connectorData.name ||
      !connectorData.type ||
      !connectorData.description ||
      !connectorData.category ||
      !connectorData.icon ||
      !connectorData.config
    ) {
      throw new Error('필수 필드가 누락되었습니다.')
    }

    const newConnector = {
      ...connectorData,
      status: 'active' as ConnectorStatus,
      lastSync: null,
    }
    return this.repository.create(newConnector)
  }

  async updateConnector(
    id: string,
    connectorData: Partial<Connector>,
  ): Promise<Connector | undefined> {
    const connector = await this.repository.findById(id)
    if (!connector) return undefined

    const updatedConnector = {
      ...connector,
      ...connectorData,
      id, // ID는 변경 불가
    }

    return this.repository.save(updatedConnector)
  }

  async deleteConnector(id: string): Promise<boolean> {
    try {
      await this.repository.delete(id)
      return true
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return false
      }
      throw error
    }
  }

  async updateConnectorStatus(
    id: string,
    status: ConnectorStatus,
  ): Promise<Connector | undefined> {
    // 유효한 상태인지 검증
    if (status !== 'active' && status !== 'inactive') {
      throw new Error('유효하지 않은 상태입니다.')
    }

    return this.updateConnector(id, { status })
  }

  async updateLastSync(id: string): Promise<Connector | undefined> {
    return this.updateConnector(id, { lastSync: new Date() })
  }

  async testConnector(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const connector = await this.getConnectorById(id)
    if (!connector) {
      return {
        success: false,
        message: '커넥터를 찾을 수 없습니다.',
      }
    }

    try {
      // TODO: 실제 커넥터 테스트 로직 구현
      // 각 커넥터 타입별로 다른 테스트 로직이 필요할 수 있습니다.
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 테스트를 위한 지연

      return {
        success: true,
        message: '커넥터 테스트 성공',
      }
    } catch {
      return {
        success: false,
        message: '커넥터 테스트 실패',
      }
    }
  }
}
