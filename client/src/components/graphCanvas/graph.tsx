import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { defaultEdgeStyle, SVG_ANIMATION_STYLE } from './constants'
import ContextMenu from './contextMenu'
import { Edge } from './edge'
import { Group } from './group'
import { useContextMenu, useMouseEvent, useTouchEvent } from './hooks'
import Minimap from './minimap'
import {
  BoundingRect,
  DisplayEdge,
  DisplayGroup,
  DisplayNode,
  GraphEdge,
  GraphNode,
  Point,
} from './types'
import { getGraphCenter, getNodesBound, getPathData } from './utils'

type NodeGraphProps = {
  nodes?: GraphNode[]
  edges?: GraphEdge[]
  zoomRange?: number[]
  onNodesChange?: (nodes: GraphNode[]) => void
  minimap?: {
    enabled?: boolean
    scale?: number
    width?: number
    height?: number
    padding?: number
  }
}

type DragEvent = {
  subject: any
  x: number
  y: number
}

type ZoomEvent = {
  scale: number
  x: number
  y: number
}

function GraphCanvas({
  nodes,
  edges,
  onNodesChange,
  zoomRange = [0.1, 2],
  minimap = {
    enabled: true,
    scale: 0.15,
    width: 200,
    height: 200,
    padding: 50,
  },
}: NodeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLayoutReady, setIsLayoutReady] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [hoverRef, setHoverRef] = useState<DisplayNode | null>(null)
  const [viewOffset, setViewOffset] = useState<Point>({ x: 0, y: 0 })
  const [minZoomScale, maxZoomScale] = zoomRange
  const [zoomScale, setZoomScale] = useState(1)

  const contextMenuRef = useRef<HTMLDivElement>(null)
  const contextMenuBound = useMemo<BoundingRect>(() => {
    if (!contextMenuRef.current) return { x: 0, y: 0, width: 0, height: 0 }
    return contextMenuRef.current.getBoundingClientRect() as BoundingRect
  }, [])
  const { contextMenu, handleContextMenu } = useContextMenu(contextMenuBound)

  // Memoize display nodes
  const displayNodes = useMemo<DisplayNode[]>(() => {
    if (!nodes) return []
    return nodes.map((n) => ({
      id: n.id,
      group: n.group,
      x: n.x || 0,
      y: n.y || 0,
      data: n,
      style: n.style,
    }))
  }, [nodes])

  // Initialize layout first
  useEffect(() => {
    if (displayNodes.length > 0 && !isLayoutReady && containerRef.current) {
      const { width: containerWidth, height: containerHeight } =
        containerRef.current.getBoundingClientRect()
      const center = getGraphCenter(displayNodes)
      const bounds = getNodesBound(displayNodes)

      // 패딩을 포함한 그래프의 실제 크기 계산 (노드 크기도 고려)
      const maxNodeWidth = Math.max(
        ...displayNodes.map((n) => n.style?.width || 50),
      )
      const maxNodeHeight = Math.max(
        ...displayNodes.map((n) => n.style?.height || 50),
      )
      const horizontalPadding = Math.max(maxNodeWidth * 2, 100) // 노드 크기에 따른 최소 패딩
      const verticalPadding = Math.max(maxNodeHeight * 2, 100)

      const graphWidth = bounds.width + horizontalPadding
      const graphHeight = bounds.height + verticalPadding

      // 컨테이너에 맞는 줌 레벨 계산 (여유 공간 확보)
      const widthRatio = (containerWidth * 0.99) / graphWidth // 1% 여유 공간
      const heightRatio = (containerHeight * 0.99) / graphHeight
      const newZoomScale = Math.min(widthRatio, heightRatio, maxZoomScale)
      const finalZoomScale = Math.max(newZoomScale, minZoomScale)

      // 상태 업데이트를 Promise로 처리
      Promise.all([
        new Promise<void>((resolve) => {
          setZoomScale(finalZoomScale)
          resolve()
        }),
        new Promise<void>((resolve) => {
          setViewOffset({
            x: containerWidth / 2 - center.x * finalZoomScale,
            y: containerHeight / 2 - center.y * finalZoomScale,
          })
          resolve()
        }),
      ]).then(() => {
        setIsLayoutReady(true)
      })
    }
  }, [displayNodes, isLayoutReady, minZoomScale, maxZoomScale])

  // Wait for layout and zoom to be ready
  useEffect(() => {
    if (isLayoutReady && zoomScale !== 1) {
      // 모든 초기 레이아웃이 준비된 후 초기화 완료
      setIsInitialized(true)
    }
  }, [isLayoutReady, zoomScale])

  // Memoize display edges with initialization check
  const displayEdges = useMemo<DisplayEdge[]>(() => {
    if (!edges || !displayNodes.length || !isInitialized) return []

    return edges
      .map((edge): DisplayEdge | null => {
        const source = displayNodes.find((n) => n.id === edge.source)
        const target = displayNodes.find((n) => n.id === edge.target)

        if (!source || !target) return null

        return {
          source_id: source.id,
          target_id: target.id,
          source,
          target,
          type: edge.type || 'solid',
          directed: edge.directed || false,
          text: edge.text || '',
          style: {
            ...defaultEdgeStyle,
            ...edge.style,
          },
          state: {
            isActive: hoverRef?.id === source.id || hoverRef?.id === target.id,
          },
        }
      })
      .filter((edge): edge is DisplayEdge => edge !== null)
  }, [edges, displayNodes, hoverRef, isInitialized])

  // Edge view props with initialization check
  const edgeViewProps = useMemo(
    () => ({
      scale: zoomScale,
      viewOffset,
      isGraphInitialized: isInitialized,
    }),
    [zoomScale, viewOffset, isInitialized],
  )

  // Memoize display groups
  const displayGroups = useMemo<DisplayGroup[]>(() => {
    const nodesByGroup = displayNodes.reduce(
      (acc: { [key: string]: DisplayNode[] }, n: DisplayNode) => {
        if (n.group) {
          if (!acc[n.group]) {
            acc[n.group] = []
          }
          acc[n.group].push(n)
        }
        return acc
      },
      {} as { string: DisplayNode[] },
    )

    return Object.entries(nodesByGroup)
      .map(([group, nodes]) => {
        const bound = getNodesBound(nodes)
        return {
          id: group,
          name: group,
          nodes,
          ...bound,
          style: {
            color: 'var(--color-gray-600)',
          },
        }
      })
      .filter((g: any) => g.nodes.length > 1) as DisplayGroup[]
  }, [displayNodes])

  // Memoize rendered nodes
  const memoizedRenderedNodes = useMemo(() => {
    if (!nodes) return {}
    return nodes.reduce(
      (acc: { [key: string]: React.ReactNode }, n: GraphNode) => {
        acc[n.id] = n.render?.(n.data)
        return acc
      },
      {},
    )
  }, [nodes])

  const onDrag = useCallback(
    ({ subject, x, y }: DragEvent) => {
      const updatedNodes = displayNodes.map((n) =>
        n.id === subject ? { ...n, x, y } : n,
      )
      onNodesChange?.(updatedNodes)
    },
    [displayNodes, onNodesChange],
  )

  const onPanning = useCallback(({ x, y }: Point) => {
    setViewOffset((prev) => ({ x: prev.x + x, y: prev.y + y }))
  }, [])

  const onZoom = useCallback(({ scale, x, y }: ZoomEvent) => {
    setZoomScale(scale)
    setViewOffset({ x, y })
  }, [])

  const {
    onNodeMouseDown,
    handleWheel,
    onBackgroundMouseDown,
    onMouseMove,
    onMouseUp,
  } = useMouseEvent({
    containerRef,
    displayNodes,
    zoomScale,
    viewOffset,
    minZoomScale,
    maxZoomScale,
    onDrag,
    onPanning,
    onZoom,
  })

  const {
    handleTouchStart,
    handleTouchMove,
    onNodeTouchStart,
    handleTouchEnd,
  } = useTouchEvent({
    containerRef,
    displayNodes,
    zoomScale,
    viewOffset,
    onDrag,
    onPanning,
  })

  return (
    <div className="relative w-full h-full overflow-hidden bg-base-100">
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onContextMenu={handleContextMenu}
        onMouseDown={onBackgroundMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <svg
          className="inset-0 w-full flex-1 pointer-events-none main-svg bg-base-100"
          style={{
            height: '100%',
            backgroundImage:
              'radial-gradient(color-mix(in srgb, var(--color-gray-600) 30%, transparent) 1px, transparent 1px)',
            backgroundPosition: `${viewOffset.x % (16 * zoomScale)}px ${viewOffset.y % (16 * zoomScale)}px`,
            backgroundSize: `${16 * zoomScale}px ${16 * zoomScale}px`,
          }}
        >
          <style>{SVG_ANIMATION_STYLE}</style>
          <g className="edge-layer">
            {displayEdges.map((edge) => (
              <Edge
                key={`${edge.source_id}-${edge.target_id}`}
                edge={edge}
                pathAnchorSolver={getPathData}
                container={containerRef.current}
                {...edgeViewProps}
              />
            ))}
          </g>
          <g className="group-layer">
            {displayGroups.map((group) => (
              <Group
                key={group.name}
                group={group}
                scale={zoomScale}
                viewOffset={viewOffset}
                color={group.style?.color || ''}
                padding={{
                  x: Math.max(...group.nodes.map((n) => n.style?.width || 10)),
                  y: Math.max(...group.nodes.map((n) => n.style?.height || 10)),
                }}
              />
            ))}
          </g>
          <g className="node-text-layer">
            {displayNodes.map((node) => (
              <text
                key={node.id}
                className="stroke-base-100 fill-current"
                dominantBaseline="hanging"
                textAnchor="middle"
                strokeWidth="4"
                paintOrder="stroke"
                strokeLinejoin="round"
                fontSize={8 * zoomScale}
                fontWeight="bold"
                x={node.x * zoomScale + viewOffset.x}
                y={(node.y - 20) * zoomScale + viewOffset.y}
              >
                {node.id}
              </text>
            ))}
          </g>
        </svg>

        <div className={'absolute inset-0 pointer-events-none'}>
          {displayNodes.map((node) => (
            <div
              key={node.id}
              data-node-id={node.id}
              className="absolute cursor-move select-none"
              style={{
                transformOrigin: 'center',
                transform: [
                  'translate(-50%, -50%)',
                  `translateX(${node.x * zoomScale + viewOffset.x}px)`,
                  `translateY(${node.y * zoomScale + viewOffset.y}px)`,
                  `scale(${zoomScale})`,
                ].join(' '),
                touchAction: 'none',
                pointerEvents: 'auto',
              }}
              onMouseDown={(e) => onNodeMouseDown(e, node.id, zoomScale)}
              onTouchStart={(e) => onNodeTouchStart(e, node.id, zoomScale)}
              onMouseEnter={() => {
                setHoverRef(node)
              }}
              onMouseLeave={() => {
                setHoverRef(null)
              }}
            >
              {memoizedRenderedNodes[node.id]}
            </div>
          ))}
        </div>
      </div>

      <ContextMenu ref={contextMenuRef} state={contextMenu}>
        <ContextMenu.Item text="컨텍스트 메뉴 테스트 중" />
        <ContextMenu.Item text="메뉴 항목 1" />
        <ContextMenu.Item text="메뉴 항목 2" />
        <ContextMenu.Divider />
        <ContextMenu.Item text="메뉴 항목 3" />
      </ContextMenu>

      {minimap.enabled && (
        <Minimap
          width={
            minimap.width ||
            (containerRef?.current as any)?.clientWidth *
              (minimap.scale || 0.15)
          }
          height={
            minimap.height ||
            (containerRef?.current as any)?.clientHeight *
              (minimap.scale || 0.15)
          }
          groups={displayGroups}
          nodes={displayNodes}
          edges={displayEdges}
          container={containerRef.current}
          viewOffset={viewOffset}
          zoomScale={zoomScale}
          padding={minimap.padding || 10}
        />
      )}
    </div>
  )
}

export default GraphCanvas
