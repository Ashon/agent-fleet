import { BaseEntity } from './common'

export type FleetStatus = 'active' | 'inactive'

export interface Fleet extends BaseEntity {
  name: string
  description: string
  agents: string[] // agent ids
  status: FleetStatus
}

export interface CreateFleetData {
  name: string
  description: string
  agents?: string[]
}

export interface UpdateFleetData extends Partial<CreateFleetData> {
  id: string
}
