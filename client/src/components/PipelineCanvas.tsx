import { Pipeline } from '@agentfleet/types'
import NodeGraph from './graphCanvas/graph'
import { GraphEdge, GraphNode } from './graphCanvas/types'

interface PipelineCanvasProps {
  pipeline: Pipeline
  onUpdate: (pipeline: Pipeline) => void
  activeNodeIds?: Set<string>
  nodeResults?: Record<string, { status: string; output: string }>
}

export default function PipelineCanvas({
  pipeline,
  onUpdate,
  activeNodeIds = new Set(),
  nodeResults = {},
}: PipelineCanvasProps) {
  const nodes: GraphNode[] = pipeline.nodes.map((node) => ({
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    data: node,
    render: () => (
      <div
        className={`p-4 rounded-lg shadow-lg ${
          activeNodeIds.has(node.id)
            ? 'bg-primary text-primary-content'
            : 'bg-base-100'
        }`}
      >
        <div className="text-xs">
          {node.type} {node.data.name}
        </div>
        <div className="text-sm">{node.data.description}</div>
        {nodeResults[node.id] && (
          <div className="mt-2">
            <div className="text-xs">Status: {nodeResults[node.id].status}</div>
            <div className="text-xs truncate">
              Output: {nodeResults[node.id].output}
            </div>
          </div>
        )}
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
      <NodeGraph
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
