import {
  PipelineEdge as PipelineEdgeType,
  PipelineNode,
} from '@agentfleet/types'
import { Point } from '../types/pipeline'
import { getConnectionPoints } from '../utils/edgeUtils'

interface PipelineEdgeProps {
  edge: PipelineEdgeType
  nodes: PipelineNode[]
  nodeRefs: Map<string, HTMLDivElement>
  activeNodeIds: Set<string>
  nodeResults?: Record<string, { status: string; output: string }>
}

export default function PipelineEdge({
  edge,
  nodes,
  nodeRefs,
  activeNodeIds,
  nodeResults = {},
}: PipelineEdgeProps) {
  const sourceNode = nodes.find((n) => n.id === edge.source)
  const targetNode = nodes.find((n) => n.id === edge.target)
  const sourceRef = nodeRefs.get(edge.source)
  const targetRef = nodeRefs.get(edge.target)

  if (!sourceNode || !targetNode || !sourceRef || !targetRef) {
    return null
  }

  // 노드의 중심점 계산
  const sourceCenter: Point = {
    x: sourceNode.position.x,
    y: sourceNode.position.y,
  }

  const targetCenter: Point = {
    x: targetNode.position.x,
    y: targetNode.position.y,
  }

  // edgeUtils의 getConnectionPoints를 사용하여 연결점과 제어점 계산
  const points = getConnectionPoints(
    sourceRef,
    targetRef,
    sourceCenter,
    targetCenter,
  )

  // 베지어 곡선 경로 생성
  const path = `M ${points.start.x} ${points.start.y} C ${points.sourceControl.x} ${points.sourceControl.y}, ${points.targetControl.x} ${points.targetControl.y}, ${points.end.x} ${points.end.y}`

  // 활성 상태 및 실행 상태에 따른 스타일 결정
  // const isSourceActive = activeNodeIds.has(edge.source)
  const isTargetActive = activeNodeIds.has(edge.target)
  const sourceResult = nodeResults[edge.source]
  const targetResult = nodeResults[edge.target]

  const getEdgeStyle = () => {
    // if (isSourceActive && isTargetActive) {
    //   return {
    //     strokeDasharray: '5,5',
    //     animation: 'dash 1s linear infinite',
    //   }
    // }
    // if (isSourceActive || isTargetActive) {
    if (isTargetActive) {
      return {
        strokeDasharray: '5,5',
        animation: 'dash 1s linear infinite',
      }
    }
    if (
      sourceResult?.status === 'success' &&
      targetResult?.status === 'success'
    ) {
      return {
        stroke: '#16a34a', // green-600
      }
    }
    if (sourceResult?.status === 'error' || targetResult?.status === 'error') {
      return {
        stroke: '#dc2626', // red-600
      }
    }
    if (edge.type === 'parallel') {
      return {
        stroke: '#d97706', // amber-600
        strokeDasharray: '5,5',
      }
    }
    if (edge.type === 'async') {
      return {
        stroke: '#0891b2', // cyan-600
        strokeDasharray: '3,3',
      }
    }
    return {
      stroke: '#6b7280', // gray-500
    }
  }

  const edgeStyle = getEdgeStyle()

  // 베지어 곡선의 중간 지점 계산 (t=0.5에서의 점)
  const getLabelPosition = () => {
    const t = 0.5 // 곡선의 중간 지점
    // 3차 베지어 곡선의 점 계산 공식 적용
    const x =
      Math.pow(1 - t, 3) * points.start.x +
      3 * Math.pow(1 - t, 2) * t * points.sourceControl.x +
      3 * (1 - t) * Math.pow(t, 2) * points.targetControl.x +
      Math.pow(t, 3) * points.end.x

    const y =
      Math.pow(1 - t, 3) * points.start.y +
      3 * Math.pow(1 - t, 2) * t * points.sourceControl.y +
      3 * (1 - t) * Math.pow(t, 2) * points.targetControl.y +
      Math.pow(t, 3) * points.end.y

    return { x, y: y - 15 } // 레이블을 곡선보다 약간 위에 배치
  }

  const labelPosition = getLabelPosition()

  return (
    <>
      <path
        d={path}
        fill="none"
        className="stroke-gray-500"
        strokeWidth={2}
        style={{
          ...edgeStyle,
          pointerEvents: 'none',
        }}
        markerEnd={`url(#arrowhead-${edge.type}-${edge.source}-${edge.target})`}
      />
      <defs>
        <marker
          id={`arrowhead-${edge.type}-${edge.source}-${edge.target}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          style={{ fill: edgeStyle.stroke }}
        >
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      {edge.type !== 'default' && (
        <text
          x={labelPosition.x}
          y={labelPosition.y}
          textAnchor="middle"
          fill={edgeStyle.stroke}
          style={{ fontSize: '10px' }}
        >
          {edge.type}
        </text>
      )}
    </>
  )
}

// 애니메이션을 위한 스타일 추가
const style = document.createElement('style')
style.textContent = `
@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}
`
document.head.appendChild(style)
