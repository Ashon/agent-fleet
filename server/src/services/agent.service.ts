import {
  Agent,
  AgentStatus,
  ChatMessage,
  ChatMessageRole,
  CreateAgentData,
} from '@agentfleet/types'
import { AgentRepository } from '../repositories/agent.repository'

export class AgentService {
  protected readonly repository: AgentRepository

  constructor(repository: AgentRepository) {
    this.repository = repository
  }

  async getAllAgents(): Promise<Agent[]> {
    return await this.repository.findAll()
  }

  async getAgentById(id: string): Promise<Agent | undefined> {
    const agent = await this.repository.findById(id)
    return agent ?? undefined
  }

  async createAgent(agentData: CreateAgentData): Promise<Agent> {
    // 필수 필드 검증
    if (!agentData.name) {
      throw new Error('필수 필드가 누락되었습니다.')
    }

    const newAgent = {
      ...agentData,
      status: 'active' as AgentStatus,
      chatHistory: [],
      capabilities: {},
      connectors: [],
    }

    return this.repository.create(newAgent)
  }

  async updateAgent(
    id: string,
    agentData: Partial<Agent>,
  ): Promise<Agent | undefined> {
    return this.repository.update(id, agentData)
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      await this.repository.delete(id)
      return true
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return false
      }
      throw error
    }
  }

  async updateAgentStatus(
    id: string,
    status: AgentStatus,
  ): Promise<Agent | undefined> {
    // 유효한 상태인지 검증
    if (status !== 'active' && status !== 'inactive') {
      throw new Error('유효하지 않은 상태입니다.')
    }

    const agent = await this.repository.findById(id)
    if (!agent) return undefined

    return this.repository.update(id, { status })
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

    const agent = await this.repository.findById(id)
    if (!agent) return undefined

    const chatHistory = [
      ...(agent.chatHistory || []),
      { ...message, timestamp: new Date().toISOString() },
    ]

    return this.repository.update(id, {
      chatHistory: chatHistory as ChatMessage[],
    })
  }
}
