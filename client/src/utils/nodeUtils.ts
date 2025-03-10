import { PipelineNode } from '@agentfleet/types'
import { AnchorPoints, NodeDirection, Point } from '../types/pipeline'

export const getNodeIcon = (type: PipelineNode['type']) => {
  switch (type) {
    case 'input':
      return 'ArrowDownTrayIcon'
    case 'plan':
      return 'DocumentTextIcon'
    case 'decision':
      return 'ArrowPathRoundedSquareIcon'
    case 'action':
      return 'BoltIcon'
    default:
      return null
  }
}

export function getNodeStyle(node: PipelineNode): string {
  switch (node.type) {
    case 'input':
      return `border-blue-300`
    case 'plan':
      return `border-green-300`
    case 'decision':
      return `border-yellow-300`
    case 'action':
      return `border-red-300`
    case 'process':
      return `border-purple-300`
    case 'aggregator':
      return `border-orange-300`
    case 'analysis':
      return `border-indigo-300`
    default:
      return ''
  }
}

export const getAnchorPoints = (
  element: HTMLElement,
  center: Point,
): AnchorPoints => {
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
}

export const getDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export const getAnchorDirection = (
  anchorPoint: Point,
  nodeCenter: Point,
): NodeDirection => {
  const dx = anchorPoint.x - nodeCenter.x
  const dy = anchorPoint.y - nodeCenter.y

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left'
  } else {
    return dy > 0 ? 'bottom' : 'top'
  }
}
