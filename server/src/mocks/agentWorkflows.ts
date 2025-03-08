import { Workflow } from '@agentfleet/types'

export const mockWorkflows: Workflow[] = [
  {
    id: 'workflow-1',
    agentId: '1',
    name: 'Slack 알림 워크플로우',
    description: 'GitHub 이슈가 생성되면 Slack으로 알림을 보냅니다.',
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: 'node-start',
        type: 'start',
        position: { x: 50, y: 100 },
        data: {
          name: '시작',
        },
      },
      {
        id: 'node-1',
        type: 'input',
        connectorId: 'github-1',
        position: { x: 200, y: 100 },
        data: {
          name: 'GitHub 이슈 생성',
          config: {
            event: 'issue.created',
            repository: 'agentfleet/agentfleet',
          },
        },
      },
      {
        id: 'node-2',
        type: 'process',
        position: { x: 400, y: 100 },
        data: {
          name: '메시지 포맷팅',
          config: {
            template: '새로운 이슈가 생성되었습니다: {title}',
          },
        },
      },
      {
        id: 'node-3',
        type: 'output',
        connectorId: 'slack-1',
        position: { x: 600, y: 100 },
        data: {
          name: 'Slack 알림',
          config: {
            channel: 'announcements',
          },
        },
      },
      {
        id: 'node-end',
        type: 'end',
        position: { x: 750, y: 100 },
        data: {
          name: '종료',
        },
      },
    ],
    edges: [
      {
        id: 'edge-start-1',
        source: 'node-start',
        target: 'node-1',
        type: 'default',
      },
      { id: 'edge-1-2', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2-3', source: 'node-2', target: 'node-3', type: 'default' },
      {
        id: 'edge-3-end',
        source: 'node-3',
        target: 'node-end',
        type: 'default',
      },
    ],
  },
  {
    id: 'workflow-2',
    agentId: '2',
    name: '문서 동기화 워크플로우',
    description: 'Notion 문서가 업데이트되면 MongoDB에 저장합니다.',
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: 'node-1',
        type: 'input',
        connectorId: 'notion-1',
        position: { x: 100, y: 100 },
        data: {
          name: 'Notion 문서 변경',
          config: {
            databaseId: '123456789',
            filter: 'status = "published"',
          },
        },
      },
      {
        id: 'node-2',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          name: '데이터 변환',
          config: {
            mapping: {
              title: 'title',
              content: 'content',
              status: 'status',
            },
          },
        },
      },
      {
        id: 'node-3',
        type: 'output',
        connectorId: 'mongodb-1',
        position: { x: 500, y: 100 },
        data: {
          name: 'MongoDB 저장',
          config: {
            collection: 'documents',
          },
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' },
    ],
  },
  {
    id: 'workflow-3',
    agentId: '3',
    name: 'API 연동 워크플로우',
    description:
      'OpenAPI를 통해 외부 API를 호출하고 결과를 Discord로 전송합니다.',
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: 'node-1',
        type: 'input',
        connectorId: 'openapi-1',
        position: { x: 100, y: 100 },
        data: {
          name: 'API 호출',
          config: {
            endpoint: '/users',
            method: 'GET',
          },
        },
      },
      {
        id: 'node-2',
        type: 'process',
        position: { x: 300, y: 100 },
        data: {
          name: '응답 처리',
          config: {
            transform:
              'data.map(user => ({ name: user.name, email: user.email }))',
          },
        },
      },
      {
        id: 'node-3',
        type: 'output',
        connectorId: 'discord-1',
        position: { x: 500, y: 100 },
        data: {
          name: 'Discord 메시지',
          config: {
            channel: 'api-results',
          },
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' },
    ],
  },
]
