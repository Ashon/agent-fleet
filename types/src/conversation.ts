export type ConversationRole = 'user' | 'assistant'

export interface Conversation {
  id: string
  role: ConversationRole
  content: string | React.ReactNode
  createdAt: Date
}

export interface ChatHistory {
  agentId: string
  conversations: Conversation[]
}
