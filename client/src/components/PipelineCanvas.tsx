import { Pipeline, PipelineEdge, PipelineNode } from '@agentfleet/types'
import {
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
  BoltIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface PipelineCanvasProps {
  pipeline: Pipeline
  onUpdate: (pipeline: Pipeline) => void
  activeNodeId?: string | null
  nodeResults?: Record<string, { status: string; output: string }>
}

export default function PipelineCanvas({
  pipeline,
  onUpdate,
  activeNodeId,
  nodeResults = {},
}: PipelineCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [nodes, setNodes] = useState<PipelineNode[]>(pipeline.nodes)
  const [edges] = useState<PipelineEdge[]>(pipeline.edges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // 노드 변경 시에만 상태 업데이트
  const [nodesChanged, setNodesChanged] = useState(false)
  const updateNodePosition = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      let isChanged = false
      setNodes((prev) => {
        const changed = prev.map((n) =>
          n.id === nodeId ? { ...n, position } : n,
        )

        isChanged = changed.some(
          (n) =>
            n.position.x !== prev.find((p) => p.id === nodeId)?.position.x ||
            n.position.y !== prev.find((p) => p.id === nodeId)?.position.y,
        )

        setNodesChanged(isChanged)
        return changed
      })
    },
    [],
  )

  useEffect(() => {
    if (onUpdate && nodesChanged) {
      onUpdate({
        ...pipeline,
        nodes,
      })
      setNodesChanged(false)
    }
  }, [nodes, onUpdate, nodesChanged])

  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false)

    // 노드가 변경되었고 드래그가 끝났을 때만 업데이트
    if (nodesChanged && onUpdate) {
      onUpdate({
        ...pipeline,
        nodes,
      })
      setNodesChanged(false)
    }
  }, [nodesChanged, nodes, onUpdate, pipeline])

  // 캔버스 크기 업데이트
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (!isDragging) {
        setSelectedNode(nodeId)
      }
    },
    [isDragging],
  )

  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      if (!canvasRef.current) return

      const node = nodes.find((n) => n.id === nodeId)!
      const rect = canvasRef.current.getBoundingClientRect()
      const scrollLeft = canvasRef.current.scrollLeft
      const scrollTop = canvasRef.current.scrollTop

      setIsDragging(true)
      setSelectedNode(nodeId)
      setDragStart({
        x: e.clientX - (node.position.x + rect.left - scrollLeft),
        y: e.clientY - (node.position.y + rect.top - scrollTop),
      })
    },
    [nodes],
  )

  const handleNodeDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedNode || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const scrollLeft = canvasRef.current.scrollLeft
      const scrollTop = canvasRef.current.scrollTop

      // 캔버스 내부로 제한된 새로운 위치 계산
      const newPosition = {
        x: Math.max(
          50,
          Math.min(
            canvasSize.width - 50,
            e.clientX - rect.left + scrollLeft - dragStart.x,
          ),
        ),
        y: Math.max(
          50,
          Math.min(
            canvasSize.height - 50,
            e.clientY - rect.top + scrollTop - dragStart.y,
          ),
        ),
      }

      updateNodePosition(selectedNode, newPosition)
    },
    [isDragging, selectedNode, dragStart, canvasSize, updateNodePosition],
  )

  useEffect(() => {
    if (isDragging) {
      window.addEventListener(
        'mousemove',
        handleNodeDrag as unknown as EventListener,
      )
      window.addEventListener('mouseup', handleNodeDragEnd)
    }

    return () => {
      window.removeEventListener(
        'mousemove',
        handleNodeDrag as unknown as EventListener,
      )
      window.removeEventListener('mouseup', handleNodeDragEnd)
    }
  }, [isDragging, handleNodeDrag, handleNodeDragEnd])

  const getNodeIcon = (type: PipelineNode['type']) => {
    switch (type) {
      case 'input':
        return <ArrowDownTrayIcon className="h-5 w-5 text-blue-500" />
      case 'plan':
        return <DocumentTextIcon className="h-5 w-5 text-green-500" />
      case 'decision':
        return (
          <ArrowPathRoundedSquareIcon className="h-5 w-5 text-yellow-500" />
        )
      case 'action':
        return <BoltIcon className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getNodeStyle = useCallback(
    (node: PipelineNode) => {
      // 기본 스타일
      let style = 'border-2 '

      // 노드 타입별 기본 색상
      switch (node.type) {
        case 'input':
          style += 'border-blue-500 '
          break
        case 'plan':
          style += 'border-green-500 '
          break
        case 'decision':
          style += 'border-yellow-500 '
          break
        case 'action':
          style += 'border-red-500 '
          break
      }

      // 활성 노드 하이라이트
      if (node.id === activeNodeId) {
        style += 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
      }

      return style
    },
    [activeNodeId, nodeResults],
  )

  const getEdgeStyle = useCallback(
    (edge: PipelineEdge) => {
      // 기본 스타일
      let style = 'transition-colors '

      // 활성 엣지 하이라이트
      const sourceCompleted = nodeResults[edge.source]
      const targetActive = edge.target === activeNodeId

      if (sourceCompleted && targetActive) {
        style += [
          'stroke-primary',
          'line-cap-round',
          'paint-order-stroke',
          '[&>path]:fill-primary',
          '[&>marker]:fill-primary',
          '[&>path]:stroke-primary',
          '[&>marker]:stroke-primary',
        ].join(' ')
      } else {
        const color =
          edge.type === 'success'
            ? 'stroke-green-500 [&>path]:fill-green-500 [&>marker]:fill-green-500 [&>polygon]:stroke-green-500 [&>circle]:fill-green-500'
            : edge.type === 'error'
              ? 'stroke-red-500 [&>path]:fill-red-500 [&>marker]:fill-red-500 [&>polygon]:stroke-red-500 [&>circle]:fill-red-500'
              : 'stroke-gray-500 [&>path]:fill-gray-500 [&>marker]:fill-gray-500 [&>polygon]:fill-gray-500 [&>circle]:fill-gray-500'
        style += color + ' '
      }

      return style
    },
    [activeNodeId, nodeResults],
  )

  const getAnchorPoints = useCallback(
    (element: HTMLElement, center: { x: number; y: number }) => {
      const rect = element.getBoundingClientRect()
      return {
        top: {
          x: center.x,
          y: center.y - rect.height / 2,
        },
        right: {
          x: center.x + rect.width / 2,
          y: center.y,
        },
        bottom: {
          x: center.x,
          y: center.y + rect.height / 2,
        },
        left: {
          x: center.x - rect.width / 2,
          y: center.y,
        },
      }
    },
    [],
  )

  const getDistance = useCallback((p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }, [])

  const getAnchorDirection = useCallback(
    (anchorPoint: any, nodeCenter: any) => {
      const dx = anchorPoint.x - nodeCenter.x
      const dy = anchorPoint.y - nodeCenter.y

      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left'
      } else {
        return dy > 0 ? 'bottom' : 'top'
      }
    },
    [],
  )

  const getConnectionPoints = useCallback(
    (
      sourceElement: HTMLElement,
      targetElement: HTMLElement,
      sourceCenter: { x: number; y: number },
      targetCenter: { x: number; y: number },
    ) => {
      const sourceAnchors = getAnchorPoints(sourceElement, sourceCenter)
      const targetAnchors = getAnchorPoints(targetElement, targetCenter)

      // 가장 가까운 앵커 포인트 쌍 찾기
      let minDistance = Infinity
      let bestSourceAnchor = sourceAnchors.right
      let bestTargetAnchor = targetAnchors.left

      Object.values(sourceAnchors).forEach((sourceAnchor) => {
        Object.values(targetAnchors).forEach((targetAnchor) => {
          const distance = getDistance(sourceAnchor, targetAnchor)
          if (distance < minDistance) {
            minDistance = distance
            bestSourceAnchor = sourceAnchor
            bestTargetAnchor = targetAnchor
          }
        })
      })

      const sourceDirection = getAnchorDirection(bestSourceAnchor, sourceCenter)
      const targetDirection = getAnchorDirection(bestTargetAnchor, targetCenter)

      const controlPointOffset = Math.min(100, minDistance * 0.5)

      // 제어점 계산
      let sourceControlX = bestSourceAnchor.x
      let sourceControlY = bestSourceAnchor.y
      let targetControlX = bestTargetAnchor.x
      let targetControlY = bestTargetAnchor.y

      switch (sourceDirection) {
        case 'right':
          sourceControlX += controlPointOffset
          break
        case 'left':
          sourceControlX -= controlPointOffset
          break
        case 'bottom':
          sourceControlY += controlPointOffset
          break
        case 'top':
          sourceControlY -= controlPointOffset
          break
      }

      switch (targetDirection) {
        case 'right':
          targetControlX += controlPointOffset
          break
        case 'left':
          targetControlX -= controlPointOffset
          break
        case 'bottom':
          targetControlY += controlPointOffset
          break
        case 'top':
          targetControlY -= controlPointOffset
          break
      }

      // 끝점에서의 접선 방향 계산
      const dx = targetControlX - bestTargetAnchor.x
      const dy = targetControlY - bestTargetAnchor.y
      const angle = Math.atan2(dy, dx)

      return {
        start: bestSourceAnchor,
        end: bestTargetAnchor,
        sourceControl: { x: sourceControlX, y: sourceControlY },
        targetControl: { x: targetControlX, y: targetControlY },
        angle: angle * (180 / Math.PI), // 각도를 도(degree) 단위로 변환
      }
    },
    [getAnchorPoints, getDistance, getAnchorDirection],
  )

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-auto bg-base-100 shadow-lg"
      style={{
        cursor: isDragging ? 'grabbing' : 'default',
        position: 'relative',
        contain: 'paint',
      }}
    >
      {/* Background Grid */}
      <svg
        className="absolute top-0 left-0 inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.1 }}
      >
        <defs>
          <pattern
            id="dot-pattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>

      {/* Edges */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          {edges.map((edge) => (
            <React.Fragment key={`edge-${edge.id}`}>
              <marker
                id={`edgecircle-${edge.id}`}
                markerWidth="3"
                markerHeight="3"
                refX="1.5"
                refY="1.5"
                orient="auto-start-reverse"
                className={getEdgeStyle(edge)}
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
                className={getEdgeStyle(edge)}
              >
                <polygon points="0 0, 6 3, 0 6" />
              </marker>
            </React.Fragment>
          ))}
        </defs>
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source)!
          const targetNode = nodes.find((n) => n.id === edge.target)!

          const sourceElement = nodeRefs.current.get(edge.source)
          const targetElement = nodeRefs.current.get(edge.target)

          if (!sourceElement || !targetElement) return null

          const sourceCenter = {
            x: sourceNode.position.x,
            y: sourceNode.position.y,
          }
          const targetCenter = {
            x: targetNode.position.x,
            y: targetNode.position.y,
          }

          const { start, end, sourceControl, targetControl, angle } =
            getConnectionPoints(
              sourceElement,
              targetElement,
              sourceCenter,
              targetCenter,
            )

          const path = `M ${start.x} ${start.y} C ${sourceControl.x} ${sourceControl.y}, ${targetControl.x} ${targetControl.y}, ${end.x} ${end.y}`

          return (
            <path
              key={edge.id}
              d={path}
              className={getEdgeStyle(edge)}
              strokeWidth="2"
              fill="none"
              markerStart={`url(#edgecircle-${edge.id})`}
              markerEnd={`url(#arrowhead-${edge.id})`}
            />
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          ref={(el) => {
            if (el) {
              nodeRefs.current.set(node.id, el)
            } else {
              nodeRefs.current.delete(node.id)
            }
          }}
          className={`absolute p-3 select-none shadow-lg border-2 rounded-lg bg-base-100 ${
            isDragging && selectedNode === node.id
              ? 'cursor-grabbing shadow-xl'
              : 'cursor-grab hover:shadow-lg'
          } ${getNodeStyle(node)} ${
            selectedNode === node.id
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
              : ''
          }`}
          style={{
            position: 'absolute',
            left: node.position.x,
            top: node.position.y,
            transform: 'translate(-50%, -50%)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            zIndex: isDragging && selectedNode === node.id ? 10 : 1,
            overflow: 'visible',
            minWidth: '120px',
            whiteSpace: 'nowrap',
          }}
          onClick={() => handleNodeClick(node.id)}
          onMouseDown={(e) => handleNodeDragStart(node.id, e)}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                {getNodeIcon(node.type)}
                <div className="text-sm font-medium pointer-events-none">
                  {node.data.name}
                </div>
              </div>
              <div>
                {activeNodeId === node.id && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
              </div>
            </div>
            {node.data.description && (
              <div className="text-xs text-gray-600 mt-1">
                {node.data.description}
              </div>
            )}
            {nodeResults[node.id] && (
              <div className="text-xs mt-2 p-2 bg-base-200">
                {nodeResults[node.id].output}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
