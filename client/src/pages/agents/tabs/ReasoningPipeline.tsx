import { default as PipelineCanvas } from '@/components/PipelineCanvas'
import { api } from '@/services/api'
import {
  Agent,
  NodeExecutionResult,
  Pipeline,
  PipelineNode,
} from '@agentfleet/types'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ReasoningPipelineConfig } from './ReasoningPipelineConfig'
import { ReasoningPipelineTest } from './ReasoningPipelineTest'

interface ReasoningPipelineProps {
  agent: Agent
}

export default function ReasoningPipeline({ agent }: ReasoningPipelineProps) {
  const { subTab = 'config' } = useParams<{
    subTab: 'test' | 'config'
  }>()

  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null)
  const [nodeResults, setNodeResults] = useState<
    Record<string, NodeExecutionResult>
  >({})

  // 디바운스를 위한 타이머 ref
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onUpdate = (updatedPipeline: Pipeline) => {
    // 로컬 상태 업데이트 (이전 파이프라인과 다를 경우에만)
    if (JSON.stringify(pipeline) !== JSON.stringify(updatedPipeline)) {
      setPipeline(updatedPipeline)
    }

    // 이전 타이머가 있으면 취소
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
    }

    // 새 타이머 설정 (500ms 디바운스)
    updateTimerRef.current = setTimeout(() => {
      console.log('디바운스 후 파이프라인 업데이트')
      api
        .updateReasoningPipeline(updatedPipeline.id, updatedPipeline)
        .catch((error) => {
          console.error('파이프라인 업데이트 오류:', error)
        })
      updateTimerRef.current = null
    }, 500)
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    api.getReasoningPipelines(agent.id).then((pipelines) => {
      const foundPipeline = pipelines.find((p) => p.agentId === agent.id)
      setPipeline(foundPipeline || null)
    })
  }, [agent])

  const handleCreateNewPipeline = async () => {
    if (!agent.id) return

    try {
      const newPipeline = await api.createReasoningPipeline({
        name: `${agent.name}의 추론 파이프라인`,
        agentId: agent.id,
        description: '새로운 추론 파이프라인',
        nodes: [
          {
            id: 'prompt-1',
            type: 'prompt',
            position: { x: 200, y: 100 },
            data: {
              name: '입력',
              description: '사용자 입력',
              config: {
                templateId: '',
                variables: {},
                contextMapping: {
                  input: ['text'],
                  output: ['intent', 'entities'],
                },
              },
            },
          },
        ],
        edges: [],
      })

      setPipeline(newPipeline)
    } catch (error) {
      console.error('파이프라인 생성 오류:', error)
    }
  }

  return (
    <div className="px-4 flex flex-col ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="overflow-hidden col-span-2 ">
          {pipeline ? (
            <div className="h-full rounded-lg shadow-lg">
              <PipelineCanvas
                pipeline={pipeline}
                onNodeClick={setSelectedNode}
                onUpdate={onUpdate}
                activeNodeIds={activeNodeIds}
                nodeResults={Object.fromEntries(
                  Object.entries(nodeResults).map(([key, value]) => [
                    key,
                    {
                      status: value.status,
                      output: JSON.stringify(value.output),
                    },
                  ]),
                )}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <button
                onClick={handleCreateNewPipeline}
                className="btn btn-primary"
              >
                <PlusIcon className="h-5 w-5" />
                New Reasoning Pipeline
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col h-full">
          <div className="tabs tabs-border shrink-0">
            <Link
              to={`/agents/${agent.id}/reasoning-pipeline/config`}
              className={`tab ${subTab === 'config' ? 'tab-active' : ''}`}
            >
              Config
            </Link>
            <Link
              to={`/agents/${agent.id}/reasoning-pipeline/test`}
              className={`tab ${subTab === 'test' ? 'tab-active' : ''}`}
            >
              Test
            </Link>
          </div>
          <div className="flex-1 p-2 min-h-[calc(100vh-16rem)] max-h-[calc(100vh-16rem)] overflow-y-auto">
            {subTab === 'config' && (
              <ReasoningPipelineConfig
                selectedNode={selectedNode}
                pipelineId={pipeline?.id || ''}
              />
            )}
            {subTab === 'test' && (
              <ReasoningPipelineTest
                agent={agent}
                pipeline={pipeline}
                onActiveNodeIdsChange={setActiveNodeIds}
                onNodeResultsChange={setNodeResults}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
