import { default as PipelineCanvas } from '@/components/PipelineCanvas'
import ChatPannel, { ChatMessageWithExtra } from '@/panels/ChatPannel'
import { api } from '@/services/api'
import { Agent, ChatMessage, Pipeline } from '@agentfleet/types'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'

interface ReasoningPipelineSettingsProps {
  agent: Agent
}

export default function ReasoningPipelineSettings({
  agent,
}: ReasoningPipelineSettingsProps) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !pipeline?.id || isWaitingForResponse) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsWaitingForResponse(true)

    api
      .testReasoningPipeline({
        pipelineId: pipeline.id,
        input: input,
      })
      .then((result) => {
        const assistantMessage: ChatMessageWithExtra = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.output,
          extra: (
            <div className="text-xs">
              <h3 className="font-medium">Execution Path</h3>
              <div className="flex flex-col gap-2 mt-2">
                {result.executionPath.map((step) => (
                  <div
                    key={step.nodeId}
                    className="border-l-2 border-gray-400/70 pl-2"
                  >
                    <h3 className="font-medium">{step.nodeId}</h3>
                    {step.output && <p>{step.output}</p>}
                    {step.status === 'error' && (
                      <p className="text-error">{step.status}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ),
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      })
      .catch((error) => {
        console.error('파이프라인 테스트 오류:', error)

        // 오류 메시지 추가
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '파이프라인 테스트 중 오류가 발생했습니다.',
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])
      })
      .finally(() => {
        setIsWaitingForResponse(false)
      })
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
          {
            id: 'plan-1',
            type: 'plan',
            position: { x: 200, y: 250 },
            data: {
              name: '계획',
              description: '작업 계획 수립',
            },
          },
          {
            id: 'decision-1',
            type: 'decision',
            position: { x: 200, y: 400 },
            data: {
              name: '결정',
              description: '다음 단계 결정',
            },
          },
          {
            id: 'action-1',
            type: 'action',
            position: { x: 200, y: 550 },
            data: {
              name: '행동',
              description: '최종 행동 실행',
            },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'input-1',
            target: 'plan-1',
            type: 'default',
          },
          {
            id: 'edge-2',
            source: 'plan-1',
            target: 'decision-1',
            type: 'default',
          },
          {
            id: 'edge-3',
            source: 'decision-1',
            target: 'action-1',
            type: 'default',
          },
        ],
      })

      setPipeline(newPipeline)
    } catch (error) {
      console.error('파이프라인 생성 오류:', error)
    }
  }

  return (
    <div className="px-4 flex flex-col h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[calc(100vh-12rem)] h-full">
        <div className="border border-gray-400/70 overflow-hidden">
          {pipeline ? (
            <PipelineCanvas
              pipeline={pipeline}
              onUpdate={(pipeline) => onUpdate(pipeline)}
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
          <ChatPannel
            agent={agent}
            messages={messages}
            isWaitingForResponse={isWaitingForResponse}
            handleSubmit={handleSubmit}
            input={input}
            setInput={setInput}
          />
        </div>
      </div>
    </div>
  )
}
