import { Connector } from '@agentfleet/types'

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
    lastSync: new Date('2024-03-20T10:30:00Z'),
    config: {
      workspace: 'agentfleet-team',
      channels: ['general', 'announcements'],
      botToken: 'xoxb-****',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'OpenAPI Connector',
    type: 'input',
    description: 'OpenAPI 스펙을 통해 API를 연동합니다.',
    category: 'api',
    status: 'active',
    icon: '🌐',
    config: {
      endpoint: '/api/v1',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    lastSync: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    lastSync: new Date('2024-03-20T10:00:00Z'),
    config: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'agentfleet_db',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
