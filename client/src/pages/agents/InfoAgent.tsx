import Breadcrumb from '@/components/Breadcrumb'
import ChatHistory from '@/pages/agents/tabs/ChatHistory'
import PipelineJobs from '@/pages/agents/tabs/PipelineJobs'
import ReasoningPipeline from '@/pages/agents/tabs/ReasoningPipeline'
import { api } from '@/services/api'
import { Agent } from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import General from './tabs/General'

type TabType = 'general' | 'reasoning-pipeline' | 'history' | 'pipeline-jobs'

export default function InfoAgent() {
  const { id, tab = 'general' } = useParams<{ id: string; tab: TabType }>()
  const [isLoading, setIsLoading] = useState(true)
  const [agent, setAgent] = useState<Agent | null>(null)
  const isValidTab = (tab: string): tab is TabType => {
    return [
      'general',
      'reasoning-pipeline',
      'history',
      'pipeline-jobs',
    ].includes(tab)
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
    <div className="container-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: 'Agents', path: '/agents' },
            { label: agent.name },
            { label: 'Info' },
          ]}
        />

        <div className="tabs tabs-border">
          <Link
            to={`/agents/${id}/general`}
            className={`tab ${tab === 'general' ? 'tab-active' : ''}`}
          >
            General
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
          <Link
            to={`/agents/${id}/pipeline-jobs`}
            className={`tab ${tab === 'pipeline-jobs' ? 'tab-active' : ''}`}
          >
            Pipeline Jobs
          </Link>
        </div>

        <div className="mt-2">
          {tab === 'general' && <General agent={agent} />}
          {tab === 'reasoning-pipeline' && <ReasoningPipeline agent={agent} />}
          {tab === 'history' && <ChatHistory agent={agent} />}
          {tab === 'pipeline-jobs' && <PipelineJobs agent={agent} />}
        </div>
      </div>
    </div>
  )
}
