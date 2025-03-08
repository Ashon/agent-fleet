import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import { Agent, mockAgents } from '../mocks/agents'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

export default function Chat() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '안녕하세요! 무엇을 도와드릴까요?',
      role: 'assistant',
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // TODO: API 연동 시 실제 데이터 조회 로직 구현
    const foundAgent = mockAgents.find((a) => a.id === id)
    if (foundAgent) {
      setAgent(foundAgent)
    }
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isWaitingForResponse) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsWaitingForResponse(true)

    // TODO: API 연동 시 실제 응답 로직 구현
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          '죄송합니다. 현재는 데모 모드입니다. 실제 API 연동이 필요합니다.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsWaitingForResponse(false)
    }, 1000)
  }

  return isLoading ? (
    <></>
  ) : !agent ? (
    <Navigate to="/404" replace />
  ) : (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Breadcrumb
            items={[
              { label: 'Agents', path: '/agents' },
              { label: agent.name },
            ]}
          />
          <div
            className={`badge badge-sm ${
              agent.status === 'active' ? 'badge-success' : 'badge-ghost'
            }`}
          >
            {agent.status}
          </div>
        </div>
        <div className="text-sm text-base-content/60">Model: {agent.model}</div>
      </div>

      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-1">
              <div
                className={`max-w-[80%] p-4 ${
                  message.role === 'user'
                    ? 'bg-base-200 border-l-[3px] border-primary'
                    : 'bg-base-200 border-l-[3px] border-secondary'
                }`}
              >
                <div className="flex items-center gap-1 text-xs text-base-content/80">
                  <span>{message.role === 'user' ? 'You' : agent.name}</span>
                  <span>•</span>
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isWaitingForResponse && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-base-content/60">
                <span>{agent.name}</span>
                <span>•</span>
                <span>typing...</span>
              </div>
              <div className="bg-base-200 p-4 border-l-[3px] border-secondary">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isWaitingForResponse}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isWaitingForResponse || !input.trim()}
          >
            전송
          </button>
        </form>
      </div>
    </div>
  )
}
