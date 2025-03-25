import Code from '@/components/Code'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Agent, ChatMessage } from '@agentfleet/types'
import {
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  SendIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type ChatMessageWithExtra = ChatMessage & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra?: any
}

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]'
      }
      seen.add(value)
    }
    return value
  }
}

type ChatPannelProps = {
  messages: ChatMessageWithExtra[]
  progressingMessage?: ChatMessageWithExtra
  isWaitingForResponse: boolean
  handleSubmit: (e: React.FormEvent) => void
  input: string
  setInput: (input: string) => void
  agent: Agent
}

function ChatMessagePanel({
  agent,
  message,
  isLoading,
}: {
  agent: Agent
  message: ChatMessageWithExtra
  isLoading?: boolean
}) {
  return (
    <div key={message.id} className="flex flex-col gap-1 mb-4">
      <div className="text-xs text-foreground/40">{message.id}</div>
      <div
        className={`py-2 px-4 ${
          message.role === 'user'
            ? 'bg-background border-l-[3px] border-primary'
            : 'bg-background border-l-[3px] border-secondary'
        }`}
      >
        <div className="flex items-center gap-1 text-xs text-foreground">
          <span>{message.role === 'user' ? 'You' : agent.name}</span>
          <span>•</span>
          <span>
            {isLoading ? (
              <div className="flex items-center gap-1">
                <LoaderCircle className="animate-spin w-4 h-4" />
                typing...
              </div>
            ) : (
              new Date(message.createdAt).toLocaleTimeString()
            )}
          </span>
        </div>
        {message.extra && (
          <div className="my-2 flex flex-col gap-1">
            {Array.isArray(message.extra) ? (
              message.extra.map((item) => (
                <div
                  key={item.nodeId}
                  className="text-xs flex items-center justify-between"
                >
                  <Collapsible className="overflow-x-auto">
                    <div className="flex gap-1 items-center">
                      {item.status === 'success' ? (
                        <div className="font-bold text-success">
                          <CircleCheck className="w-4 h-4" />
                        </div>
                      ) : item.status === 'error' ? (
                        <div className="font-bold text-error">
                          <CircleAlert className="w-4 h-4" />
                        </div>
                      ) : (
                        <div>
                          <LoaderCircle className="animate-spin w-4 h-4" />
                        </div>
                      )}
                      <div className="font-bold">
                        {item.nodeId} {item.nodeName}
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                        >
                          <ChevronsUpDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <div className="text-xs mt-1">
                        <Code
                          code={JSON.stringify(item, getCircularReplacer(), 2)}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))
            ) : (
              <div className="mb-1">{message.extra}</div>
            )}
          </div>
        )}
        {typeof message.content === 'string'
          ? message.content
          : !isLoading && (
              <Code
                code={JSON.stringify(message.content, getCircularReplacer(), 2)}
              />
            )}
      </div>
    </div>
  )
}

export function ChatPannel({
  messages,
  progressingMessage,
  isWaitingForResponse,
  handleSubmit,
  input,
  setInput,
  agent,
}: ChatPannelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)

  // ResizeObserver를 사용하여 컨테이너 크기 변경 감지
  useEffect(() => {
    if (!chatContainerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 컨테이너 높이 업데이트
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(chatContainerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // 메시지가 추가되면 스크롤을 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      // 부드러운 스크롤 대신 즉시 스크롤 (더 안정적)
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
    }
  }, [messages, containerHeight])

  return (
    <div
      ref={chatContainerRef}
      className="flex flex-col h-full"
      style={{ minHeight: '300px' }}
    >
      {/* Chat Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 relative"
      >
        <div className="absolute w-full">
          {messages.map((message) => (
            <ChatMessagePanel
              key={message.id}
              agent={agent}
              message={message}
            />
          ))}

          {isWaitingForResponse &&
            (progressingMessage ? (
              <ChatMessagePanel
                agent={agent}
                message={progressingMessage}
                isLoading
              />
            ) : (
              <ChatMessagePanel
                agent={agent}
                message={{
                  id: 'progressing',
                  role: 'assistant',
                  content: <LoaderCircle className="animate-spin" />,
                  createdAt: new Date(),
                }}
                isLoading
              />
            ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            className="input input-bordered flex-1"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isWaitingForResponse}
          />
          <Button
            type="submit"
            variant="default"
            disabled={isWaitingForResponse || !input.trim()}
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
