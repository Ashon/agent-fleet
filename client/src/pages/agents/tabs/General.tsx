import PipelineCanvas from '@/components/PipelineCanvas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { api } from '@/services/api'
import {
  Agent,
  NodeExecutionResult,
  Pipeline,
  PipelineNode,
} from '@agentfleet/types'
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ReasoningPipelineConfig } from './ReasoningPipelineConfig'
import { ReasoningPipelineTest } from './ReasoningPipelineTest'

export default function General({ agent }: { agent: Agent }) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<PipelineNode | undefined>(
    undefined,
  )
  const [nodeResults, setNodeResults] = useState<
    Record<string, NodeExecutionResult>
  >({})
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  )
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1000px)')

    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      setDirection(e.matches ? 'vertical' : 'horizontal')
    }

    handleResize(mediaQuery)
    mediaQuery.addEventListener('change', handleResize)
    return () => {
      mediaQuery.removeEventListener('change', handleResize)
    }
  }, [])

  const handleCreateNewPipeline = async () => {
    if (!agent.id) return

    try {
      const newPipeline = await api.createReasoningPipeline({
        name: `${agent.name}의 추론 파이프라인`,
        agentId: agent.id,
        description: '새로운 추론 파이프라인',
        nodes: [
          // {
          //   id: 'prompt-1',
          //   type: 'prompt',
          //   position: { x: 200, y: 100 },
          //   data: {
          //     name: '입력',
          //     description: '사용자 입력',
          //     config: {
          //       templateId: '',
          //       variables: {},
          //       contextMapping: {
          //         input: ['text'],
          //         output: ['intent', 'entities'],
          //       },
          //     },
          //   },
          // },
        ],
        edges: [],
      })

      setPipeline(newPipeline)
    } catch (error) {
      console.error('파이프라인 생성 오류:', error)
    }
  }

  return (
    <div className="h-full bottom-0">
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
        <div className="rounded-lg shadow-lg absolute w-full top-0 bottom-22 border overflow-hidden">
          <ResizablePanelGroup direction={direction}>
            <ResizablePanel defaultSize={80} minSize={30}>
              <div className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <Button className="cursor-pointer" variant="default">
                    <PlusIcon />
                    프롬프트 추가
                  </Button>
                </div>
              </div>

              {pipeline ? (
                <PipelineCanvas
                  pipeline={pipeline}
                  onNodeClick={setSelectedNode}
                  onUpdate={onUpdate}
                  activeNodeIds={activeNodeIds}
                  contextMenu={{
                    enabled: true,
                    items: [
                      {
                        type: 'menu',
                        text: '프롬프트 추가',
                        onClick: () => {},
                      },
                      {
                        type: 'divider',
                      },
                      {
                        type: 'menu',
                        text: '컨텍스트 메뉴 테스트 중',
                        onClick: () => {},
                      },
                    ],
                  }}
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Button
                    variant="outline"
                    onClick={handleCreateNewPipeline}
                    className="cursor-pointer"
                  >
                    <PlusIcon className="h-5 w-5" />
                    New Reasoning Pipeline
                  </Button>
                </div>
              )}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30}>
              {selectedNode ? (
                <ReasoningPipelineConfig
                  selectedNode={selectedNode}
                  pipelineId={pipeline?.id || ''}
                />
              ) : (
                <ReasoningPipelineTest
                  agent={agent}
                  pipeline={pipeline}
                  onActiveNodeIdsChange={setActiveNodeIds}
                  onNodeResultsChange={setNodeResults}
                />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}
