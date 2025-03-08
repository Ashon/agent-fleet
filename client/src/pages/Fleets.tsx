import { Fleet } from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import Card from '../components/Card'
import { api } from '../services/api'

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
          New Fleet
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleets.map((fleet) => (
          <Card key={fleet.id} hover>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="card-title">{fleet.name}</h2>
                <p className="text-sm text-base-content/70 mt-1">
                  {fleet.description}
                </p>
              </div>
              <div
                className={`badge ${
                  fleet.status === 'active' ? 'badge-success' : 'badge-ghost'
                }`}
              >
                {fleet.status}
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{fleet.agents.length} 에이전트</span>
              </div>
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
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
                className="btn btn-ghost btn-sm"
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
