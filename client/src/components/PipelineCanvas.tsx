import { Pipeline, PipelineNode } from '@agentfleet/types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Point } from '../types/pipeline'
import PipelineEdge from './PipelineEdge'
import PipelineNodeComponent from './PipelineNode'

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
  const [edges] = useState(pipeline.edges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [nodesChanged, setNodesChanged] = useState(false)

  const updateNodePosition = useCallback((nodeId: string, position: Point) => {
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
  }, [])

  useEffect(() => {
    if (onUpdate && nodesChanged) {
      onUpdate({
        ...pipeline,
        nodes,
      })
      setNodesChanged(false)
    }
  }, [nodes, onUpdate, nodesChanged, pipeline])

  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false)
    if (nodesChanged && onUpdate) {
      onUpdate({
        ...pipeline,
        nodes,
      })
      setNodesChanged(false)
    }
  }, [nodesChanged, nodes, onUpdate, pipeline])

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
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
        {edges.map((edge) => (
          <PipelineEdge
            key={edge.id}
            edge={edge}
            nodes={nodes}
            nodeRefs={nodeRefs.current}
            activeNodeId={activeNodeId || null}
            nodeResults={nodeResults}
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <PipelineNodeComponent
          key={node.id}
          node={node}
          isDragging={isDragging && selectedNode === node.id}
          isSelected={selectedNode === node.id}
          activeNodeId={activeNodeId}
          nodeResults={nodeResults}
          onNodeClick={handleNodeClick}
          onNodeDragStart={handleNodeDragStart}
          nodeRef={(el) => {
            if (el) {
              nodeRefs.current.set(node.id, el)
            } else {
              nodeRefs.current.delete(node.id)
            }
          }}
        />
      ))}
    </div>
  )
}
