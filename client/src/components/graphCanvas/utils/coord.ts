export const getNodesBound = (nodes: any) => {
  const bounds = nodes.reduce(
    (acc: any, node: any) => ({
      minX: Math.min(acc.minX, node.x),
      maxX: Math.max(acc.maxX, node.x),
      minY: Math.min(acc.minY, node.y),
      maxY: Math.max(acc.maxY, node.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )

  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  }
}

export const getGraphCenter = (nodes: any) => {
  // 노드들의 경계 계산
  const bounds = getNodesBound(nodes)

  // 중심점 계산
  const centerX = bounds.x + bounds.width * 0.5
  const centerY = bounds.y + bounds.height * 0.5

  return {
    x: centerX || 0,
    y: centerY || 0,
  }
}
