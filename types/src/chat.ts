export type ChatMessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string | React.ReactNode
  createdAt: Date
}

export interface ChatHistory {
  agentId: string
  messages: ChatMessage[]
}
