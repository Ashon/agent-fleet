import { PipelineEdge } from '@agentfleet/types'
import { ConnectionPoints, Point } from '../types/pipeline'
import { getAnchorDirection, getAnchorPoints, getDistance } from './nodeUtils'

export const getEdgeStyle = (
  edge: PipelineEdge,
  activeNodeId: string | null,
  nodeResults: Record<string, { status: string; output: string }>,
) => {
  let style = 'transition-colors '

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
}

export const getConnectionPoints = (
  sourceElement: HTMLElement,
  targetElement: HTMLElement,
  sourceCenter: Point,
  targetCenter: Point,
): ConnectionPoints => {
  const sourceAnchors = getAnchorPoints(sourceElement, sourceCenter)
  const targetAnchors = getAnchorPoints(targetElement, targetCenter)

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

  const dx = targetControlX - bestTargetAnchor.x
  const dy = targetControlY - bestTargetAnchor.y
  const angle = Math.atan2(dy, dx)

  return {
    start: bestSourceAnchor,
    end: bestTargetAnchor,
    sourceControl: { x: sourceControlX, y: sourceControlY },
    targetControl: { x: targetControlX, y: targetControlY },
    angle: angle * (180 / Math.PI),
  }
}
