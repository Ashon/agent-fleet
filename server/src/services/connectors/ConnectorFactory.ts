import { Connector, ConnectorContext, ConnectorResult } from './Connector'

export class ConnectorFactory {
  private connectors: Connector[] = []

  registerConnector(connector: Connector): void {
    this.connectors.push(connector)
  }

  async fetchData(
    connectorId: string,
    context: ConnectorContext,
  ): Promise<ConnectorResult> {
    const connector = this.connectors.find((c) => c.canHandle(connectorId))
    if (!connector) {
      throw new Error(`${connectorId} 커넥터를 찾을 수 없습니다.`)
    }

    return connector.fetchData(connectorId, context)
  }
}
