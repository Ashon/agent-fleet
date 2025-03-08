export type ConnectorStatus = 'active' | 'inactive'
export type ConnectorType = 'input' | 'data-source' | 'action'

export interface Connector {
  id: string
  name: string
  description: string
  type: ConnectorType
  category: string
  icon: string
  config: Record<string, unknown>
  status: ConnectorStatus
  lastSync: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateConnectorData {
  name: string
  description: string
  type: ConnectorType
  category: string
  icon: string
  config: Record<string, unknown>
}

export interface UpdateConnectorData extends Partial<CreateConnectorData> {
  id: string
}
