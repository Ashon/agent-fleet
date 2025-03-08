import {
  Agent,
  AgentStatus,
  ChatMessage,
  ChatMessageRole,
} from '@agentfleet/types'
import { mockAgents } from '../mocks/agents'

export class AgentService {
  protected readonly agents: Agent[]

  constructor() {
    this.agents = [...mockAgents]
  }

  async getAllAgents(): Promise<Agent[]> {
    return [...this.agents]
  }

  async getAgentById(id: string): Promise<Agent | undefined> {
    return this.agents.find((agent) => agent.id === id)
  }

  async createAgent(
    agentData: Omit<Agent, 'id' | 'status' | 'chatHistory' | 'workflow'>,
  ): Promise<Agent> {
    // 필수 필드 검증
    if (!agentData.name) {
      throw new Error('필수 필드가 누락되었습니다.')
    }

    const newAgent: Agent = {
      id: String(this.agents.length + 1),
      ...agentData,
      status: 'active',
      chatHistory: [],
    }
    this.agents.push(newAgent)
    return newAgent
  }

  async updateAgent(
    id: string,
    agentData: Partial<Agent>,
  ): Promise<Agent | undefined> {
    const index = this.agents.findIndex((agent) => agent.id === id)
    if (index === -1) return undefined

    this.agents[index] = {
      ...this.agents[index],
      ...agentData,
      id, // ID는 변경 불가
    }
    return this.agents[index]
  }

  async deleteAgent(id: string): Promise<boolean> {
    const index = this.agents.findIndex((agent) => agent.id === id)
    if (index === -1) return false

    this.agents.splice(index, 1)
    return true
  }

  async updateAgentStatus(
    id: string,
    status: AgentStatus,
  ): Promise<Agent | undefined> {
    // 유효한 상태인지 검증
    if (status !== 'active' && status !== 'inactive') {
      throw new Error('유효하지 않은 상태입니다.')
    }

    const index = this.agents.findIndex((agent) => agent.id === id)
    if (index === -1) return undefined

    const agent = this.agents[index]
    this.agents[index] = {
      ...agent,
      status,
    }
    return this.agents[index]
  }

  async addChatMessage(
    id: string,
    message: { role: ChatMessageRole; content: string },
  ): Promise<Agent | undefined> {
    // 유효한 메시지 형식인지 검증
    if (
      !message.role ||
      !message.content ||
      (message.role !== 'user' && message.role !== 'assistant')
    ) {
      throw new Error('유효하지 않은 메시지 형식입니다.')
    }

    const index = this.agents.findIndex((agent) => agent.id === id)
    if (index === -1) return undefined

    const agent = this.agents[index]
    const chatHistory = [
      ...(agent.chatHistory || []),
      { ...message, timestamp: new Date().toISOString() },
    ]

    this.agents[index] = {
      ...agent,
      chatHistory: chatHistory as ChatMessage[],
    }

    return this.agents[index]
  }
}

export const agentService = new AgentService()
