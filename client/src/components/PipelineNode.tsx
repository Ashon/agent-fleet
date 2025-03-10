import { PipelineNode as PipelineNodeType } from '@agentfleet/types'
import {
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
  BoltIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import React from 'react'
import { getNodeStyle } from '../utils/nodeUtils'

interface PipelineNodeProps {
  node: PipelineNodeType
  isDragging: boolean
  isSelected: boolean
  activeNodeId?: string | null
  nodeResults?: Record<string, { status: string; output: string }>
  onNodeClick: (nodeId: string) => void
  onNodeDragStart: (nodeId: string, e: React.MouseEvent) => void
  nodeRef: (el: HTMLDivElement | null) => void
}

export default function PipelineNode({
  node,
  isDragging,
  isSelected,
  activeNodeId,
  nodeResults = {},
  onNodeClick,
  onNodeDragStart,
  nodeRef,
}: PipelineNodeProps) {
  const getNodeIcon = (type: PipelineNodeType['type']) => {
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

  return (
    <div
      ref={nodeRef}
      className={`absolute p-3 select-none shadow-lg border-2 rounded-lg bg-base-100 ${
        isDragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab hover:shadow-lg'
      } ${getNodeStyle(node, activeNodeId)} ${
        isSelected
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
        zIndex: isDragging ? 10 : 1,
        overflow: 'visible',
        minWidth: '120px',
        whiteSpace: 'nowrap',
      }}
      onClick={() => onNodeClick(node.id)}
      onMouseDown={(e) => onNodeDragStart(node.id, e)}
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
  )
}
