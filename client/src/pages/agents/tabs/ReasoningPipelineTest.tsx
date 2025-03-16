import ChatPannel, { ChatMessageWithExtra } from '@/panels/ChatPannel'
import { api } from '@/services/api'
import { Agent, NodeExecutionResult, Pipeline } from '@agentfleet/types'
import { useCallback, useEffect, useState } from 'react'

// ChatMessageWithExtra 타입 확장
interface ProgressMessage extends ChatMessageWithExtra {
  isLoading?: boolean
  extra?: NodeExecutionResult[]
  nodeId?: string
  nodeName?: string
  nodeType?: string
  input?: string | Record<string, any>
  variables?: Record<string, any>
}

const NODE_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const

interface ReasoningPipelineTestProps {
  agent: Agent
  pipeline: Pipeline | null
  onActiveNodeIdsChange: (activeNodeIds: Set<string>) => void
  onNodeResultsChange: (
    nodeResults: Record<string, NodeExecutionResult>,
  ) => void
}

export function ReasoningPipelineTest({
  agent,
  pipeline,
  onActiveNodeIdsChange,
  onNodeResultsChange,
}: ReasoningPipelineTestProps) {
  const [messages, setMessages] = useState<ProgressMessage[]>([])
  const [input, setInput] = useState('')
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set())
  const [nodeResults, setNodeResults] = useState<
    Map<string, NodeExecutionResult>
  >(new Map())
  const [progressingMessage, setProgressingMessage] = useState<
    ProgressMessage | undefined
  >(undefined)

  // 노드 시작 처리
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeStart = useCallback((completionId: string, data: any) => {
    const result: NodeExecutionResult = {
      nodeId: data.nodeId,
      nodeName: data.nodeName,
      nodeType: data.nodeType,
      status: NODE_STATUS.RUNNING,
      input: data.input,
      output: data.output,
      startTime: data.startTime,
      endTime: data.endTime,
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
      setProgressingMessage({
        id: completionId,
        role: 'assistant',
        content: `${data.nodeName} 노드 실행 중...`,
        createdAt: new Date(),
        isLoading: true,
        extra: Array.from(next.values()),
      })

      return next
    })
  }, [])

  // 노드 완료 처리
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeComplete = useCallback((completionId: string, data: any) => {
    const result: NodeExecutionResult = {
      nodeId: data.nodeId,
      nodeName: data.nodeName,
      nodeType: data.nodeType,
      status: NODE_STATUS.SUCCESS,
      output: data.output,
      input: data.input,
      startTime: data.startTime,
      endTime: data.endTime,
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
      setProgressingMessage({
        id: completionId,
        role: 'assistant',
        content: nextActiveNode
          ? `${nextActiveNode.nodeName} 노드 실행 중...`
          : '파이프라인 실행 완료 중...',
        createdAt: new Date(),
        isLoading: true,
        extra: Array.from(next.values()),
      })

      return next
    })
  }, [])

  // 실행 완료 처리
  const handleComplete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (completionId: string, data: any) => {
      setNodeResults((prev) => {
        console.log('handleComplete', data)

        const next = new Map(prev)
        // 모든 노드를 success 상태로 업데이트
        for (const [nodeId, result] of next.entries()) {
          next.set(nodeId, {
            ...result,
            status: NODE_STATUS.SUCCESS,
            output: result.output || data.output,
          })
        }

        // 최종 메시지에 완료된 노드 결과 포함
        setMessages((prevMessages) => [
          ...prevMessages.filter((m) => m.id !== completionId),
          {
            id: completionId,
            role: 'assistant',
            content: JSON.stringify(JSON.parse(data.output).completion),
            createdAt: new Date(),
            extra: Array.from(next.values()).map((result) => ({
              ...result,
              status: NODE_STATUS.SUCCESS,
            })),
          },
        ])

        return next
      })

      setProgressingMessage(undefined)
      setIsWaitingForResponse(false)
      setActiveNodeIds(new Set())
    },
    [],
  )

  // 에러 처리
  const handleError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (completionId: string, data: any) => {
      // 현재 실행 중인 노드가 있다면 에러 상태로 변경
      if (activeNodeIds.size > 0) {
        setNodeResults((prev) => {
          const next = new Map(prev)
          activeNodeIds.forEach((nodeId) => {
            const node = next.get(nodeId)
            if (node) {
              next.set(nodeId, {
                ...node,
                status: NODE_STATUS.FAILED,
              })
            }
          })
          return next
        })
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== completionId)
        filtered.push({
          id: completionId,
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
    const eventSource = await api.getReasoningPipelineStream(pipeline.id, input)
    const completionId = `completion-${Date.now()}`
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'start':
          console.log('파이프라인 실행 시작:', data.message)
          break

        case 'node-start':
          handleNodeStart(completionId, data)
          break

        case 'node-complete':
          handleNodeComplete(completionId, data)
          break

        case 'complete':
          handleComplete(completionId, data)
          eventSource.close()
          break

        case 'error':
          handleError(completionId, data)
          eventSource.close()
          break
      }
    }

    eventSource.onerror = () => {
      handleError(completionId, {
        message: '파이프라인 실행 중 오류가 발생했습니다.',
      })
      eventSource.close()
    }
  }

  useEffect(() => {
    onActiveNodeIdsChange(activeNodeIds)
  }, [activeNodeIds, onActiveNodeIdsChange])

  useEffect(() => {
    onNodeResultsChange(Object.fromEntries(nodeResults))
  }, [nodeResults, onNodeResultsChange])

  return (
    <div className="h-full pt-2">
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
  )
}
