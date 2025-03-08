export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Agent {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
}

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Customer Support Agent',
    description: '고객 문의를 처리하는 AI 에이전트',
    status: 'active',
  },
  {
    id: '2',
    name: 'Data Analysis Agent',
    description: '데이터 분석을 수행하는 AI 에이전트',
    status: 'inactive',
  },
]
