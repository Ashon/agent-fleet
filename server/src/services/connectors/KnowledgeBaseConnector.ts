import { Connector, ConnectorContext, ConnectorResult } from './Connector'

export class KnowledgeBaseConnector implements Connector {
  canHandle(connectorId: string): boolean {
    return connectorId.startsWith('kb-')
  }

  async fetchData(
    connectorId: string,
    context: ConnectorContext,
  ): Promise<ConnectorResult> {
    return {
      result: `지식 베이스에서 데이터를 조회합니다.
        쿼리: ${context.query}
        필터: ${JSON.stringify(context.filters)}
        옵션: ${JSON.stringify(context.options)}`,
    }
  }
}
