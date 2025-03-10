import { Pipeline } from '@agentfleet/types'

export interface PipelineCanvasProps {
  pipeline: Pipeline
  onUpdate: (pipeline: Pipeline) => void
  activeNodeId?: string | null
  nodeResults?: Record<string, { status: string; output: string }>
}

export interface Point {
  x: number
  y: number
}

export interface AnchorPoints {
  top: Point
  right: Point
  bottom: Point
  left: Point
}

export interface ConnectionPoints {
  start: Point
  end: Point
  sourceControl: Point
  targetControl: Point
  angle: number
}

export type NodeDirection = 'top' | 'right' | 'bottom' | 'left'
