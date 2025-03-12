import { getGraphCenter } from './coord'

export const getViewportCenter = (
  container: any,
  nodes: any,
  zoomScale: number,
) => {
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  const center = getGraphCenter(nodes)

  // 뷰포트 중앙으로 이동
  return {
    x: containerWidth * 0.5 - center.x * zoomScale,
    y: containerHeight * 0.5 - center.y * zoomScale,
  }
}
