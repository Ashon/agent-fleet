import { useEffect, useMemo, useRef, useState } from 'react'
import { Edge } from './edge'
import { Group } from './group'
import {
  BoundingRect,
  DisplayEdge,
  DisplayGroup,
  DisplayNode,
  Point,
} from './types'
import { getNodesBound, getPathData, getViewportCenter } from './utils'

type MinimapProps = {
  width: number
  height: number
  padding?: number
  groups: DisplayGroup[]
  nodes: DisplayNode[]
  edges: DisplayEdge[]
  container: HTMLElement | null
  viewOffset: Point
  zoomScale: number
}

const calculateMinimapViewport = (
  container: HTMLElement | null,
  viewOffset: Point,
  zoomScale: number,
): BoundingRect => {
  if (!container) return { x: 0, y: 0, width: 0, height: 0 }

  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  // 실제 보이는 영역의 중심점 (스케일과 오프셋 고려)
  const visibleCenterX = -viewOffset.x / zoomScale
  const visibleCenterY = -viewOffset.y / zoomScale

  // 보이는 영역의 크기 (스케일 고려)
  const visibleWidth = containerWidth / zoomScale
  const visibleHeight = containerHeight / zoomScale

  const newViewport: BoundingRect = {
    x: visibleCenterX + visibleWidth * 0.5,
    y: visibleCenterY + visibleHeight * 0.5,
    width: visibleWidth,
    height: visibleHeight,
  }

  return newViewport
}

export default function Minimap({
  width,
  height,
  groups,
  nodes,
  edges,
  container,
  viewOffset,
  zoomScale,
  padding = 10,
}: MinimapProps) {
  const minimapRef = useRef(null)
  const [minimapContainer, setMinimapContainer] = useState<HTMLElement | null>(
    null,
  )

  const getNodeWhRatio = (node: DisplayNode) => {
    const nodeElement =
      container?.querySelector(`div[data-node-id="${node.id}"]`) ||
      container?.querySelector(`[data-node-id="${node.id}"]`)

    if (!nodeElement) return { width: 0, height: 0 }

    const rect = nodeElement.getBoundingClientRect()

    return {
      width: rect.width / rect.height,
      height: 1,
    }
  }

  const viewport = calculateMinimapViewport(container, viewOffset, zoomScale)

  const nodesBound = getNodesBound(nodes)

  // 캔버스의 실제 크기 계산
  const canvasWidth = container?.clientWidth || 0
  const canvasHeight = container?.clientHeight || 0

  // 노드 바운딩 박스와 캔버스 크기를 모두 고려한 스케일 계산
  const contentWidth = Math.max(nodesBound.width, canvasWidth)
  const contentHeight = Math.max(nodesBound.height, canvasHeight)

  const minimapScaleX =
    contentWidth === 0 ? 1 : (width - padding) / contentWidth
  const minimapScaleY =
    contentHeight === 0 ? 1 : (height - padding) / contentHeight
  const minimapScale = Math.min(minimapScaleX, minimapScaleY)
  const scaledPadding = padding * minimapScale

  const minimapCenter = getViewportCenter(
    {
      clientWidth: width + scaledPadding,
      clientHeight: height + scaledPadding,
    } as HTMLElement,
    nodes,
    minimapScale,
  )

  const minimapViewport = useMemo(() => {
    return {
      x: viewport.x * minimapScale + minimapCenter.x,
      y: viewport.y * minimapScale + minimapCenter.y,
      width: viewport.width * minimapScale,
      height: viewport.height * minimapScale,
    }
  }, [viewport, minimapScale, minimapCenter])

  useEffect(() => {
    if (!minimapRef.current) return
    setMinimapContainer(minimapRef.current)
  }, [])

  return (
    <div
      className={[
        'absolute',
        'bottom-2',
        'right-2',
        'border',
        'border-gray-500/20',
        'rounded-md',
        'overflow-hidden',
        'shadow-lg',
        'bg-background',
      ].join(' ')}
      style={{ width, height }}
    >
      <svg ref={minimapRef} className="absolute w-full h-full">
        <g className="group-layer">
          {groups.map((group) => (
            <Group
              key={group.name}
              group={group}
              scale={minimapScale}
              viewOffset={minimapCenter}
              color={'var(--color-gray-600)'}
              padding={{ x: 20, y: 20 }}
              drawText={false}
            />
          ))}
        </g>
        <g className="edge-group">
          {edges.map((edge: DisplayEdge) => (
            <Edge
              key={`${edge.source_id}-${edge.target_id}`}
              edge={edge}
              scale={minimapScale}
              viewOffset={minimapCenter}
              pathAnchorSolver={getPathData}
              container={minimapContainer}
              drawText={false}
              animationDisabled={true}
            />
          ))}
        </g>
        <g className="node-group">
          {nodes.map((node: DisplayNode) => {
            const bound = getNodeWhRatio(node)
            return (
              <rect
                data-node-id={node.id}
                className="minimap-node stroke-gray-600 fill-background"
                key={node.id}
                x={
                  ((node.x || 0) - (100 * bound.width) / 2) * minimapScale +
                  minimapCenter.x
                }
                y={
                  ((node.y || 0) - (100 * bound.height) / 2) * minimapScale +
                  minimapCenter.y
                }
                width={100 * bound.width * minimapScale}
                height={100 * bound.height * minimapScale}
                strokeWidth={1}
              />
            )
          })}
        </g>
      </svg>

      <div
        className="absolute rounded-md border border-blue-300/20 bg-blue-500/10"
        style={{
          width: minimapViewport.width,
          height: minimapViewport.height,
          transform: [
            'translate(-50%, -50%)',
            `translateX(${minimapViewport.x}px)`,
            `translateY(${minimapViewport.y}px)`,
          ].join(' '),
        }}
      />
    </div>
  )
}
