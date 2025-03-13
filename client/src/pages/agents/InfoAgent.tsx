import Breadcrumb from '@/components/Breadcrumb'
import ChatHistory from '@/pages/agents/edit/ChatHistory'
import ReasoningPipeline from '@/pages/agents/edit/ReasoningPipeline'
import { api } from '@/services/api'
import { Agent } from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

type TabType = 'general' | 'reasoning-pipeline' | 'history'

export default function InfoAgent() {
  const { id, tab = 'general' } = useParams<{ id: string; tab: TabType }>()
  const [isLoading, setIsLoading] = useState(true)
  const [agent, setAgent] = useState<Agent | null>(null)

  const isValidTab = (tab: string): tab is TabType => {
    return ['general', 'reasoning-pipeline', 'history'].includes(tab)
  }

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

  if (!agent || !isValidTab(tab)) {
    return <Navigate to="/404" replace />
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: 'Agents', path: '/agents' },
            { label: agent.name },
            { label: 'Info' },
          ]}
        />

        <div className="tabs tabs-border">
          <Link
            to={`/agents/${id}/info`}
            className={`tab ${tab === 'general' ? 'tab-active' : ''}`}
          >
            Info
          </Link>
          <Link
            to={`/agents/${id}/reasoning-pipeline`}
            className={`tab ${tab === 'reasoning-pipeline' ? 'tab-active' : ''}`}
          >
            Reasoning Pipeline
          </Link>
          <Link
            to={`/agents/${id}/history`}
            className={`tab ${tab === 'history' ? 'tab-active' : ''}`}
          >
            Chat History
          </Link>
        </div>

        <div className="mt-4">
          {tab === 'general' && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">
                    {agent.name}
                    <div
                      className={`badge ${
                        agent.status === 'active'
                          ? 'badge-success'
                          : 'badge-ghost'
                      }`}
                    >
                      {agent.status}
                    </div>
                  </h2>
                  <Link
                    to={`/agents/${id}/edit`}
                    className="btn btn-sm btn-primary"
                  >
                    Edit
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      <span className="label-text font-semibold">생성일</span>
                    </label>
                    <div className="flex items-center h-8">
                      {new Date(agent.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">에이전트 기능</h3>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>기능</th>
                          <th>상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(agent.capabilities).map(
                          ([key, value]) => (
                            <tr key={key}>
                              <td>{key}</td>
                              <td>
                                <div
                                  className={`badge ${value ? 'badge-success' : 'badge-ghost'}`}
                                >
                                  {value ? '활성화' : '비활성화'}
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === 'reasoning-pipeline' && <ReasoningPipeline agent={agent} />}
          {tab === 'history' && <ChatHistory agent={agent} />}
        </div>
      </div>
    </div>
  )
}
