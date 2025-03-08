import Breadcrumb from '@/components/Breadcrumb'
import Card from '@/components/Card'
import { api } from '@/services/api'
import { Agent } from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.getAgents()
        setAgents(data)
      } catch (err) {
        setError('에이전트 목록을 불러오는데 실패했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  const getLastActiveTime = (chatHistory?: { timestamp: string }[]) => {
    if (!chatHistory?.length) return null

    const lastMessage = chatHistory[chatHistory.length - 1]
    return new Date(lastMessage.timestamp)
  }

  const formatLastActive = (date: Date | null) => {
    if (!date) return '활동 기록 없음'

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) {
      return `${minutes}분 전`
    } else if (hours < 24) {
      return `${hours}시간 전`
    } else if (days < 7) {
      return `${days}일 전`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Breadcrumb items={[{ label: 'Agents' }]} />
        </div>
        <Link to="/agents/new" className="btn btn-primary btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Agent
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const lastActive = getLastActiveTime(agent.chatHistory)

          return (
            <Card key={agent.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="card-title">{agent.name}</h2>
                  <p className="text-sm text-base-content/70 mt-1">
                    {agent.description}
                  </p>
                </div>
                <div
                  className={`badge ${
                    agent.status === 'active' ? 'badge-success' : 'badge-ghost'
                  }`}
                >
                  {agent.status}
                </div>
              </div>

              <div className="mt-4 space-y-2 flex justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-base-content/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-base-content/70">
                    {formatLastActive(lastActive)}
                  </span>
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link
                    to={`/agents/${agent.id}/chat`}
                    className="btn btn-primary btn-sm"
                  >
                    Chat
                  </Link>
                  <Link
                    to={`/agents/${agent.id}/edit/workflow`}
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
