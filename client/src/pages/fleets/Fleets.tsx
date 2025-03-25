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
import { Fleet } from '@agentfleet/types'
import { Calendar, Plus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Fleets() {
  const [fleets, setFleets] = useState<Fleet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFleets = async () => {
      try {
        const data = await api.getFleets()
        setFleets(data)
      } catch (err) {
        setError('Fleet 목록을 불러오는데 실패했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFleets()
  }, [])

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
    <div className="container-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4"></div>
        <Link to="/fleets/new">
          <Button size="sm" className="cursor-pointer">
            <Plus className="h-4 w-4 mr-1" />
            New Fleet
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleets.map((fleet) => (
          <Card key={fleet.id} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2 justify-between">
                  {fleet.name}
                  <Badge
                    variant={
                      fleet.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {fleet.status}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>{fleet.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-2 flex justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-base-content/70" />
                  <span className="text-base-content/70">
                    {new Date(fleet.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-base-content/70" />
                  <span>{fleet.agents.length} 에이전트</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/fleets/${fleet.id}/agents`}
                    className="btn btn-primary btn-sm"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      에이전트 관리
                    </Button>
                  </Link>
                  <Link
                    to={`/fleets/${fleet.id}/edit`}
                    className="btn btn-outline btn-sm"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      수정
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
