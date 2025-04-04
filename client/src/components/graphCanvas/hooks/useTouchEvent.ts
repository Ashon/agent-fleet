import { useRef, useState } from 'react'
import { DisplayNode, DragRef, Point } from '../types'

type UseTouchEventProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  displayNodes: DisplayNode[]
  zoomScale: number
  viewOffset: Point
  onDrag: ({
    subject,
    x,
    y,
  }: {
    subject: string | number
    x: number
    y: number
  }) => void
  onPanning: ({ x, y }: { x: number; y: number }) => void
}

export const useTouchEvent = ({
  containerRef,
  displayNodes,
  zoomScale,
  viewOffset,
  onDrag,
  onPanning,
}: UseTouchEventProps) => {
  const [isPanning, setIsPanning] = useState(false)
  const dragRef = useRef<DragRef>({
    nodeId: null,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
  })

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement | SVGElement>,
  ) => {
    e.preventDefault()

    if (e.touches.length === 1) {
      // 단일 터치는 패닝으로 처리
      const touch = e.touches[0]
      dragRef.current = {
        ...dragRef.current,
        lastX: touch.clientX,
        lastY: touch.clientY,
      }
      setIsPanning(true)
    }
  }

  const handleTouchMove = (
    e: React.TouchEvent<HTMLDivElement | SVGElement>,
  ) => {
    if (containerRef.current === null) return
    e.preventDefault()

    if (e.touches.length === 1) {
      const touch = e.touches[0]

      if (dragRef.current.nodeId != null) {
        // 노드 드래그 로직
        const containerRect = containerRef.current.getBoundingClientRect()
        const newX =
          (touch.clientX - containerRect.left - viewOffset.x) / zoomScale -
          dragRef.current.offsetX
        const newY =
          (touch.clientY - containerRect.top - viewOffset.y) / zoomScale -
          dragRef.current.offsetY
        onDrag({ subject: dragRef.current.nodeId, x: newX, y: newY })
      } else if (isPanning) {
        // 기존 패닝 로직
        const deltaX = touch.clientX - dragRef.current.lastX
        const deltaY = touch.clientY - dragRef.current.lastY

        onPanning({ x: deltaX, y: deltaY })

        dragRef.current.lastX = touch.clientX
        dragRef.current.lastY = touch.clientY
      }
    }
  }

  const onNodeTouchStart = (
    e: React.TouchEvent<HTMLDivElement | SVGElement>,
    nodeId: string | number,
    scale: number,
  ) => {
    e.stopPropagation()

    if (containerRef.current === null || e.touches.length !== 1) return

    const touch = e.touches[0]
    const containerRect = containerRef.current.getBoundingClientRect()
    const node = displayNodes.find((n) => n.id === nodeId)

    if (!node) return

    dragRef.current = {
      nodeId,
      offsetX:
        (touch.clientX - containerRect.left - viewOffset.x) / scale - node.x,
      offsetY:
        (touch.clientY - containerRect.top - viewOffset.y) / scale - node.y,
      lastX: touch.clientX,
      lastY: touch.clientY,
    }
  }

  const handleTouchEnd = () => {
    setIsPanning(false)

    dragRef.current = {
      nodeId: null,
      offsetX: 0,
      offsetY: 0,
      lastX: 0,
      lastY: 0,
    }
  }

  return {
    handleTouchStart,
    handleTouchMove,
    onNodeTouchStart,
    handleTouchEnd,
  }
}
