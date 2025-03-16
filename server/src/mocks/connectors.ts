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

  // LLM Connectors
  {
    id: 'llm-gpt4',
    name: 'GPT-4',
    type: 'action',
    description: 'OpenAI GPT-4 모델',
    category: 'ai',
    status: 'active',
    icon: '🤖',
    config: {
      model: 'gpt-4',
      provider: 'openai',
      maxTokens: 8192,
      temperature: 0.7,
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'llm-claude',
    name: 'Claude',
    type: 'action',
    description: 'Anthropic Claude 모델',
    category: 'ai',
    status: 'active',
    icon: '🤖',
    config: {
      model: 'claude-3-opus',
      provider: 'anthropic',
      maxTokens: 200000,
      temperature: 0.7,
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Vision Model Connectors
  {
    id: 'vision-model',
    name: 'Vision Model',
    type: 'action',
    description: '이미지 분석 모델',
    category: 'ai',
    status: 'active',
    icon: '👁️',
    config: {
      model: 'gpt-4-vision',
      provider: 'openai',
      maxTokens: 4096,
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Knowledge Base Connectors
  {
    id: 'kb-1',
    name: '지식 베이스',
    type: 'data-source',
    description: '벡터 데이터베이스 기반 지식 저장소',
    category: 'storage',
    status: 'active',
    icon: '📚',
    config: {
      type: 'vector-db',
      endpoint: 'http://localhost:8000',
      collection: 'knowledge',
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Data Source Connectors
  {
    id: 'data-1',
    name: '데이터 소스',
    type: 'data-source',
    description: '외부 데이터 소스',
    category: 'data',
    status: 'active',
    icon: '💾',
    config: {
      type: 'api',
      endpoint: 'http://localhost:8001',
      apiKey: 'test-key',
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Analysis Connectors
  {
    id: 'analysis-1',
    name: '분석 엔진',
    type: 'action',
    description: '데이터 분석 엔진',
    category: 'analysis',
    status: 'active',
    icon: '📊',
    config: {
      type: 'analysis-engine',
      endpoint: 'http://localhost:8002',
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Processing Connectors
  {
    id: 'text-processor-1',
    name: '텍스트 처리기',
    type: 'action',
    description: '텍스트 처리 및 분석',
    category: 'processing',
    status: 'active',
    icon: '📝',
    config: {
      type: 'text',
      endpoint: 'http://localhost:8003',
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'image-processor-1',
    name: '이미지 처리기',
    type: 'action',
    description: '이미지 처리 및 분석',
    category: 'processing',
    status: 'active',
    icon: '🖼️',
    config: {
      type: 'image',
      endpoint: 'http://localhost:8004',
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'audio-processor-1',
    name: '오디오 처리기',
    type: 'action',
    description: '오디오 처리 및 분석',
    category: 'processing',
    status: 'active',
    icon: '🎵',
    config: {
      type: 'audio',
      endpoint: 'http://localhost:8005',
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Result Aggregator
  {
    id: 'aggregator-1',
    name: '결과 통합기',
    type: 'action',
    description: '여러 처리 결과를 통합',
    category: 'processing',
    status: 'active',
    icon: '🔄',
    config: {
      type: 'aggregator',
      endpoint: 'http://localhost:8006',
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Consensus Engine
  {
    id: 'consensus-engine',
    name: '합의 엔진',
    type: 'action',
    description: '여러 모델의 결과를 비교하고 최적의 결과 선택',
    category: 'processing',
    status: 'active',
    icon: '⚖️',
    config: {
      type: 'consensus',
      endpoint: 'http://localhost:8007',
    },
    lastSync: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
