import { DisplayNode } from '../types'
import { getGraphCenter } from './coord'

export const getViewportCenter = (
  container: HTMLElement | null,
  nodes: DisplayNode[],
  zoomScale: number,
) => {
  if (!container) return { x: 0, y: 0 }

  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  const center = getGraphCenter(nodes)

  // 뷰포트 중앙으로 이동
  return {
    x: containerWidth * 0.5 - center.x * zoomScale,
    y: containerHeight * 0.5 - center.y * zoomScale,
  }
}
