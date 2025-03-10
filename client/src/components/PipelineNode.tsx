import { PipelineNode as PipelineNodeType } from '@agentfleet/types'
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
  BeakerIcon,
  BoltIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import React from 'react'
import { getNodeStyle } from '../utils/nodeUtils'

interface PipelineNodeProps {
  node: PipelineNodeType
  isDragging: boolean
  isSelected: boolean
  activeNodeIds: Set<string>
  nodeResults?: Record<string, { status: string; output: string }>
  onNodeClick: (nodeId: string) => void
  onNodeDragStart: (nodeId: string, e: React.MouseEvent) => void
  nodeRef: (el: HTMLDivElement | null) => void
}

export default function PipelineNode({
  node,
  isDragging,
  isSelected,
  activeNodeIds,
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
      case 'process':
        return <BeakerIcon className="h-5 w-5 text-purple-500" />
      case 'aggregator':
        return <ArchiveBoxIcon className="h-5 w-5 text-orange-500" />
      case 'analysis':
        return <ChartBarIcon className="h-5 w-5 text-indigo-500" />
      default:
        return null
    }
  }

  const isActive = activeNodeIds.has(node.id)
  const nodeResult = nodeResults[node.id]

  return (
    <div
      ref={nodeRef}
      className={`absolute p-3 select-none shadow-lg border-2 rounded-lg bg-base-100 ${
        isDragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab hover:shadow-lg'
      } ${getNodeStyle(node)} ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
          : ''
      } ${
        nodeResult?.status === 'success'
          ? 'border-success'
          : nodeResult?.status === 'error'
            ? 'border-error'
            : 'border-base-300'
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
        transition: isDragging ? 'none' : 'all 0.2s ease',
        zIndex: isDragging ? 10 : isActive ? 5 : 1,
        overflow: 'visible',
        minWidth: '200px',
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
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="flex items-center gap-1">
                <span className="loading loading-spinner loading-sm"></span>
              </div>
            )}
          </div>
        </div>
        {node.data.description && (
          <div className="text-xs text-gray-600 mt-1">
            {node.data.description}
          </div>
        )}
        {nodeResult && (
          <div
            className={`text-xs mt-2 p-2 rounded ${
              nodeResult.status === 'success'
                ? 'bg-success'
                : nodeResult.status === 'error'
                  ? 'bg-error'
                  : 'bg-base-200'
            }`}
          >
            {nodeResult.output}
          </div>
        )}
      </div>
    </div>
  )
}
