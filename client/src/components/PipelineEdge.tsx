import {
  PipelineEdge as PipelineEdgeType,
  PipelineNode,
} from '@agentfleet/types'
import React from 'react'
import { getConnectionPoints, getEdgeStyle } from '../utils/edgeUtils'

interface PipelineEdgeProps {
  edge: PipelineEdgeType
  nodes: PipelineNode[]
  nodeRefs: Map<string, HTMLDivElement>
  activeNodeId: string | null
  nodeResults: Record<string, { status: string; output: string }>
}

export default function PipelineEdge({
  edge,
  nodes,
  nodeRefs,
  activeNodeId,
  nodeResults,
}: PipelineEdgeProps) {
  const sourceNode = nodes.find((n) => n.id === edge.source)!
  const targetNode = nodes.find((n) => n.id === edge.target)!

  const sourceElement = nodeRefs.get(edge.source)
  const targetElement = nodeRefs.get(edge.target)

  if (!sourceElement || !targetElement) return null

  const sourceCenter = {
    x: sourceNode.position.x,
    y: sourceNode.position.y,
  }
  const targetCenter = {
    x: targetNode.position.x,
    y: targetNode.position.y,
  }

  const { start, end, sourceControl, targetControl } = getConnectionPoints(
    sourceElement,
    targetElement,
    sourceCenter,
    targetCenter,
  )

  const path = [
    `M ${start.x} ${start.y}`,
    `C ${sourceControl.x} ${sourceControl.y}`,
    `${targetControl.x} ${targetControl.y}`,
    `${end.x} ${end.y}`,
  ].join(' ')

  return (
    <>
      <defs>
        <marker
          id={`edgecircle-${edge.id}`}
          markerWidth="3"
          markerHeight="3"
          refX="1.5"
          refY="1.5"
          orient="auto-start-reverse"
          className={getEdgeStyle(edge, activeNodeId, nodeResults)}
        >
          <circle cx="1.5" cy="1.5" r="1.5" />
        </marker>
        <marker
          id={`arrowhead-${edge.id}`}
          markerWidth="6"
          markerHeight="6"
          refX="6"
          refY="3"
          orient="auto-start-reverse"
          className={getEdgeStyle(edge, activeNodeId, nodeResults)}
        >
          <polygon points="0 0, 6 3, 0 6" />
        </marker>
      </defs>
      <path
        d={path}
        className={getEdgeStyle(edge, activeNodeId, nodeResults)}
        strokeWidth="2"
        fill="none"
        markerStart={`url(#edgecircle-${edge.id})`}
        markerEnd={`url(#arrowhead-${edge.id})`}
      />
    </>
  )
}
