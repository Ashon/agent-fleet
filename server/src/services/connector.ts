import { Connector, ConnectorStatus } from '@agentfleet/types'
import { mockConnectors } from '../mocks/connectors'

export class ConnectorService {
  private readonly connectors: Connector[]

  constructor() {
    this.connectors = [...mockConnectors]
  }

  async getAllConnectors(): Promise<Connector[]> {
    return [...this.connectors]
  }

  async getConnectorById(id: string): Promise<Connector | undefined> {
    return this.connectors.find((connector) => connector.id === id)
  }

  async createConnector(
    connectorData: Omit<Connector, 'id' | 'status' | 'lastSync'>
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

    const newConnector: Connector = {
      id: String(this.connectors.length + 1),
      ...connectorData,
      status: 'active',
      lastSync: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.connectors.push(newConnector)
    return newConnector
  }

  async updateConnector(
    id: string,
    connectorData: Partial<Connector>
  ): Promise<Connector | undefined> {
    const index = this.connectors.findIndex((connector) => connector.id === id)
    if (index === -1) return undefined

    this.connectors[index] = {
      ...this.connectors[index],
      ...connectorData,
      id, // ID는 변경 불가
    }
    return this.connectors[index]
  }

  async deleteConnector(id: string): Promise<boolean> {
    const index = this.connectors.findIndex((connector) => connector.id === id)
    if (index === -1) return false

    this.connectors.splice(index, 1)
    return true
  }

  async updateConnectorStatus(
    id: string,
    status: ConnectorStatus
  ): Promise<Connector | undefined> {
    // 유효한 상태인지 검증
    if (status !== 'active' && status !== 'inactive') {
      throw new Error('유효하지 않은 상태입니다.')
    }

    const index = this.connectors.findIndex((connector) => connector.id === id)
    if (index === -1) return undefined

    const connector = this.connectors[index]
    this.connectors[index] = {
      ...connector,
      status,
    }
    return this.connectors[index]
  }

  async updateLastSync(id: string): Promise<Connector | undefined> {
    const index = this.connectors.findIndex((connector) => connector.id === id)
    if (index === -1) return undefined

    const connector = this.connectors[index]
    this.connectors[index] = {
      ...connector,
      lastSync: new Date(),
    }
    return this.connectors[index]
  }

  async testConnector(
    id: string
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
