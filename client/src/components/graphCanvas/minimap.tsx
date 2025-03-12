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
import { groupColors } from './utils/color'

type MinimapProps = {
  width: number
  height: number
  padding?: number
  groups: DisplayGroup[]
  nodes: DisplayNode[]
  edges: DisplayEdge[]
  container: any
  viewOffset: Point
  zoomScale: number
}

const calculateMinimapViewport = (
  container: any,
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

  const getNodeSize = (node: DisplayNode) => {
    const nodeElement =
      container?.querySelector(`div[data-node-id="${node.id}"]`) ||
      container?.querySelector(`[data-node-id="${node.id}"]`)
    if (!nodeElement) return { width: 0, height: 0 }
    const rect = nodeElement.getBoundingClientRect()
    return {
      width: rect.width * minimapScale,
      height: rect.height * minimapScale,
    }
  }

  const viewport = calculateMinimapViewport(container, viewOffset, zoomScale)

  const nodesBound = getNodesBound(nodes)
  const minimapScaleX =
    nodesBound.width === 0 ? 1 : (width - padding) / nodesBound.width
  const minimapScaleY =
    nodesBound.height === 0 ? 1 : (height - padding) / nodesBound.height
  const minimapScale = Math.min(minimapScaleX, minimapScaleY)
  const scaledPadding = padding * minimapScale

  const minimapCenter = getViewportCenter(
    {
      clientWidth: width + scaledPadding,
      clientHeight: height + scaledPadding,
    },
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
        'bg-base-100',
      ].join(' ')}
      style={{ width, height }}
    >
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

      <svg ref={minimapRef} className="absolute w-full h-full">
        <g className="group-layer">
          {groups.map((group) => (
            <Group
              key={group.name}
              group={group}
              scale={minimapScale}
              viewOffset={minimapCenter}
              color={groupColors(group.name.toString())}
              padding={20}
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
            const bound = getNodeSize(node)
            return (
              <rect
                data-node-id={node.id}
                className="minimap-node"
                key={node.id}
                x={
                  (node.x || 0) * minimapScale -
                  bound.width / 2 +
                  minimapCenter.x
                }
                y={
                  (node.y || 0) * minimapScale -
                  bound.height / 2 +
                  minimapCenter.y
                }
                width={bound.width}
                height={bound.height}
                fill={
                  groups.find((g) => g.id === node.group)?.name.toString()
                    ? groupColors(
                        groups
                          .find((g) => g.id === node.group)
                          ?.name.toString() || '',
                      )
                    : '#eee'
                }
                stroke="#333"
                strokeWidth={1}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
