import ChatHistory from '@/pages/agents/tabs/ChatHistory'
import PipelineJobs from '@/pages/agents/tabs/PipelineJobs'
import { api } from '@/services/api'
import { Agent } from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
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
    <div className="fixed inset-0 pt-16 px-4">
      {/* <div className="flex gap-5 text-sm mb-2">
        <Link
          className={
            `${tab === 'general' ? 'text-foreground' : 'text-muted-foreground'}` +
            ' cursor-pointer hover:text-foreground'
          }
          to={`/agents/${id}/general`}
        >
          General
        </Link>
        <Link
          className={
            `${tab === 'history' ? 'text-foreground' : 'text-muted-foreground'}` +
            ' cursor-pointer hover:text-foreground'
          }
          to={`/agents/${id}/history`}
        >
          Chat History
        </Link>
        <Link
          className={
            `${tab === 'pipeline-jobs' ? 'text-foreground' : 'text-muted-foreground'}` +
            ' cursor-pointer hover:text-foreground'
          }
          to={`/agents/${id}/pipeline-jobs`}
        >
          Pipeline Jobs
        </Link>
      </div> */}

      {tab === 'general' && <General agent={agent} />}
      {tab === 'history' && <ChatHistory agent={agent} />}
      {tab === 'pipeline-jobs' && <PipelineJobs agent={agent} />}
    </div>
  )
}
