import { DisplayEdge, DisplayNode, PathData, Point } from '../types'
import { getAnchorDirection, getDistance } from './node'

export const getAnchorPoints = (
  container: HTMLElement | null,
  node: DisplayNode,
  scale: number,
  viewOffset: any,
) => {
  const nodeElement =
    container?.querySelector(`div[data-node-id="${node.id}"]`) ||
    container?.querySelector(`[data-node-id="${node.id}"]`)
  if (!nodeElement)
    return {
      top: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
      bottom: { x: 0, y: 0 },
      left: { x: 0, y: 0 },
    }

  const rect = nodeElement.getBoundingClientRect()
  const nodeWidth = rect.width
  const nodeHeight = rect.height

  const x = node.x * scale + viewOffset.x
  const y = node.y * scale + viewOffset.y

  return {
    top: {
      x: x,
      y: y - nodeHeight / 2,
    },
    right: {
      x: x + nodeWidth / 2,
      y: y,
    },
    bottom: {
      x: x,
      y: y + nodeHeight / 2,
    },
    left: {
      x: x - nodeWidth / 2,
      y: y,
    },
  }
}

export const getPathData = (
  container: HTMLElement | null,
  edge: DisplayEdge,
  scale: number,
  viewOffset: Point,
) => {
  const sourceAnchors = getAnchorPoints(
    container,
    edge.source,
    scale,
    viewOffset,
  )
  const targetAnchors = getAnchorPoints(
    container,
    edge.target,
    scale,
    viewOffset,
  )

  // 가장 가까운 앵커 포인트 쌍 찾기
  let minDistance = Infinity
  let bestSourceAnchor = { x: 0, y: 0 }
  let bestTargetAnchor = { x: 0, y: 0 }

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

  // 베지어 커브의 제어점 계산
  const sourceCenter = {
    x: edge.source.x * scale + viewOffset.x,
    y: edge.source.y * scale + viewOffset.y,
  }
  const targetCenter = {
    x: edge.target.x * scale + viewOffset.x,
    y: edge.target.y * scale + viewOffset.y,
  }

  const sourceDirection = getAnchorDirection(bestSourceAnchor, sourceCenter)
  const targetDirection = getAnchorDirection(bestTargetAnchor, targetCenter)

  const controlPointOffset = minDistance * 0.3

  // 방향에 따른 제어점 계산
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

  // path 데이터를 d 객체에 저장 (소켓 위치 계산을 위해)
  const pathData = {
    source: bestSourceAnchor,
    target: bestTargetAnchor,
    sourceControl: {
      x: sourceControlX,
      y: sourceControlY,
    },
    targetControl: {
      x: targetControlX,
      y: targetControlY,
    },
    path: [
      `M${bestSourceAnchor.x},${bestSourceAnchor.y}`,
      `C${sourceControlX},${sourceControlY}`,
      `${targetControlX},${targetControlY}`,
      `${bestTargetAnchor.x},${bestTargetAnchor.y}`,
    ].join(' '),
  }

  return pathData
}

export const getLinePathData = (
  // @ts-expect-error TS6133
  container: HTMLElement | null,
  edge: DisplayEdge,
  scale: number,
  viewOffset: Point,
) => {
  const sourceX = edge.source.x * scale + viewOffset.x
  const sourceY = edge.source.y * scale + viewOffset.y
  const targetX = edge.target.x * scale + viewOffset.x
  const targetY = edge.target.y * scale + viewOffset.y

  const pathData = {
    source: { x: sourceX, y: sourceY },
    target: { x: targetX, y: targetY },
    path: `M${sourceX},${sourceY} L${targetX},${targetY}`,
    sourceControl: { x: sourceX, y: sourceY },
    targetControl: { x: targetX, y: targetY },
  }

  return pathData
}

const ARROW_SIZE = 8

export const getArrowPath = (
  edge: DisplayEdge,
  pathData: PathData,
  scale: number,
) => {
  const { target, targetControl } = pathData

  // 화살표 크기 설정 (스케일에 따라 조정)
  const arrowSize = ((edge.style?.strokeWidth as number) + ARROW_SIZE) * scale

  // 화살표 방향 계산
  const dx = target.x - targetControl.x
  const dy = target.y - targetControl.y
  const angle = Math.atan2(dy, dx)

  // 화살표 끝점
  const tipX = target.x
  const tipY = target.y

  // 화살표 날개 좌표 계산
  const leftX = tipX - arrowSize * Math.cos(angle - Math.PI / 6)
  const leftY = tipY - arrowSize * Math.sin(angle - Math.PI / 6)
  const rightX = tipX - arrowSize * Math.cos(angle + Math.PI / 6)
  const rightY = tipY - arrowSize * Math.sin(angle + Math.PI / 6)

  return `M ${tipX} ${tipY} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`
}
