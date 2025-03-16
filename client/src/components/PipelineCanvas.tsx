import { Pipeline, PipelineNode } from '@agentfleet/types'
import {
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import GraphCanvas from './graphCanvas/graph'
import { GraphEdge, GraphNode } from './graphCanvas/types'

interface PipelineCanvasProps {
  pipeline: Pipeline
  onUpdate: (pipeline: Pipeline) => void
  activeNodeIds?: Set<string>
  nodeResults?: Record<string, { status: string; output: string }>
  onNodeClick?: (node: PipelineNode) => void
}

export default function PipelineCanvas({
  pipeline,
  onUpdate,
  onNodeClick,
  activeNodeIds = new Set(),
  nodeResults = {},
}: PipelineCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const nodes: GraphNode[] = pipeline.nodes.map((node) => ({
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    data: node,
    style: {
      width: 200,
      height: 100,
    },
    render: () => (
      <div
        className={`
          p-3 select-none shadow-lg border-2 rounded-lg bg-base-100 border-2 hover:shadow-xl border-primary
          ${
            selectedNode === node.id
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 cursor-move'
              : 'cursor-pointer'
          }
        `}
        onClick={() => {
          setSelectedNode(node.id)
          onNodeClick?.(node)
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <CodeBracketIcon className="h-5 w-5 text-primary" />
              <div className="text-xs font-medium opacity-80">
                {node.data.name}
              </div>
            </div>
            <div className="flex items-center gap-1 w-3">
              {activeNodeIds.has(node.id) ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                nodeResults[node.id] && (
                  <div
                    className={`
                      w-3 h-3 rounded-full
                      ${
                        nodeResults[node.id].status === 'success'
                          ? 'bg-success'
                          : nodeResults[node.id].status === 'error'
                            ? 'bg-error'
                            : nodeResults[node.id].status === 'running'
                              ? 'bg-warning'
                              : 'bg-base-content/20'
                      }
                    `}
                  />
                )
              )}
            </div>
          </div>

          <div className="text-xs opacity-60 line-clamp-2">
            {node.data.description}
          </div>

          <div className="flex flex-col gap-1">
            {node.data.config?.contextSources?.map((source) => (
              <div
                key={source.connectorId}
                className="mt-1 flex flex-col gap-1 text-xs border-2 p-1 shadow-lg rounded-md border-yellow-500"
              >
                <div className="flex items-center gap-1">
                  <BoltIcon className="w-4 h-4 text-yellow-500" />
                  Context: {source.connectorId}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-1 flex items-center gap-1 text-xs border-2 p-1 shadow-lg rounded-md border-blue-500">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-500" />
            <div className="flex items-center gap-1">
              Template: {node.data.config?.templateId}
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-1 text-xs border-2 p-1 shadow-lg rounded-md border-green-500">
            {node.data.config?.contextMapping?.output?.map((output) => (
              <div key={output} className="flex items-center gap-1">
                <DocumentTextIcon className="w-4 h-4 text-green-500" />
                {output}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }))

  const edges: GraphEdge[] = pipeline.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    directed: true,
    type: 'solid',
  }))

  const handleNodesChange = (updatedNodes: GraphNode[]) => {
    const newPipeline: Pipeline = {
      ...pipeline,
      nodes: updatedNodes.map((node) => ({
        ...node.data.data,
        position: { x: node.x, y: node.y },
      })),
    }
    onUpdate(newPipeline)
  }

  return (
    <div className="w-full h-full bg-base-100">
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        minimap={{
          enabled: true,
          scale: 0.15,
          width: 100,
          height: 100,
          padding: 50,
        }}
      />
    </div>
  )
}
