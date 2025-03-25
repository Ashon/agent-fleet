import { Pipeline, PipelineNode } from '@agentfleet/types'
import { useState } from 'react'
import GraphCanvas from './graphCanvas/graph'
import { GraphEdge, GraphNode } from './graphCanvas/types'
import { PipelineCanvasNode } from './PipelineCanvasNode'

interface PipelineCanvasProps {
  pipeline: Pipeline
  onUpdate: (pipeline: Pipeline) => void
  activeNodeIds?: Set<string>
  nodeResults?: Record<string, { status: string; output: string }>
  onNodeClick?: (node?: PipelineNode) => void
  contextMenu?: {
    enabled: boolean
    items: {
      type: 'menu' | 'divider'
      text?: string
      onClick?: () => void
    }[]
  }
}

export default function PipelineCanvas({
  pipeline,
  onUpdate,
  onNodeClick,
  activeNodeIds = new Set(),
  nodeResults = {},
  contextMenu,
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
      <PipelineCanvasNode
        node={node}
        selectedNode={selectedNode}
        activeNodeIds={activeNodeIds}
        nodeResults={nodeResults}
        setSelectedNode={setSelectedNode}
        onNodeClick={onNodeClick}
      />
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

  const handleCanvasClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.node-container')) {
      return
    }
    onNodeClick?.(undefined)
    setSelectedNode(null)
  }

  return (
    <div className="h-full bg-background" onClick={handleCanvasClick}>
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        contextMenu={contextMenu}
        minimap={{
          enabled: true,
          width: 150,
          height: 150,
          padding: 30,
        }}
      />
    </div>
  )
}
