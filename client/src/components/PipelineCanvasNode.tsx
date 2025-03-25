import { PipelineNode } from '@agentfleet/types'
import {
  Code,
  FileText,
  LoaderCircle,
  Maximize2Icon,
  MessageCircleIcon,
  Minimize2Icon,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface PipelineCanvasNodeProps {
  node: PipelineNode
  selectedNode: string | null
  activeNodeIds: Set<string>
  nodeResults: Record<string, { status: string; output: string }>
  setSelectedNode: (node: string | null) => void
  onNodeClick?: (node: PipelineNode) => void
}

export function PipelineCanvasNode({
  node,
  selectedNode,
  activeNodeIds,
  nodeResults,
  setSelectedNode,
  onNodeClick,
}: PipelineCanvasNodeProps) {
  const [minimizeNode, setMinimizeNode] = useState(true)
  return (
    <div
      className={`
        node-container p-3 select-none shadow-sm rounded-lg bg-background border-2 hover:shadow-xl border-primary transition-shadow
        ${
          selectedNode === node.id
            ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background cursor-move'
            : 'cursor-pointer'
        }
      `}
      onClick={() => {
        setSelectedNode(node.id)
        onNodeClick?.(node)
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <div className="text-xs font-medium opacity-80">
                {node.data.name}
              </div>
              {activeNodeIds.has(node.id) ? (
                <LoaderCircle className="animate-spin w-3 h-3" />
              ) : (
                nodeResults[node.id] && (
                  <div
                    className={`
                    w-3 h-3 rounded-full
                    ${
                      nodeResults[node.id].status === 'success'
                        ? 'bg-green-500'
                        : nodeResults[node.id].status === 'error'
                          ? 'bg-red-500'
                          : nodeResults[node.id].status === 'running'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                    }
                  `}
                  />
                )
              )}
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="cursor-pointer size-6"
                      variant="ghost"
                      onClick={() => setMinimizeNode(!minimizeNode)}
                    >
                      {minimizeNode ? <Maximize2Icon /> : <Minimize2Icon />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {minimizeNode ? '크게 보기' : '작게 보기'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <div className="text-xs opacity-60 line-clamp-2">
          {node.data.description}
        </div>

        {!minimizeNode && (
          <>
            <div className="flex flex-col gap-1">
              {node.data.config?.contextSources?.map((source) => (
                <div
                  key={source.connectorId}
                  className="mt-1 flex flex-col gap-1 text-xs border-2 p-1 shadow-lg rounded-md border-yellow-500"
                >
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Context: {source.connectorId}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-1 flex items-center gap-1 text-xs border-2 p-1 shadow-lg rounded-md border-blue-500">
              <MessageCircleIcon className="w-4 h-4 text-blue-500" />
              <div className="flex items-center gap-1">
                Template: {node.data.config?.templateId}
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-1 text-xs border-2 p-1 shadow-lg rounded-md border-green-500">
              {node.data.config?.contextMapping?.output?.map((output) => (
                <div key={output} className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-green-500" />
                  {output}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
