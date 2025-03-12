import {
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
  useImperativeHandle,
  useRef,
} from 'react'

type ContextMenuProps = {
  state: any
  children: React.ReactNode
}

type ContextMenuComponent = ForwardRefExoticComponent<
  ContextMenuProps & RefAttributes<unknown>
> & {
  Item: typeof ContextMenuItem
  Divider: typeof ContextMenuDivider
}

const ContextMenu = forwardRef(({ state, children }: ContextMenuProps, ref) => {
  const domRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => domRef.current)

  return (
    state.visible && (
      <div
        ref={domRef}
        className="fixed shadow-lg rounded-lg py-2 border border-base-300 backdrop-blur-sm text-sm z-50 bg-base-100/70"
        style={{
          left: `${state.x}px`,
          top: `${state.y}px`,
        }}
      >
        {children}
      </div>
    )
  )
}) as ContextMenuComponent

type ContextMenuItemProps = {
  text: string
  onClick?: () => void
}

const ContextMenuItem = ({ text, onClick }: ContextMenuItemProps) => {
  return (
    <div>
      <button
        className="w-full px-4 py-1 text-left hover:bg-primary hover:text-primary-content transition-colors select-none"
        onClick={onClick}
      >
        {text}
      </button>
    </div>
  )
}

const ContextMenuDivider = () => {
  return (
    <div className="w-full px-2 my-2">
      <div className="w-full h-px bg-gray-400/30" />
    </div>
  )
}

ContextMenu.displayName = 'ContextMenu'
ContextMenu.Item = ContextMenuItem
ContextMenu.Divider = ContextMenuDivider

export default ContextMenu
