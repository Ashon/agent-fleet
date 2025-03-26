import { useCallback, useEffect, useState } from 'react'
import { BoundingRect } from '../types'

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
}

export function useContextMenu(contextMenuBound: BoundingRect) {
  const [contextMenuState, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  })

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      // consier contextmenu width and screen size
      const contextMenuWidth = contextMenuBound.width || 200
      const contextMenuHeight = contextMenuBound.height || 200
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      let x = event.clientX
      let y = event.clientY
      if (x + contextMenuWidth > screenWidth) {
        x = screenWidth - contextMenuWidth
      }
      if (y + contextMenuHeight > screenHeight) {
        y = screenHeight - contextMenuHeight
      }
      setContextMenu({
        visible: true,
        x,
        y,
      })
    },
    [contextMenuBound],
  )

  const handleClick = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0 })
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [handleClick])

  return {
    contextMenuState,
    handleContextMenu,
  }
}
