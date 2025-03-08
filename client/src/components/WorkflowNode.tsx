interface WorkflowNodeProps {
  id: string
  title: string
  type: 'input' | 'process' | 'output'
  position: { x: number; y: number }
  onDragStart?: (e: React.DragEvent, id: string) => void
  onDragEnd?: (e: React.DragEvent, id: string) => void
}

export default function WorkflowNode({
  id,
  title,
  type,
  position,
  onDragStart,
  onDragEnd,
}: WorkflowNodeProps) {
  const getNodeColor = () => {
    switch (type) {
      case 'input':
        return 'bg-primary text-primary-content'
      case 'process':
        return 'bg-secondary text-secondary-content'
      case 'output':
        return 'bg-accent text-accent-content'
      default:
        return 'bg-base-300'
    }
  }

  return (
    <div
      className={`absolute w-48 p-4 rounded-lg shadow-lg cursor-move ${getNodeColor()}`}
      style={{ left: position.x, top: position.y }}
      draggable
      onDragStart={(e) => onDragStart?.(e, id)}
      onDragEnd={(e) => onDragEnd?.(e, id)}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="mt-2 text-sm opacity-80">
        {type.charAt(0).toUpperCase() + type.slice(1)} Node
      </div>
    </div>
  )
}
