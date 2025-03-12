import { useCallback, useEffect, useRef, useState } from 'react'
import { DragRef } from '../types'

type UseMouseEventProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  displayNodes: any[]
  zoomScale: number
  viewOffset: { x: number; y: number }
  minZoomScale: number
  maxZoomScale: number
  onDrag: (subject: any) => void
  onPanning: ({ x, y }: { x: number; y: number }) => void
  onZoom: ({ scale, x, y }: { scale: number; x: number; y: number }) => void
}

export const useMouseEvent = ({
  containerRef,
  displayNodes,
  zoomScale,
  viewOffset,
  minZoomScale,
  maxZoomScale,
  onDrag,
  onPanning,
  onZoom,
}: UseMouseEventProps) => {
  const [isPanning, setIsPanning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<DragRef>({
    nodeId: null,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
  })

  const onNodeMouseDown = (
    e: React.MouseEvent<HTMLDivElement | SVGElement>,
    nodeId: any,
    scale: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (containerRef.current === null) return
    const containerRect = (containerRef.current as any).getBoundingClientRect()
    const node: any = displayNodes.find((n) => n.id === nodeId)

    dragRef.current = {
      nodeId,
      offsetX: (e.clientX - containerRect.left - viewOffset.x) / scale - node.x,
      offsetY: (e.clientY - containerRect.top - viewOffset.y) / scale - node.y,
      lastX: e.clientX,
      lastY: e.clientY,
    }

    setIsDragging(true)
  }

  const handleWheel = useCallback(
    (e: any) => {
      if (!e.ctrlKey && !e.metaKey) return

      e.preventDefault()
      e.stopPropagation()

      const container: any = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // 마우스 위치를 기준으로 한 상대 좌표
      const x = (mouseX - viewOffset.x) / zoomScale
      const y = (mouseY - viewOffset.y) / zoomScale

      // 새로운 스케일 계산
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoomScale = Math.min(
        Math.max(zoomScale * delta, minZoomScale),
        maxZoomScale,
      )

      // 새로운 오프셋 계산
      const newOffsetX = mouseX - x * newZoomScale
      const newOffsetY = mouseY - y * newZoomScale

      onZoom({ scale: newZoomScale, x: newOffsetX, y: newOffsetY })
    },
    [containerRef, zoomScale, viewOffset, minZoomScale, maxZoomScale, onZoom],
  )

  const onBackgroundMouseDown = (e: any) => {
    if (containerRef.current === null) return
    if (dragRef.current === null) return

    if (
      e.target === containerRef.current ||
      e.target.classList.contains('main-svg')
    ) {
      ;(dragRef as any).current = {
        lastX: e.clientX,
        lastY: e.clientY,
      }

      setIsPanning(true)
    }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement | SVGElement>) => {
    if (containerRef.current === null) return
    if (dragRef.current === null) return

    if (isDragging && dragRef.current.nodeId != null) {
      const containerRect = (
        containerRef.current as any
      ).getBoundingClientRect()
      const newX =
        (e.clientX -
          containerRect.left -
          dragRef.current.offsetX -
          viewOffset.x) /
        zoomScale
      const newY =
        (e.clientY -
          containerRect.top -
          dragRef.current.offsetY -
          viewOffset.y) /
        zoomScale

      onDrag({ subject: dragRef.current.nodeId, x: newX, y: newY })
    } else if (isPanning) {
      const deltaX = e.clientX - dragRef.current.lastX
      const deltaY = e.clientY - dragRef.current.lastY

      onPanning({ x: deltaX, y: deltaY })

      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
    }
  }

  const onMouseUp = () => {
    setIsDragging(false)
    setIsPanning(false)
  }

  useEffect(() => {
    const container = containerRef.current

    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [containerRef, handleWheel])

  return {
    onNodeMouseDown,
    handleWheel,
    onBackgroundMouseDown,
    onMouseMove,
    onMouseUp,
  }
}
