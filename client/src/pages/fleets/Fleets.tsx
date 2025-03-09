import Breadcrumb from '@/components/Breadcrumb'
import Card from '@/components/Card'
import { api } from '@/services/api'
import { Fleet } from '@agentfleet/types'
import { CalendarIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline'
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
          <Breadcrumb items={[{ label: 'Fleets' }]} />
        </div>
        <Link to="/fleets/new" className="btn btn-primary btn-sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          New Fleet
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleets.map((fleet) => (
          <Card key={fleet.id} hover>
            <div>
              <div className="flex items-start justify-between">
                <h2 className="card-title">{fleet.name}</h2>
                <div
                  className={`badge badge-sm ${
                    fleet.status === 'active' ? 'badge-success' : 'badge-ghost'
                  }`}
                >
                  {fleet.status}
                </div>
              </div>
              <p className="text-sm text-base-content/70 mt-1">
                {fleet.description}
              </p>
            </div>

            <div className="mt-4 space-y-2 flex justify-between">
              <div className="flex items-center gap-2 text-sm">
                <UsersIcon className="h-4 w-4 text-base-content/70" />
                <span>{fleet.agents.length} 에이전트</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-base-content/70" />
                <span className="text-base-content/70">
                  {new Date(fleet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="card-actions justify-end mt-4">
              <Link
                to={`/fleets/${fleet.id}/agents`}
                className="btn btn-primary btn-sm"
              >
                에이전트 관리
              </Link>
              <Link
                to={`/fleets/${fleet.id}/edit`}
                className="btn btn-outline btn-sm"
              >
                수정
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
