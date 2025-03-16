import { AnchorPoints, Point } from '../types/pipeline'

// 두 점 사이의 거리 계산
export const getDistance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export const getAnchorDirection = (anchorPoint: Point, nodeCenter: Point) => {
  const dx = anchorPoint.x - nodeCenter.x
  const dy = anchorPoint.y - nodeCenter.y

  // 앵커 포인트의 방향 결정 (top, right, bottom, left)
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left'
  } else {
    return dy > 0 ? 'bottom' : 'top'
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
