import { useEffect, useRef, useState } from 'react'

type NodeProps = {
  title?: string
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
  collapsed?: boolean
  unCollapsable?: boolean
}

export function Node({
  title,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  collapsed,
  unCollapsable,
}: NodeProps) {
  const isDragging = useRef(false)
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const handleMouseDown = () => {
    isDragging.current = false
  }

  const handleMouseMove = () => {
    isDragging.current = true
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    onMouseLeave?.(e)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging.current && onClick) {
      onClick(e)
    }
  }

  useEffect(() => {
    setIsCollapsed(collapsed)
  }, [collapsed])

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isCollapsed ? (
        <div
          className={[
            'relative border text-sm rounded-sm shadow-lg border-gray-500/30 ',
            onClick ? 'cursor-pointer' : '',
          ].join(' ')}
        >
          <div className="text-[10px] px-2 rounded-t py-0.5 backdrop-blur-lg bg-base-100/30">
            <div className="flex items-center gap-2 justify-between">
              <div>{title}</div>
              {!unCollapsable && (
                <div
                  className="w-2 h-2 bg-red-500 rounded-full cursor-pointer shadow-md"
                  onClick={() => setIsCollapsed(true)}
                />
              )}
            </div>
          </div>
          <div className="p-2 rounded-b bg-base-100">{children}</div>
        </div>
      ) : (
        <div
          className="group overflow-visible w-5 h-5 rounded-full cursor-pointer"
          onClick={() => {
            if (!isDragging.current) {
              setIsCollapsed(false)
            }
          }}
        >
          <div className="absolute hidden group-hover:block bg-base-200/30 text-base-800 p-2 rounded-md whitespace-nowrap -top-[60px] transform -translate-x-1/2 z-1000 select-none pointer-events-none border border-gray-500/50 backdrop-blur-sm shadow-lg">
            {title}
            <div className="text-xs text-base-500 opacity-50">
              Click to expand
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
