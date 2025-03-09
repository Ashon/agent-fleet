import Breadcrumb from '@/components/Breadcrumb'
import { api } from '@/services/api'
import { Agent } from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

export default function InfoAgent() {
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [agent, setAgent] = useState<Agent | null>(null)

  useEffect(() => {
    if (id) {
      api.getAgent(id).then((data) => {
        setAgent(data)
        setIsLoading(false)
      })
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!agent) {
    return <Navigate to="/404" replace />
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: 'Agents', path: '/agents' },
            { label: agent.name },
            { label: 'Info' },
          ]}
        />

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">{agent.name}</h2>
              <Link
                to={`/agents/${id}/edit/workflow`}
                className="btn btn-primary"
              >
                에이전트 편집
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">상태</span>
                </label>
                <div className="flex items-center h-8">
                  <div
                    className={`badge ${
                      agent.status === 'active'
                        ? 'badge-success'
                        : 'badge-ghost'
                    }`}
                  >
                    {agent.status}
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">생성일</span>
                </label>
                <div className="flex items-center h-8">
                  {new Date(agent.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">설명</span>
                </label>
                <div className="flex items-center h-8">
                  {agent.description || '설명이 없습니다.'}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">모델</span>
                </label>
                <div className="flex items-center h-8">{agent.model}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">워크플로우 설정</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>단계</th>
                      <th>설명</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agent.workflow?.map((step, index) => (
                      <tr key={index}>
                        <td>{step.name}</td>
                        <td>{step.description}</td>
                        <td>
                          <div className="badge badge-ghost">{step.status}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
