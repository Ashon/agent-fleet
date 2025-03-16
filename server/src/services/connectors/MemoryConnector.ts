import { Connector, ConnectorContext, ConnectorResult } from './Connector'

export class MemoryConnector implements Connector {
  canHandle(connectorId: string): boolean {
    return connectorId.startsWith('memory-')
  }

  async fetchData(
    connectorId: string,
    context: ConnectorContext,
  ): Promise<ConnectorResult> {
    return {
      result: `메모리에서 데이터를 조회합니다.
        쿼리: ${context.query}`,
    }
  }
}
