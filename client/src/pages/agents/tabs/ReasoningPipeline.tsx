import { default as PipelineCanvas } from '@/components/PipelineCanvas'
import ChatPannel, { ChatMessageWithExtra } from '@/panels/ChatPannel'
import { api } from '@/services/api'
import { Agent, Pipeline } from '@agentfleet/types'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useRef, useState } from 'react'

// ChatMessageWithExtra 타입 확장
interface ProgressMessage extends ChatMessageWithExtra {
  isLoading?: boolean
  extra?: any[]
}

interface NodeExecutionResult {
  nodeId: string
  nodeName: string
  nodeType: string
  status: 'running' | 'success' | 'error'
  output?: any
  message?: string
  timestamp: Date
}

const NODE_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
} as const

interface ReasoningPipelineProps {
  agent: Agent
}

export default function ReasoningPipeline({ agent }: ReasoningPipelineProps) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [messages, setMessages] = useState<ProgressMessage[]>([])
  const [input, setInput] = useState('')
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set())
  const [nodeResults, setNodeResults] = useState<
    Map<string, NodeExecutionResult>
  >(new Map())

  // 디바운스를 위한 타이머 ref
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 진행 중인 메시지 상태
  const [progressingMessage, setProgressingMessage] = useState<
    ProgressMessage | undefined
  >(undefined)

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

  // 노드 결과 업데이트 함수
  const updateNodeResult = useCallback(
    (nodeId: string, result: NodeExecutionResult) => {
      setNodeResults((prev) => {
        const next = new Map(prev)
        next.set(nodeId, result)
        return next
      })
    },
    [],
  )

  // 노드 시작 처리
  const handleNodeStart = useCallback((data: any) => {
    const result: NodeExecutionResult = {
      nodeId: data.nodeId,
      nodeName: data.nodeName,
      nodeType: data.nodeType,
      status: NODE_STATUS.RUNNING,
      timestamp: new Date(),
    }

    setActiveNodeIds((prev) => {
      const next = new Set(prev)
      next.add(data.nodeId)
      return next
    })

    setNodeResults((prev) => {
      const next = new Map(prev)
      next.set(data.nodeId, result)

      // 진행 중인 노드 정보를 포함한 메시지 생성
      setProgressingMessage((prevMsg) => ({
        id: prevMsg?.id || `progress-${Date.now()}`,
        role: 'assistant',
        content: `${data.nodeName} 노드 실행 중...`,
        createdAt: new Date(),
        isLoading: true,
        extra: Array.from(next.values()),
      }))

      return next
    })
  }, [])

  // 노드 완료 처리
  const handleNodeComplete = useCallback((data: any) => {
    const result: NodeExecutionResult = {
      nodeId: data.nodeId,
      nodeName: data.nodeName,
      nodeType: data.nodeType,
      status: NODE_STATUS.SUCCESS,
      output: data.output,
      timestamp: new Date(),
    }

    setActiveNodeIds((prev) => {
      const next = new Set(prev)
      next.delete(data.nodeId)
      return next
    })

    setNodeResults((prev) => {
      const next = new Map(prev)
      next.set(data.nodeId, result)

      // 다음 실행될 노드 찾기
      const nextActiveNode = Array.from(next.values()).find(
        (node) => node.status === NODE_STATUS.RUNNING,
      )

      // 진행 중인 메시지 업데이트
      setProgressingMessage((prevMsg) => ({
        id: prevMsg?.id || `progress-${Date.now()}`,
        role: 'assistant',
        content: nextActiveNode
          ? `${nextActiveNode.nodeName} 노드 실행 중...`
          : '파이프라인 실행 완료 중...',
        createdAt: new Date(),
        isLoading: true,
        extra: Array.from(next.values()),
      }))

      return next
    })
  }, [])

  // 실행 완료 처리
  const handleComplete = useCallback(
    (data: any) => {
      setNodeResults((prev) => {
        const next = new Map(prev)
        // 모든 노드를 success 상태로 업데이트
        for (const [nodeId, result] of next.entries()) {
          next.set(nodeId, {
            ...result,
            status: NODE_STATUS.SUCCESS,
            output: result.output || data.output,
          })
        }
        return next
      })

      // 진행 중 메시지를 먼저 초기화
      setProgressingMessage(undefined)

      // 최종 메시지에 완료된 노드 결과 포함
      setMessages((prevMessages) => [
        ...prevMessages.filter((m) => !m.isLoading),
        {
          id: `completion-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          createdAt: new Date(),
          extra: Array.from(nodeResults.values()).map((result) => ({
            ...result,
            status: NODE_STATUS.SUCCESS,
          })),
        },
      ])

      setIsWaitingForResponse(false)
      setActiveNodeIds(new Set())
    },
    [nodeResults],
  )

  // 에러 처리
  const handleError = useCallback(
    (data: any) => {
      // 현재 실행 중인 노드가 있다면 에러 상태로 변경
      if (activeNodeIds.size > 0) {
        setNodeResults((prev) => {
          const next = new Map(prev)
          activeNodeIds.forEach((nodeId) => {
            const node = next.get(nodeId)
            if (node) {
              next.set(nodeId, {
                ...node,
                status: NODE_STATUS.ERROR,
                message: data.message,
              })
            }
          })
          return next
        })
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isLoading)
        filtered.push({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          createdAt: new Date(),
          extra: Array.from(nodeResults.values()),
        })
        return filtered
      })
      setIsWaitingForResponse(false)
      setActiveNodeIds(new Set())
    },
    [nodeResults, activeNodeIds],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !pipeline?.id || isWaitingForResponse) return

    const userMessage: ProgressMessage = {
      id: `user-${Date.now().toString()}`,
      content: input,
      role: 'user',
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsWaitingForResponse(true)
    setActiveNodeIds(new Set())
    setNodeResults(new Map())
    setProgressingMessage(undefined)

    // SSE 연결 설정
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/reasoning-pipelines/test/stream?pipelineId=${pipeline.id}&input=${encodeURIComponent(input)}`,
    )

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'start':
          console.log('파이프라인 실행 시작:', data.message)
          break

        case 'node-start':
          handleNodeStart(data)
          break

        case 'node-complete':
          handleNodeComplete(data)
          break

        case 'complete':
          handleComplete(data)
          eventSource.close()
          break

        case 'error':
          handleError(data)
          eventSource.close()
          break
      }
    }

    eventSource.onerror = () => {
      handleError({
        message: '파이프라인 실행 중 오류가 발생했습니다.',
      })
      eventSource.close()
    }
  }

  const handleCreateNewPipeline = async () => {
    if (!agent.id) return

    try {
      const newPipeline = await api.createReasoningPipeline({
        name: `${agent.name}의 추론 파이프라인`,
        agentId: agent.id,
        description: '새로운 추론 파이프라인',
        nodes: [
          {
            id: 'input-1',
            type: 'input',
            position: { x: 200, y: 100 },
            data: {
              name: '입력',
              description: '사용자 입력',
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
    <div className="px-4 flex flex-col h-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:h-[calc(100vh-12rem)] h-full">
        <div className="rounded-lg overflow-hidden col-span-2 shadow-lg">
          {pipeline ? (
            <PipelineCanvas
              pipeline={pipeline}
              onUpdate={onUpdate}
              activeNodeIds={activeNodeIds}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <button
                onClick={handleCreateNewPipeline}
                className="btn btn-primary"
              >
                <PlusIcon className="h-5 w-5" /> New Reasoning Pipeline
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="font-medium">Test Thread</h3>
          <div className="flex-1">
            <ChatPannel
              agent={agent}
              messages={messages}
              progressingMessage={progressingMessage}
              isWaitingForResponse={isWaitingForResponse}
              handleSubmit={handleSubmit}
              input={input}
              setInput={setInput}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
