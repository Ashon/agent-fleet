import { CSSProperties } from 'react'

export type Point = {
  x: number
  y: number
}

export type BoundingRect = {
  x: number
  y: number
  width: number
  height: number
}

export type PathData = {
  path: string
  source: Point
  target: Point
  sourceControl: Point
  targetControl: Point
}

// stroke 색상과 text 색상을 분리해서 관리하기 위함
export interface EdgeStyle extends Omit<CSSProperties, 'animationDuration'> {
  textColor?: string
  textStroke?: string
  animationDuration?: number
  animationDotColor?: string
  animationDots?: number
}

export type GraphNode = {
  id: string | number
  group?: string | number
  data?: any
  render?: (data: any) => React.ReactNode
  x?: number
  y?: number
  style?: {
    width?: number
    height?: number
  }
}

export type EdgeType = 'solid' | 'solid:animated' | 'dash' | 'dash:animated'

export type GraphEdge = {
  source: string | number
  target: string | number
  type?: EdgeType
  directed?: boolean
  text?: string
  style?: EdgeStyle
}

export type DisplayNode = {
  id: string | number
  group?: string | number
  x: number
  y: number
  data?: any
  style?: {
    width?: number
    height?: number
  }
}

export type DisplayEdge = {
  source_id: string | number
  target_id: string | number
  source: DisplayNode
  target: DisplayNode
  type: EdgeType
  directed: boolean
  text?: string
  style?: EdgeStyle
  pathData?: PathData
  state?: {
    isActive: boolean
  }
}

export interface DisplayGroup extends BoundingRect {
  id: string | number
  name: string | number
  nodes: DisplayNode[]
  style?: {
    color?: string
  }
}

export type DragRef = {
  nodeId: string | number | null
  offsetX: number
  offsetY: number
  lastX: number
  lastY: number
}
