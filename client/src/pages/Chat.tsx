import Breadcrumb from '@/components/Breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import {
  Agent,
  Conversation,
  NodeExecutionResult,
  Pipeline,
} from '@agentfleet/types'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ReasoningPipelineTest } from './agents/tabs/ReasoningPipelineTest'

export default function Chat() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Conversation[]>([])
  const [input, setInput] = useState('')
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set())
  const [nodeResults, setNodeResults] = useState<
    Map<string, NodeExecutionResult>
  >(new Map())

  useEffect(() => {
    // TODO: API 연동 시 실제 데이터 조회 로직 구현
    if (!id) {
      return
    }

    api.getAgent(id).then((agent) => {
      if (!agent) {
        navigate('/404')
        return
      }
      setAgent(agent)

      api
        .getReasoningPipelines(agent.id)
        .then((pipelines) => {
          const foundPipeline = pipelines.find((p) => p.agentId === agent.id)
          setPipeline(foundPipeline || null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    })
  }, [id, navigate])

  return isLoading ? (
    <></>
  ) : !agent ? (
    <Navigate to="/404" replace />
  ) : (
    <div className="fixed inset-0 pt-16 px-4">
      <div className="mb-2 gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{agent.name}</div>
            <Badge
              variant={agent.status === 'active' ? 'default' : 'secondary'}
            >
              {agent.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <h4 className="font-semibold">생성일</h4>
              {new Date(agent.createdAt).toLocaleString()}
            </div>
            <Button className="cursor-pointer" variant="outline" size="sm">
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button className="cursor-pointer" variant="destructive" size="sm">
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center h-8">
          {agent.description || '설명이 없습니다.'}
        </div>
      </div>
      <div className="h-full relative">
        <div className="absolute w-full top-0 bottom-22">
          <ReasoningPipelineTest
            agent={agent}
            pipeline={pipeline}
            onActiveNodeIdsChange={setActiveNodeIds}
          />
        </div>
      </div>
    </div>
  )
}
