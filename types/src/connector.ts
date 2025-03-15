import { BaseEntity } from './common'

export type ConnectorStatus = 'active' | 'inactive'
export type ConnectorType = 'input' | 'data-source' | 'action'

export interface Connector extends BaseEntity {
  name: string
  description: string
  type: ConnectorType
  category: string
  icon: string
  config: Record<string, unknown>
  status: ConnectorStatus
  lastSync: Date | null
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
