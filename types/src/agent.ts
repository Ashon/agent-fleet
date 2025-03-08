import { ChatMessage } from './chat'

export type AgentStatus = 'active' | 'inactive'

export interface Agent {
  id: string
  name: string
  description: string
  status: AgentStatus
  createdAt: Date
  updatedAt: Date
  chatHistory: ChatMessage[]
}

export interface CreateAgentData {
  name: string
  description: string
}

export interface UpdateAgentData extends Partial<CreateAgentData> {
  id: string
}
