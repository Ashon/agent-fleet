import Breadcrumb from '@/components/Breadcrumb'
import { ChatPannel } from '@/panels/ChatPannel'
import { api } from '@/services/api'
import { Agent, Conversation } from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

export default function Chat() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Conversation[]>([])
  const [input, setInput] = useState('')
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)

  useEffect(() => {
    // TODO: API 연동 시 실제 데이터 조회 로직 구현
    if (!id) {
      return
    }

    api.getAgent(id).then((agent) => {
      if (!agent) {
        navigate('/404')
        return
      }
      setAgent(agent)
      setIsLoading(false)
    })
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isWaitingForResponse) return

    const userMessage: Conversation = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsWaitingForResponse(true)

    // TODO: API 연동 시 실제 응답 로직 구현
    setTimeout(() => {
      const assistantMessage: Conversation = {
        id: (Date.now() + 1).toString(),
        content:
          '죄송합니다. 현재는 데모 모드입니다. 실제 API 연동이 필요합니다.',
        role: 'assistant',
        createdAt: new Date(),
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
    <div className="container-2xl mx-auto">
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
      </div>
      <div className="h-[calc(100vh-10rem)]">
        <ChatPannel
          agent={agent}
          messages={messages}
          isWaitingForResponse={isWaitingForResponse}
          handleSubmit={handleSubmit}
          input={input}
          setInput={setInput}
        />
      </div>
    </div>
  )
}
