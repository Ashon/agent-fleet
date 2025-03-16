export interface ConnectorContext {
  query?: string
  filters?: Record<string, unknown>
  options?: Record<string, unknown>
}

export interface ConnectorResult {
  [key: string]: string
}

export interface Connector {
  canHandle(connectorId: string): boolean
  fetchData(
    connectorId: string,
    context: ConnectorContext,
  ): Promise<ConnectorResult>
}
