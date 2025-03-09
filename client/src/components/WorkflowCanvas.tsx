import { Workflow, WorkflowEdge, WorkflowNode } from '@agentfleet/types'
import { PlayIcon, StopIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useRef, useState } from 'react'

interface WorkflowCanvasProps {
  workflow: Workflow
  onUpdate: (workflow: Workflow) => void
}

export default function WorkflowCanvas({ workflow }: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow.nodes)
  const [edges] = useState<WorkflowEdge[]>(workflow.edges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

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

      setNodes((prev) =>
        prev.map((n) =>
          n.id === selectedNode ? { ...n, position: newPosition } : n,
        ),
      )
    },
    [isDragging, selectedNode, dragStart, canvasSize],
  )

  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

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
              stroke={
                edge.type === 'success'
                  ? '#22c55e'
                  : edge.type === 'error'
                    ? '#ef4444'
                    : '#94a3b8'
              }
              strokeWidth="2"
              fill="none"
              className="transition-colors"
            />
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`absolute p-2 select-none shadow-lg bg-base-100 border-2 ${
            isDragging && selectedNode === node.id
              ? 'cursor-grabbing shadow-xl'
              : 'cursor-grab hover:shadow-xl'
          } ${
            node.type === 'start'
              ? 'w-8 h-8 flex items-center justify-center rounded-full'
              : node.type === 'end'
                ? 'w-8 h-8 flex items-center justify-center rounded-full'
                : node.type === 'input'
                  ? 'border-primary'
                  : node.type === 'process'
                    ? 'border-secondary'
                    : 'border-accent'
          } ${
            selectedNode === node.id
              ? 'ring-2 ring-offset-2 ring-offset-base-100 ring-primary ring-opacity-50'
              : ''
          }`}
          style={{
            left: node.position.x,
            top: node.position.y,
            transform: 'translate(-50%, -50%)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            borderRadius:
              node.type === 'start' || node.type === 'end' ? '50%' : '0.5rem',
          }}
          onClick={() => handleNodeClick(node.id)}
          onMouseDown={(e) => handleNodeDragStart(node.id, e)}
        >
          {node.type === 'start' ? (
            <PlayIcon />
          ) : node.type === 'end' ? (
            <StopIcon />
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium pointer-events-none">
                  {node.data.name}
                </div>
                {node.connectorId && (
                  <div className="text-xs opacity-80 pointer-events-none flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {node.connectorId}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
