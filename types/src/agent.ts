import { ChatMessage } from './chat'

export type AgentStatus = 'active' | 'inactive'

export interface AgentCapabilities {
  reasoning?: boolean
  planning?: boolean
  toolUse?: boolean
  webSearch?: boolean
  informationSynthesis?: boolean
  imageAnalysis?: boolean
  textAnalysis?: boolean
  multimodalReasoning?: boolean
  imageGeneration?: boolean
  parallelProcessing?: boolean
  multimodalInput?: boolean
  resultAggregation?: boolean
  consensusBuilding?: boolean
  taskDecomposition?: boolean
  expertCoordination?: boolean
  resultSynthesis?: boolean
  qualityControl?: boolean
}

export interface Agent {
  id: string
  name: string
  description: string
  status: AgentStatus
  createdAt: Date
  updatedAt: Date
  chatHistory: ChatMessage[]
  capabilities: AgentCapabilities
  connectors: string[]
}

export interface CreateAgentData {
  name: string
  description: string
}

export interface UpdateAgentData extends Partial<CreateAgentData> {
  id: string
}
