import {
  Agent,
  AgentStatus,
  ChatMessage,
  ChatMessageRole,
} from '@agentfleet/types'
import { v4 } from 'uuid'
import { S3RepositoryDriver } from '../../drivers/s3RepositoryDriver'
import { AgentRepository } from '../../repositories/agent.repository'
import { AgentService } from '../agent.service'

jest.mock('../../repositories/agent.repository')

describe('AgentService', () => {
  let agentService: AgentService
  let mockRepository: jest.Mocked<AgentRepository>

  const testAgent: Agent = {
    id: '1',
    name: '테스트 에이전트',
    description: '테스트를 위한 에이전트입니다.',
    status: 'active' as AgentStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chatHistory: [],
    capabilities: {
      reasoning: true,
      planning: true,
    },
    connectors: ['test-connector'],
  }

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      driver: {} as S3RepositoryDriver,
      entityName: 'agents',
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<AgentRepository>

    agentService = new AgentService(mockRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllAgents', () => {
    it('should return all agents', async () => {
      mockRepository.findAll.mockResolvedValue([testAgent])
      const result = await agentService.getAllAgents()
      expect(result).toEqual([testAgent])
      expect(mockRepository.findAll).toHaveBeenCalled()
    })

    it('반환된 배열은 원본과 다른 참조여야 합니다', async () => {
      mockRepository.findAll.mockResolvedValue([testAgent])
      const agents = await agentService.getAllAgents()
      expect(agents).not.toBe([testAgent])
    })

    it('빈 배열이 반환되어도 안전하게 처리되어야 합니다', async () => {
      mockRepository.findAll.mockResolvedValue([])
      const agents = await agentService.getAllAgents()
      expect(Array.isArray(agents)).toBe(true)
      expect(agents.length).toBe(0)
    })
  })

  describe('getAgentById', () => {
    it('should return agent by id', async () => {
      mockRepository.findById.mockResolvedValue(testAgent)
      const result = await agentService.getAgentById('1')
      expect(result).toEqual(testAgent)
      expect(mockRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should return undefined for non-existent agent', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await agentService.getAgentById('non-existent')
      expect(result).toBeUndefined()
    })

    it('빈 ID는 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await agentService.getAgentById('')
      expect(result).toBeUndefined()
    })

    it('특수문자가 포함된 ID도 처리되어야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await agentService.getAgentById('test@#$%^&*()')
      expect(result).toBeUndefined()
    })
  })

  describe('createAgent', () => {
    it('should create a new agent', async () => {
      const agentData = {
        name: '새 에이전트',
        description: '새로운 에이전트입니다.',
        createdAt: new Date(),
        updatedAt: new Date(),
        capabilities: {
          reasoning: true,
          planning: true,
        },
        connectors: [],
      }

      const expectedAgent: Agent = {
        id: expect.any(String),
        ...agentData,
        status: 'active',
        chatHistory: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        capabilities: {},
        connectors: [],
      }

      mockRepository.create.mockResolvedValue(expectedAgent)
      const result = await agentService.createAgent(agentData)
      expect(result).toEqual(expectedAgent)
      expect(mockRepository.create).toHaveBeenCalled()
    })

    it('필수 필드가 누락된 경우 에러를 발생시켜야 합니다', async () => {
      const invalidAgent = {
        description: 'Test Agent',
      }

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        agentService.createAgent(invalidAgent as any),
      ).rejects.toThrow()
    })

    it('긴 문자열이 포함된 에이전트도 생성되어야 합니다', async () => {
      const longString = 'a'.repeat(1000)
      const agentData = {
        name: longString,
        description: longString,
      }

      const expectedAgent: Agent = {
        id: expect.any(String),
        ...agentData,
        status: 'active',
        chatHistory: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        capabilities: {},
        connectors: [],
      }

      mockRepository.create.mockResolvedValue(expectedAgent)
      const result = await agentService.createAgent(agentData)
      expect(result.name).toBe(longString)
      expect(result.description).toBe(longString)
    })
  })

  describe('updateAgent', () => {
    it('should update an existing agent', async () => {
      const updateData = {
        name: '업데이트된 에이전트',
        description: '업데이트된 설명',
      }
      const updatedAgent = { ...testAgent, ...updateData }
      mockRepository.findById.mockResolvedValue(testAgent)
      mockRepository.update.mockResolvedValue(updatedAgent)

      const result = await agentService.updateAgent('1', updateData)
      expect(result).toEqual(updatedAgent)
      expect(mockRepository.update).toHaveBeenCalled()
    })

    it('should return undefined for non-existent agent', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await agentService.updateAgent('non-existent', {
        name: '업데이트',
      })
      expect(result).toBeUndefined()
    })

    it('ID는 변경할 수 없어야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(testAgent)
      const updateData = {
        id: 'new-id',
      }
      const updatedAgent = { ...testAgent }
      mockRepository.update.mockResolvedValue(updatedAgent)

      const result = await agentService.updateAgent(testAgent.id, updateData)
      expect(result?.id).toBe(testAgent.id)
    })

    it('부분 업데이트가 가능해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(testAgent)
      const updateData = {
        name: 'Updated Name',
      }
      const updatedAgent = { ...testAgent, ...updateData }
      mockRepository.update.mockResolvedValue(updatedAgent)

      const result = await agentService.updateAgent(testAgent.id, updateData)
      expect(result?.name).toBe(updateData.name)
      expect(result?.description).toBe(testAgent.description)
    })
  })

  describe('deleteAgent', () => {
    it('should delete an existing agent', async () => {
      mockRepository.findById.mockResolvedValue(testAgent)
      mockRepository.delete.mockResolvedValue()

      const result = await agentService.deleteAgent('1')
      expect(result).toBe(true)
      expect(mockRepository.delete).toHaveBeenCalledWith('1')
    })

    it('should return false for non-existent agent', async () => {
      mockRepository.findById.mockResolvedValue(null)
      mockRepository.delete.mockRejectedValue(new Error('Entity not found'))

      const result = await agentService.deleteAgent('non-existent')
      expect(result).toBe(false)
      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent')
    })

    it('이미 삭제된 에이전트를 다시 삭제하려고 할 때 false를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      mockRepository.delete.mockRejectedValue(new Error('Entity not found'))

      const result = await agentService.deleteAgent(testAgent.id)
      expect(result).toBe(false)
      expect(mockRepository.delete).toHaveBeenCalledWith(testAgent.id)
    })
  })

  describe('updateAgentStatus', () => {
    it('에이전트 상태를 업데이트해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(testAgent)
      const updatedAgent = { ...testAgent, status: 'inactive' as AgentStatus }
      mockRepository.update.mockResolvedValue(updatedAgent)

      const result = await agentService.updateAgentStatus(
        testAgent.id,
        'inactive',
      )
      expect(result?.status).toBe('inactive')
    })

    it('존재하지 않는 에이전트의 상태 업데이트는 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await agentService.updateAgentStatus('999', 'active')
      expect(result).toBeUndefined()
    })
  })

  describe('addChatMessage', () => {
    it('채팅 메시지를 추가해야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(testAgent)
      const message: ChatMessage = {
        id: v4(),
        role: 'user',
        content: '안녕하세요',
        createdAt: new Date(),
      }
      const updatedAgent = {
        ...testAgent,
        chatHistory: [...testAgent.chatHistory, message],
      }
      mockRepository.update.mockResolvedValue(updatedAgent)

      const result = await agentService.addChatMessage(testAgent.id, {
        role: 'user',
        content: '안녕하세요',
      })
      expect(result?.chatHistory).toHaveLength(1)
      expect(result?.chatHistory[0]).toMatchObject({
        role: 'user',
        content: '안녕하세요',
      })
    })

    it('존재하지 않는 에이전트에 메시지를 추가할 수 없습니다', async () => {
      mockRepository.findById.mockResolvedValue(null)
      const result = await agentService.addChatMessage('999', {
        role: 'user',
        content: '안녕하세요',
      })
      expect(result).toBeUndefined()
    })

    it('유효하지 않은 메시지 형식은 에러를 발생시켜야 합니다', async () => {
      mockRepository.findById.mockResolvedValue(testAgent)
      await expect(
        agentService.addChatMessage(testAgent.id, {
          role: 'invalid' as ChatMessageRole,
          content: '안녕하세요',
        }),
      ).rejects.toThrow()
    })
  })
})
