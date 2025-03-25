import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api } from '@/services/api'
import { Agent } from '@agentfleet/types'
import { Clock, Plus, XCircle } from 'lucide-react'
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
          <XCircle className="stroke-current shrink-0 h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4"></div>
        <Link to="/agents/new">
          <Button size="sm" className="cursor-pointer">
            <Plus className="h-4 w-4 mr-1" />
            New Agent
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => {
          // TODO: chatHistory 기능 구현
          const lastActive = new Date()

          return (
            <Card key={agent.id} className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2 justify-between">
                    {agent.name}
                    <Badge
                      variant={
                        agent.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {agent.status}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-base-content/70" />
                    <span className="text-base-content/70">
                      {formatLastActive(lastActive)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/agents/${agent.id}/`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Info
                      </Button>
                    </Link>
                    <Link to={`/agents/${agent.id}/chat`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
