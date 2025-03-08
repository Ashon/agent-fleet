import { AgentService } from '../agent'
import { mockAgents } from '../../mocks/agents'
import {
  Agent,
  AgentStatus,
  CreateAgentData,
  ChatMessageRole,
} from '@agentfleet/types'

describe('AgentService', () => {
  let agentService: AgentService
  let testAgent: Agent

  beforeEach(() => {
    agentService = new AgentService()
    testAgent = mockAgents[0]
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllAgents', () => {
    it('모든 에이전트를 반환해야 합니다', async () => {
      const agents = await agentService.getAllAgents()
      expect(agents).toEqual(mockAgents)
    })

    it('반환된 배열은 원본과 다른 참조여야 합니다', async () => {
      const agents = await agentService.getAllAgents()
      expect(agents).not.toBe(mockAgents)
    })

    it('빈 배열이 반환되어도 안전하게 처리되어야 합니다', async () => {
      const emptyService = new AgentService()
      // 모든 에이전트를 삭제
      await emptyService.deleteAgent('1')
      await emptyService.deleteAgent('2')
      const agents = await emptyService.getAllAgents()
      expect(Array.isArray(agents)).toBe(true)
      expect(agents.length).toBe(0)
    })
  })

  describe('getAgentById', () => {
    it('존재하는 ID로 에이전트를 찾아야 합니다', async () => {
      const agent = await agentService.getAgentById(testAgent.id)
      expect(agent).toEqual(testAgent)
    })

    it('존재하지 않는 ID는 undefined를 반환해야 합니다', async () => {
      const agent = await agentService.getAgentById('999')
      expect(agent).toBeUndefined()
    })

    it('빈 ID는 undefined를 반환해야 합니다', async () => {
      const agent = await agentService.getAgentById('')
      expect(agent).toBeUndefined()
    })

    it('특수문자가 포함된 ID도 처리되어야 합니다', async () => {
      const specialId = 'test@#$%^&*()'
      const agent = await agentService.getAgentById(specialId)
      expect(agent).toBeUndefined()
    })
  })

  describe('createAgent', () => {
    it('새로운 에이전트를 생성해야 합니다', async () => {
      const newAgent = {
        name: 'Test Agent',
        description: '테스트용 에이전트',
      }

      const createdAgent = await agentService.createAgent(
        newAgent as Omit<Agent, 'id' | 'status' | 'chatHistory' | 'workflow'>
      )
      expect(createdAgent).toMatchObject(newAgent)
      expect(createdAgent.id).toBeDefined()
      expect(createdAgent.status).toBe('active')
      expect(createdAgent.chatHistory).toEqual([])
    })

    it('필수 필드가 누락된 경우 에러를 발생시켜야 합니다', async () => {
      const invalidAgent: Partial<CreateAgentData> = {
        // name이 누락됨
        description: 'Test Agent',
      }

      await expect(
        agentService.createAgent(
          invalidAgent as Omit<
            Agent,
            'id' | 'status' | 'chatHistory' | 'workflow'
          >
        )
      ).rejects.toThrow()
    })

    it('긴 문자열이 포함된 에이전트도 생성되어야 합니다', async () => {
      const longString = 'a'.repeat(1000)
      const newAgent = {
        name: longString,
        description: longString,
      }

      const createdAgent = await agentService.createAgent(
        newAgent as Omit<Agent, 'id' | 'status' | 'chatHistory' | 'workflow'>
      )
      expect(createdAgent.name).toBe(longString)
      expect(createdAgent.description).toBe(longString)
    })
  })

  describe('updateAgent', () => {
    it('존재하는 에이전트를 업데이트해야 합니다', async () => {
      const updateData = {
        name: 'Updated Agent',
        description: '업데이트된 설명',
      }

      const updatedAgent = await agentService.updateAgent(
        testAgent.id,
        updateData
      )
      expect(updatedAgent).toMatchObject({
        id: testAgent.id,
        ...updateData,
      })
    })

    it('존재하지 않는 에이전트는 undefined를 반환해야 합니다', async () => {
      const updateData = {
        name: 'Updated Agent',
      }

      const updatedAgent = await agentService.updateAgent('999', updateData)
      expect(updatedAgent).toBeUndefined()
    })

    it('ID는 변경할 수 없어야 합니다', async () => {
      const updateData = {
        id: 'new-id',
      }

      const updatedAgent = await agentService.updateAgent(
        testAgent.id,
        updateData
      )
      expect(updatedAgent?.id).toBe(testAgent.id)
    })

    it('부분 업데이트가 가능해야 합니다', async () => {
      const updateData = {
        name: 'Updated Name',
      }

      const updatedAgent = await agentService.updateAgent(
        testAgent.id,
        updateData
      )
      expect(updatedAgent?.name).toBe(updateData.name)
      expect(updatedAgent?.description).toBe(testAgent.description)
    })
  })

  describe('deleteAgent', () => {
    it('존재하는 에이전트를 삭제해야 합니다', async () => {
      const result = await agentService.deleteAgent(testAgent.id)
      expect(result).toBe(true)

      const deletedAgent = await agentService.getAgentById(testAgent.id)
      expect(deletedAgent).toBeUndefined()
    })

    it('존재하지 않는 에이전트 삭제는 false를 반환해야 합니다', async () => {
      const result = await agentService.deleteAgent('999')
      expect(result).toBe(false)
    })

    it('이미 삭제된 에이전트를 다시 삭제하려고 할 때 false를 반환해야 합니다', async () => {
      await agentService.deleteAgent(testAgent.id)
      const result = await agentService.deleteAgent(testAgent.id)
      expect(result).toBe(false)
    })
  })

  describe('updateAgentStatus', () => {
    it('에이전트 상태를 업데이트해야 합니다', async () => {
      const updatedAgent = await agentService.updateAgentStatus(
        testAgent.id,
        'inactive'
      )
      expect(updatedAgent?.status).toBe('inactive')
    })

    it('유효하지 않은 상태는 에러를 발생시켜야 합니다', async () => {
      await expect(
        agentService.updateAgentStatus(testAgent.id, 'invalid' as AgentStatus)
      ).rejects.toThrow()
    })

    it('존재하지 않는 에이전트의 상태 업데이트는 undefined를 반환해야 합니다', async () => {
      const updatedAgent = await agentService.updateAgentStatus('999', 'active')
      expect(updatedAgent).toBeUndefined()
    })
  })

  describe('addChatMessage', () => {
    it('채팅 메시지를 추가해야 합니다', async () => {
      const message = {
        role: 'user' as const,
        content: '테스트 메시지',
      }

      const updatedAgent = await agentService.addChatMessage(
        testAgent.id,
        message
      )
      expect(updatedAgent).toBeDefined()
      expect(updatedAgent?.chatHistory).toBeDefined()
      expect(updatedAgent?.chatHistory?.length).toBeGreaterThan(0)
      expect(
        updatedAgent?.chatHistory?.[updatedAgent.chatHistory.length - 1]
      ).toMatchObject({
        ...message,
        timestamp: expect.any(String),
      })
    })

    it('유효하지 않은 메시지 형식은 에러를 발생시켜야 합니다', async () => {
      const invalidMessage = {
        role: 'invalid' as ChatMessageRole,
        content: '테스트 메시지',
      }

      await expect(
        agentService.addChatMessage(testAgent.id, invalidMessage)
      ).rejects.toThrow()
    })

    it('긴 메시지도 처리되어야 합니다', async () => {
      const longMessage = {
        role: 'user' as const,
        content: 'a'.repeat(1000),
      }

      const updatedAgent = await agentService.addChatMessage(
        testAgent.id,
        longMessage
      )
      expect(updatedAgent?.chatHistory?.length).toBeGreaterThan(0)
      expect(
        updatedAgent?.chatHistory?.[updatedAgent.chatHistory.length - 1].content
      ).toBe(longMessage.content)
    })

    it('존재하지 않는 에이전트에 메시지 추가는 undefined를 반환해야 합니다', async () => {
      const message = {
        role: 'user' as const,
        content: '테스트 메시지',
      }

      const updatedAgent = await agentService.addChatMessage('999', message)
      expect(updatedAgent).toBeUndefined()
    })
  })
})
