export interface Connector {
  id: string
  name: string
  type: 'input' | 'data-source' | 'action'
  description: string
  category: 'communication' | 'documentation' | 'api' | 'database'
  status: 'active' | 'inactive' | 'error'
  icon: string
  lastSync?: string
  config?: Record<string, unknown>
}

export const mockConnectors: Connector[] = [
  // Input Connectors
  {
    id: '1',
    name: 'Slack',
    type: 'input',
    description: 'Receive messages from Slack channels',
    category: 'communication',
    status: 'active',
    icon: '💬',
    lastSync: '2024-03-20T10:30:00Z',
    config: {
      workspace: 'agentfleet-team',
      channels: ['general', 'announcements'],
      botToken: 'xoxb-****',
    },
  },
  {
    id: '2',
    name: 'Email',
    type: 'input',
    description: 'Receive emails from configured accounts',
    category: 'communication',
    status: 'active',
    icon: '📧',
    lastSync: '2024-03-20T09:15:00Z',
    config: {
      accounts: ['support@agentfleet.com'],
      folders: ['inbox', 'processed'],
    },
  },
  {
    id: '3',
    name: 'Webhook',
    type: 'input',
    description: 'Receive HTTP webhook requests',
    category: 'api',
    status: 'active',
    icon: '🔌',
    config: {
      endpoint: '/api/webhooks',
      methods: ['POST'],
    },
  },

  // Data Source Connectors
  {
    id: '4',
    name: 'Database',
    type: 'data-source',
    description: 'Query and manipulate database data',
    category: 'database',
    status: 'active',
    icon: '🗄️',
    lastSync: '2024-03-20T10:00:00Z',
    config: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'agentfleet_db',
    },
  },
  {
    id: '5',
    name: 'API',
    type: 'data-source',
    description: 'Fetch data from external APIs',
    category: 'api',
    status: 'active',
    icon: '🌐',
    lastSync: '2024-03-20T09:30:00Z',
    config: {
      baseUrl: 'https://api.example.com',
      endpoints: ['/users', '/products'],
    },
  },
  {
    id: '6',
    name: 'File System',
    type: 'data-source',
    description: 'Read and write files',
    category: 'documentation',
    status: 'active',
    icon: '📁',
    lastSync: '2024-03-20T08:45:00Z',
    config: {
      root: '/data',
      patterns: ['*.json', '*.csv'],
    },
  },

  // Action Connectors
  {
    id: '7',
    name: 'Slack',
    type: 'action',
    description: 'Send messages to Slack channels',
    category: 'communication',
    status: 'active',
    icon: '💬',
    lastSync: '2024-03-20T10:30:00Z',
    config: {
      workspace: 'agentfleet-team',
      channels: ['general', 'announcements'],
      botToken: 'xoxb-****',
    },
  },
  {
    id: '8',
    name: 'Email',
    type: 'action',
    description: 'Send emails to recipients',
    category: 'communication',
    status: 'active',
    icon: '📧',
    lastSync: '2024-03-20T09:15:00Z',
    config: {
      smtp: {
        host: 'smtp.agentfleet.com',
        port: 587,
      },
    },
  },
  {
    id: '9',
    name: 'Notification',
    type: 'action',
    description: 'Send push notifications',
    category: 'communication',
    status: 'active',
    icon: '🔔',
    lastSync: '2024-03-20T10:15:00Z',
    config: {
      provider: 'firebase',
      projectId: 'agentfleet-app',
    },
  },
]
