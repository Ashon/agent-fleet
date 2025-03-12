import { DisplayGroup, Point } from './types'

type GroupProps = {
  group: DisplayGroup
  scale: number
  viewOffset: Point
  padding: Point
  color: string
  drawText?: boolean
}

const calculateDashArrayAndOffset = (
  width: number,
  height: number,
  cornerLength = 20,
) => {
  const dashOffset = cornerLength * 0.5

  const xGap = width - cornerLength
  const yGap = height - cornerLength
  const dashArray = [cornerLength, xGap, cornerLength, yGap].join(' ')

  return {
    dashArray: `${dashArray}`,
    dashOffset,
  }
}

export const Group = ({
  group,
  scale,
  viewOffset,
  padding = { x: 30, y: 30 },
  color,
  drawText = true,
}: GroupProps) => {
  const width = (group?.width + padding.x * 2) * scale
  const height = (group?.height + padding.y * 2) * scale
  const { dashArray, dashOffset } = calculateDashArrayAndOffset(
    width,
    height,
    20 * scale,
  )

  return (
    <g>
      <rect
        x={(group?.x - padding.x) * scale + viewOffset.x}
        y={(group?.y - padding.y) * scale + viewOffset.y}
        width={width}
        height={height}
        style={{
          fill: color,
          fillOpacity: 0.1,
          stroke: color,
          strokeWidth: 2 * scale,
          strokeDasharray: dashArray,
          strokeDashoffset: dashOffset,
        }}
      />
      {drawText && (
        <text
          className="fill-current stroke-base-100 select-none"
          x={(group?.x - padding.x) * scale + viewOffset.x}
          y={(group?.y - padding.y) * scale + viewOffset.y - 7 * scale}
          style={{
            fill: color,
            fontSize: 14 * scale,
            strokeWidth: 4 * scale,
            paintOrder: 'stroke',
            strokeLinejoin: 'round',
          }}
        >
          {group?.name}
        </text>
      )}
    </g>
  )
}
