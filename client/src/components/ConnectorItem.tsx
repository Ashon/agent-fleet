import { Connector } from '@agentfleet/types'

interface ConnectorItemProps {
  connector: Connector
  onAdd: (connector: Connector) => void
}

export default function ConnectorItem({
  connector,
  onAdd,
}: ConnectorItemProps) {
  const getTypeColor = (type: Connector['type']) => {
    switch (type) {
      case 'input':
        return 'primary'
      case 'data-source':
        return 'warning'
      case 'action':
        return 'accent'
      default:
        return 'neutral'
    }
  }

  const handleAdd = (type: Connector['type']) => {
    onAdd({ ...connector, type })
  }

  return (
    <div className="items-center justify-between p-2 rounded-lg bg-base-100">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-full bg-${getTypeColor(
            'input',
          )}/10 flex items-center justify-center`}
        >
          <span className="text-lg">{connector.icon}</span>
        </div>
        <div>
          <div className="text-sm font-medium">{connector.name}</div>
          <div className="text-xs opacity-80">{connector.description}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`btn btn-xs btn-primary text-white`}
          onClick={() => handleAdd('input')}
        >
          <span className="text-xs">Input</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          className={`btn btn-xs btn-warning text-white`}
          onClick={() => handleAdd('data-source')}
        >
          <span className="text-xs">Data</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          className={`btn btn-xs btn-accent text-white`}
          onClick={() => handleAdd('action')}
        >
          <span className="text-xs">Action</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
