import Breadcrumb from '@/components/Breadcrumb'
import Card from '@/components/Card'
import { api } from '@/services/api'
import { Agent } from '@agentfleet/types'
import { ClockIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/outline'
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

  // const getLastActiveTime = (chatHistory?: { timestamp: string }[]) => {
  //   if (!chatHistory?.length) return null

  //   const lastMessage = chatHistory[chatHistory.length - 1]
  //   return new Date(lastMessage.timestamp)
  // }

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
      <div className="container-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-2xl mx-auto">
        <div className="alert alert-error">
          <XCircleIcon className="stroke-current shrink-0 h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Breadcrumb items={[{ label: 'Agents' }]} />
        </div>
        <Link to="/agents/new" className="btn btn-primary btn-sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          New Agent
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => {
          // TODO: chatHistory 기능 구현
          const lastActive = new Date()

          return (
            <Card key={agent.id} hover>
              <div>
                <div className="flex items-start justify-between">
                  <h2 className="card-title">{agent.name}</h2>
                  <div
                    className={`badge badge-sm ${
                      agent.status === 'active'
                        ? 'badge-success'
                        : 'badge-ghost'
                    }`}
                  >
                    {agent.status}
                  </div>
                </div>

                <p className="text-sm text-base-content/70 mt-1">
                  {agent.description}
                </p>
              </div>

              <div className="mt-4 flex justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4 text-base-content/70" />
                  <span className="text-base-content/70">
                    {formatLastActive(lastActive)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/agents/${agent.id}/`}
                    className="btn btn-outline btn-sm"
                  >
                    Info
                  </Link>
                  <Link
                    to={`/agents/${agent.id}/chat`}
                    className={`btn btn-outline btn-sm ${
                      agent.status !== 'active' ? 'btn-disabled' : ''
                    }`}
                  >
                    Chat
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
