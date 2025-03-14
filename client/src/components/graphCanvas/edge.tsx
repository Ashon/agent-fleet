import { useEffect, useMemo, useRef, useState } from 'react'
import { DisplayEdge, PathData, Point } from './types'
import { getArrowPath } from './utils'

const CIRCLE_SIZE = 2
const TEXT_ANCHOR_OFFSET = 0.4

type pathSolver = (
  container: HTMLElement | null,
  edge: DisplayEdge,
  scale: number,
  viewOffset: Point,
) => PathData

type ReactEdgeProps = {
  edge: DisplayEdge
  pathAnchorSolver: pathSolver
  container: HTMLElement | null
  scale: number
  viewOffset: Point
  drawText?: boolean
  animationDisabled?: boolean
}

export function Edge({
  edge,
  pathAnchorSolver,
  container,
  scale,
  viewOffset,
  drawText,
  animationDisabled = false,
}: ReactEdgeProps) {
  const rootPathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)
  const [textAnchor, setTextAnchor] = useState<Point>({ x: 0, y: 0 })
  const prevPathRef = useRef<string>('')

  const pathData = useMemo(
    () => pathAnchorSolver(container, edge, scale, viewOffset),
    [container, edge, scale, viewOffset, pathAnchorSolver],
  )

  useEffect(() => {
    if (!rootPathRef.current || pathData.path === prevPathRef.current) return

    prevPathRef.current = pathData.path
    const length = rootPathRef.current.getTotalLength()
    const point = rootPathRef.current.getPointAtLength(
      length * TEXT_ANCHOR_OFFSET,
    )

    requestAnimationFrame(() => {
      setPathLength(length)
      setTextAnchor(point)
    })
  }, [pathData.path])

  const arrowPath = useMemo(
    () => getArrowPath(edge, pathData, scale),
    [edge, pathData, scale],
  )

  const animationDots = pathLength / (edge.style?.animationDots || 1)

  return (
    <g>
      <path
        ref={rootPathRef}
        className="edge-line"
        style={{
          stroke: edge.style?.stroke,
          strokeWidth: edge.style?.strokeWidth,
          strokeDasharray: edge.type?.split(':')[0] === 'dash' ? '8 4' : 'none',
          strokeDashoffset: 0,
          animation:
            edge.type?.split(':')[1] === 'animated'
              ? 'dash 1s linear infinite'
              : 'none',
          opacity: edge.style?.opacity,
          fill: 'none',
        }}
        d={pathData.path}
      />
      <circle
        className="socket-source-dot"
        style={{
          fill: edge.style?.stroke,
        }}
        r={((edge.style?.strokeWidth as number) + CIRCLE_SIZE) * scale}
        cx={pathData.source.x}
        cy={pathData.source.y}
      />
      {edge.directed ? (
        <path
          className="socket-target-arrow"
          style={{
            fill: edge.style?.stroke,
          }}
          d={arrowPath}
        />
      ) : (
        <circle
          className="socket-target-dot"
          style={{
            fill: edge.style?.stroke,
          }}
          r={((edge.style?.strokeWidth as number) + CIRCLE_SIZE) * scale}
          cx={pathData.target.x}
          cy={pathData.target.y}
        />
      )}
      {!animationDisabled &&
        pathLength > 0 &&
        edge.type?.split(':')[1] === 'animated' && (
          <path
            className="edge-line-animation-dot"
            style={{
              fill: 'none',
              stroke: edge.style?.animationDotColor,
              strokeWidth: ((edge.style?.strokeWidth as number) + 1) * scale,
              strokeDasharray: `1 ${animationDots}`,
              strokeDashoffset: animationDots,
              animation: `moveCircle ${edge.style?.animationDuration}s linear infinite`,
              strokeLinecap: 'round',
            }}
            d={pathData.path}
          />
        )}
      {drawText && (
        <text
          className="edge-text fill-current stroke-base-100"
          style={{
            fontSize: ((edge.style?.fontSize as number) || 10) * scale,
            fontWeight: edge.style?.fontWeight || 'bold',
            textAnchor: 'middle',
            dominantBaseline: 'middle',
            transform: `translate(${textAnchor.x}, ${textAnchor.y})`,
            stroke: edge.style?.textStroke,
            strokeWidth: ((edge.style?.strokeWidth as number) + 4) * scale,
            paintOrder: 'stroke',
            strokeLinejoin: 'round',
          }}
        >
          {edge.text}
        </text>
      )}
    </g>
  )
}
