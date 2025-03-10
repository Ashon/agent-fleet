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

export const getNodeStyle = (
  node: PipelineNode,
  activeNodeId?: string | null,
) => {
  let style = 'border-2 '

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

  if (node.id === activeNodeId) {
    style += 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
  }

  return style
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
