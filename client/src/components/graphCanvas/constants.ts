export const SVG_ANIMATION_STYLE = `
@keyframes dash {
  from {
    stroke-dashoffset: 12
  }
  to {
    stroke-dashoffset: 0
  }
}
@keyframes moveCircle {
  to {
    stroke-dashoffset: 0
  }
}`

export const defaultEdgeStyle = {
  strokeWidth: 1.5,
  stroke: 'var(--color-gray-500)',
  opacity: 1,
  animation: 'none',
}
