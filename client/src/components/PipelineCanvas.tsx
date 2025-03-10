import { Pipeline, PipelineEdge, PipelineNode } from '@agentfleet/types'
import {
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
  BoltIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const [nodes, setNodes] = useState<PipelineNode[]>(pipeline.nodes)
  const [edges] = useState<PipelineEdge[]>(pipeline.edges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // 노드 변경 시에만 상태 업데이트
  const updateNodePosition = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, position } : n)),
      )

      // 노드 위치가 변경되었음을 표시하는 플래그
      setNodesChanged(true)
    },
    [],
  )

  // 노드 변경 여부를 추적하는 상태
  const [nodesChanged, setNodesChanged] = useState(false)

  // 드래그 종료 시 변경 사항 저장
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

  // 파이프라인 업데이트
  useEffect(() => {
    if (onUpdate && !isDragging) {
      console.log('nodes', nodes)
      onUpdate({
        ...pipeline,
        nodes,
      })
    }
  }, [nodes, isDragging, onUpdate])

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
        style += 'ring-2 ring-primary '
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
        style += 'stroke-primary stroke-[3px] '
      } else {
        style +=
          edge.type === 'success'
            ? 'stroke-green-500 '
            : edge.type === 'error'
              ? 'stroke-red-500 '
              : 'stroke-slate-400 '
      }

      return style
    },
    [activeNodeId, nodeResults],
  )

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-auto bg-base-100 shadow-lg"
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      {/* Background Grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
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
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source)!
          const targetNode = nodes.find((n) => n.id === edge.target)!

          return (
            <path
              key={edge.id}
              d={`M ${sourceNode.position.x} ${sourceNode.position.y}
                  L ${targetNode.position.x} ${targetNode.position.y}`}
              className={getEdgeStyle(edge)}
              strokeWidth="2"
              fill="none"
            />
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`absolute p-3 select-none shadow-lg border-2 rounded-lg bg-base-100 ${
            isDragging && selectedNode === node.id
              ? 'cursor-grabbing shadow-xl'
              : 'cursor-grab hover:shadow-xl'
          } ${getNodeStyle(node)}`}
          style={{
            left: node.position.x,
            top: node.position.y,
            transform: 'translate(-50%, -50%)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            minWidth: '120px',
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
