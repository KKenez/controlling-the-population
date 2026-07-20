// AI chat types

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
}

export interface ConversationState {
  messages: ChatMessage[]
  isLoading: boolean
}
