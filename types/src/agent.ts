import { BaseEntity } from './common'
import { Conversation } from './conversation'

export type AgentStatus = 'active' | 'inactive'

export interface Agent extends BaseEntity {
  name: string
  description: string
  status: AgentStatus
  modelId: string
  chatHistory: Conversation[]
  tools: string[]
}

export interface CreateAgentData {
  name: string
  description: string
  modelId: string
}

export interface UpdateAgentData extends Partial<CreateAgentData> {
  id: string
}
