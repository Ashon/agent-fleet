import { default as PipelineCanvas } from '@/components/PipelineCanvas'
import ChatPannel, { ChatMessageWithExtra } from '@/panels/ChatPannel'
import { api } from '@/services/api'
import { Agent, Pipeline } from '@agentfleet/types'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'

// ChatMessageWithExtra 타입 확장
interface ProgressMessage extends ChatMessageWithExtra {
  isLoading?: boolean
}

interface ReasoningPipelineSettingsProps {
  agent: Agent
}

export default function ReasoningPipelineSettings({
  agent,
}: ReasoningPipelineSettingsProps) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [messages, setMessages] = useState<ProgressMessage[]>([])
  const [input, setInput] = useState('')
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set())
  const [, setNodeResults] = useState<
    { nodeId: string; status: string; output: string }[]
  >([])

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

  const [progressingMessage, setProgressingMessage] = useState<
    ProgressMessage | undefined
  >(undefined)

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
    setNodeResults([])

    // SSE 연결 설정
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/reasoning-pipelines/test/stream?pipelineId=${pipeline.id}&input=${encodeURIComponent(input)}`,
    )

    eventSource.onmessage = (event) => {
      const messageId = `completion-${Date.now()}`
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'start':
          console.log('파이프라인 실행 시작:', data.message)
          break

        case 'node-start':
          setActiveNodeIds((prev) => {
            const next = new Set(prev)
            next.add(data.nodeId)
            return next
          })

          setNodeResults((prev) => {
            const newResults = [
              ...prev,
              {
                nodeId: data.nodeId,
                status: data.status,
                output: data.output,
              },
            ]

            setProgressingMessage({
              id: `progress-${Date.now()}`,
              role: 'assistant',
              content: '응답 생성 중...',
              createdAt: new Date(),
              extra: newResults,
            })

            return newResults
          })

          break

        case 'node-complete':
          setNodeResults((prev) => {
            const updatedResults = prev.map((result) => {
              if (result.nodeId === data.nodeId) {
                return {
                  ...result,
                  status: data.status,
                  output: data.output,
                }
              }
              return result
            })

            setProgressingMessage({
              id: `progress-${Date.now()}`,
              role: 'assistant',
              content: '응답 생성 중...',
              createdAt: new Date(),
              extra: updatedResults,
            })

            return updatedResults
          })

          setActiveNodeIds((prev) => {
            const next = new Set(prev)
            next.delete(data.nodeId)
            return next
          })

          break

        case 'complete':
          setProgressingMessage(undefined)
          console.log('complete', data)
          setNodeResults((prevResults) => {
            setMessages((prev) => {
              const excluded = prev.filter((m) => m.id !== messageId)
              excluded.push({
                id: messageId,
                role: 'assistant',
                content: data.message,
                createdAt: new Date(),
                extra: prevResults,
              })
              return excluded
            })

            return prevResults
          })

          setIsWaitingForResponse(false)
          setActiveNodeIds(new Set())
          eventSource.close()
          break

        case 'error':
          setMessages((prev) => {
            // 진행 중인 메시지 제거
            const filtered = prev.filter((m) => !m.isLoading)
            // 에러 메시지 추가
            filtered.push({
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: data.message,
              createdAt: new Date(),
            })
            return filtered
          })
          setIsWaitingForResponse(false)
          setActiveNodeIds(new Set())
          eventSource.close()
          break
      }
    }

    eventSource.onerror = () => {
      setMessages((prev) => {
        // 진행 중인 메시지 제거
        const filtered = prev.filter((m) => !m.isLoading)

        // 에러 메시지 추가
        filtered.push({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '파이프라인 실행 중 오류가 발생했습니다.',
          createdAt: new Date(),
        })
        return filtered
      })

      setIsWaitingForResponse(false)
      setActiveNodeIds(new Set())
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
