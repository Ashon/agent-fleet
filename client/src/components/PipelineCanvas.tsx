import { getNodeStyle } from '@/utils/nodeUtils'
import {
  Pipeline,
  PipelineNode,
  PipelineNode as PipelineNodeType,
} from '@agentfleet/types'
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
  BeakerIcon,
  BoltIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import GraphCanvas from './graphCanvas/graph'
import { GraphEdge, GraphNode } from './graphCanvas/types'

const getNodeIcon = (type: PipelineNodeType['type']) => {
  switch (type) {
    case 'input':
      return <ArrowDownTrayIcon className="h-5 w-5 text-blue-500" />
    case 'plan':
      return <DocumentTextIcon className="h-5 w-5 text-green-500" />
    case 'decision':
      return <ArrowPathRoundedSquareIcon className="h-5 w-5 text-yellow-500" />
    case 'action':
      return <BoltIcon className="h-5 w-5 text-red-500" />
    case 'process':
      return <BeakerIcon className="h-5 w-5 text-purple-500" />
    case 'aggregator':
      return <ArchiveBoxIcon className="h-5 w-5 text-orange-500" />
    case 'analysis':
      return <ChartBarIcon className="h-5 w-5 text-indigo-500" />
    default:
      return null
  }
}
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
          p-3 select-none shadow-lg border-2 rounded-lg bg-base-100 border-2
          ${getNodeStyle(node)}
          ${
            selectedNode === node.id
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
              : ''
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
              {getNodeIcon(node.type)}
              <div className="text-xs font-medium opacity-80">{node.type}</div>
            </div>
            <div className="flex items-center gap-1 w-5">
              {activeNodeIds.has(node.id) && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
            </div>
          </div>

          <div className="text-sm font-medium truncate">{node.data.name}</div>
          <div className="text-xs opacity-60 line-clamp-2">
            {node.data.description}
          </div>

          {nodeResults[node.id] && (
            <div className="absolute bottom-2 left-3 right-3">
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`
                  w-2 h-2 rounded-full
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
                <div className="opacity-60">{nodeResults[node.id].status}</div>
              </div>
              <div className="text-xs opacity-60 truncate mt-1">
                {nodeResults[node.id].output}
              </div>
            </div>
          )}
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
