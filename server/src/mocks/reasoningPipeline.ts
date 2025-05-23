import { Pipeline } from '@agentfleet/types'

export const mockPipelines: Pipeline[] = [
  {
    id: 'pipeline-1',
    name: '기본 추론 파이프라인',
    description: '사용자 입력을 분석하고 적절한 응답을 생성하는 파이프라인',
    agentId: '1',
    nodes: [
      {
        id: 'node-1',
        type: 'prompt',
        position: { x: 0, y: 0 },
        data: {
          name: '지식 베이스 검색',
          config: {
            promptId: 'knowledge-base-search',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'kb-1',
                config: {
                  query: '{{input.text}}',
                  filters: {},
                  options: {
                    limit: 5,
                    threshold: 0.7,
                  },
                },
              },
            ],
            contextMapping: {
              input: ['text'],
              output: ['documents'],
            },
          },
        },
      },
      {
        id: 'node-2',
        type: 'prompt',
        position: { x: 100, y: 0 },
        data: {
          name: '의도 분석',
          config: {
            promptId: 'intent-analysis',
            variables: {},
            contextMapping: {
              input: ['text', 'documents'],
              output: ['intent'],
            },
          },
        },
      },
      {
        id: 'node-3',
        type: 'prompt',
        position: { x: 200, y: 0 },
        data: {
          name: '정보 수집',
          description: '필요한 정보를 수집하는 노드',
          config: {
            promptId: 'template-3',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'kb-1',
                config: {
                  query: '{{plan}}',
                  filters: {
                    searchDepth: '3',
                    maxResults: '5',
                  },
                  options: {
                    threshold: 0.7,
                  },
                },
              },
            ],
            contextMapping: {
              input: ['plan', 'entities'],
              output: ['searchResults', 'relevantInfo'],
            },
          },
        },
      },
      {
        id: 'node-4',
        type: 'prompt',
        position: { x: 300, y: 0 },
        data: {
          name: '응답 결정',
          description: '수집된 정보를 바탕으로 최종 응답을 결정하는 노드',
          config: {
            promptId: 'template-4',
            variables: {
              responseStyle: 'informative',
              formatType: 'markdown',
            },
            contextMapping: {
              input: ['searchResults', 'relevantInfo', 'plan'],
              output: ['finalResponse', 'confidence'],
            },
            maxTokens: 2500,
            temperature: 0.7,
          },
        },
      },
      {
        id: 'node-5',
        type: 'prompt',
        position: { x: 400, y: 0 },
        data: {
          name: '응답 생성',
          description: '최종 응답을 생성하고 포맷팅하는 노드',
          config: {
            promptId: 'template-5',
            variables: {
              format: 'markdown',
              style: 'conversational',
            },
            contextMapping: {
              input: ['finalResponse', 'confidence'],
              output: ['formattedResponse'],
            },
            maxTokens: 1000,
            temperature: 0.5,
          },
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' },
      { id: 'edge-3', source: 'node-3', target: 'node-4', type: 'default' },
      { id: 'edge-4', source: 'node-4', target: 'node-5', type: 'default' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pipeline-2',
    name: '고급 추론 파이프라인',
    description: '복잡한 질문에 대한 심층 분석과 응답을 생성하는 파이프라인',
    agentId: '1',
    nodes: [
      {
        id: 'node-1',
        type: 'prompt',
        position: { x: 0, y: 0 },
        data: {
          name: '사용자 입력',
          description: '사용자로부터 입력을 받는 노드',
          config: {
            promptId: 'template-1',
            variables: {},
            contextMapping: {
              input: ['text'],
              output: ['intent', 'entities', 'complexity'],
            },
            maxTokens: 1000,
            temperature: 0.7,
          },
        },
      },
      {
        id: 'node-2',
        type: 'prompt',
        position: { x: 100, y: 0 },
        data: {
          name: '분석 계획',
          description: '입력의 복잡도에 따른 분석 계획 수립',
          config: {
            promptId: 'template-2',
            variables: {
              systemRole: '분석 전문가',
            },
            contextMapping: {
              input: ['intent', 'entities', 'complexity'],
              output: ['analysisSteps', 'requiredData'],
            },
            maxTokens: 2000,
            temperature: 0.5,
          },
        },
      },
      {
        id: 'node-3',
        type: 'prompt',
        position: { x: 200, y: 0 },
        data: {
          name: '데이터 수집',
          description: '필요한 데이터를 다양한 소스에서 수집',
          config: {
            promptId: 'template-3',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'data-1',
                config: {
                  query: '{{analysisSteps}}',
                  filters: {
                    searchDepth: '5',
                    maxResults: '10',
                  },
                  options: {
                    threshold: 0.7,
                  },
                },
              },
            ],
            contextMapping: {
              input: ['analysisSteps', 'requiredData'],
              output: ['collectedData', 'dataSources'],
            },
          },
        },
      },
      {
        id: 'node-4',
        type: 'prompt',
        position: { x: 300, y: 0 },
        data: {
          name: '데이터 분석',
          description: '수집된 데이터의 심층 분석 수행',
          config: {
            promptId: 'template-4',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'analysis-1',
                config: {
                  query: '{{collectedData}}',
                  filters: {
                    analysisDepth: 'deep',
                    method: 'comprehensive',
                  },
                  options: {
                    threshold: 0.7,
                  },
                },
              },
            ],
            contextMapping: {
              input: ['collectedData', 'dataSources'],
              output: ['analysisResults', 'insights'],
            },
          },
        },
      },
      {
        id: 'node-5',
        type: 'prompt',
        position: { x: 400, y: 0 },
        data: {
          name: '결론 도출',
          description: '분석 결과를 바탕으로 결론 도출',
          config: {
            promptId: 'template-5',
            variables: {
              confidenceThreshold: '0.8',
              method: 'weighted',
            },
            contextMapping: {
              input: ['analysisResults', 'insights'],
              output: ['conclusions', 'confidence'],
            },
            maxTokens: 2000,
            temperature: 0.7,
          },
        },
      },
      {
        id: 'node-6',
        type: 'prompt',
        position: { x: 500, y: 0 },
        data: {
          name: '응답 생성',
          description: '최종 응답 생성 및 포맷팅',
          config: {
            promptId: 'template-6',
            variables: {
              format: 'markdown',
              style: 'academic',
            },
            contextMapping: {
              input: ['conclusions', 'confidence', 'dataSources'],
              output: ['formattedResponse'],
            },
            maxTokens: 3000,
            temperature: 0.5,
          },
        },
      },
    ],
    edges: [
      { id: 'edge-1-2', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2-3', source: 'node-2', target: 'node-3', type: 'default' },
      { id: 'edge-3-4', source: 'node-3', target: 'node-4', type: 'default' },
      { id: 'edge-4-5', source: 'node-4', target: 'node-5', type: 'default' },
      { id: 'edge-5-6', source: 'node-5', target: 'node-6', type: 'default' },
    ],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'pipeline-3',
    agentId: '3',
    name: '멀티모달 추론 파이프라인',
    description:
      '이미지와 텍스트를 함께 처리할 수 있는 멀티모달 추론 파이프라인',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'node-1',
        type: 'prompt',
        position: { x: 200, y: 100 },
        data: {
          name: '멀티모달 입력',
          description: '텍스트와 이미지를 함께 입력받습니다',
          config: {
            promptId: 'template-1',
            variables: {},
            contextMapping: {
              input: ['text', 'image'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
      {
        id: 'node-2',
        type: 'prompt',
        position: { x: 100, y: 250 },
        connectorId: 'vision-model',
        data: {
          name: '이미지 분석',
          description: '입력된 이미지를 분석하고 주요 특징을 추출합니다',
          config: {
            promptId: 'template-3',
            variables: {
              imageUrl: '{{node-1.images[0]}}',
              detailLevel: 'high',
            },
            contextMapping: {
              input: ['images'],
              output: [
                'objects',
                'sceneDescription',
                'extractedText',
                'mood',
                'specialNotes',
              ],
            },
          },
        },
      },
      {
        id: 'node-3',
        type: 'prompt',
        position: { x: 300, y: 250 },
        connectorId: 'llm-gpt4',
        data: {
          name: '텍스트 분석',
          description: '입력된 텍스트를 분석하고 주요 의도를 파악합니다',
          config: {
            promptId: 'template-4',
            variables: {},
            contextMapping: {
              input: ['text'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
      {
        id: 'node-4',
        type: 'prompt',
        position: { x: 200, y: 400 },
        data: {
          name: '통합 분석 및 결정',
          description:
            '이미지와 텍스트 분석 결과를 통합하고 응답 방향을 결정합니다',
          config: {
            promptId: 'template-5',
            variables: {},
            contextMapping: {
              input: ['intent', 'entities'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
      {
        id: 'node-5',
        type: 'prompt',
        position: { x: 200, y: 550 },
        data: {
          name: '멀티모달 응답 생성',
          description:
            '텍스트 응답과 필요시 이미지 생성을 포함한 응답을 생성합니다',
          config: {
            promptId: 'template-6',
            variables: {},
            contextMapping: {
              input: ['intent', 'entities'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
    ],
    edges: [
      { id: 'edge-1-2', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-1-3', source: 'node-1', target: 'node-3', type: 'default' },
      { id: 'edge-2-4', source: 'node-2', target: 'node-4', type: 'default' },
      { id: 'edge-3-4', source: 'node-3', target: 'node-4', type: 'default' },
      { id: 'edge-4-5', source: 'node-4', target: 'node-5', type: 'default' },
    ],
  },
  {
    id: 'pipeline-4',
    agentId: '4',
    name: '병렬 처리 추론 파이프라인',
    description: '여러 작업을 동시에 처리할 수 있는 병렬 처리 파이프라인',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'node-1',
        type: 'prompt',
        position: { x: 200, y: 100 },
        data: {
          name: '복합 입력',
          description: '여러 종류의 입력을 동시에 처리합니다',
          config: {
            promptId: 'template-1',
            variables: {},
            contextMapping: {
              input: ['text', 'image', 'audio'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
      {
        id: 'node-2a',
        type: 'prompt',
        position: { x: 100, y: 250 },
        data: {
          name: '텍스트 처리',
          description: '텍스트 입력을 병렬로 처리',
          config: {
            promptId: 'template-2',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'text-processor-1',
                config: {
                  query: '{{text}}',
                  filters: {},
                  options: {},
                },
              },
            ],
            contextMapping: {
              input: ['text'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
      {
        id: 'node-2b',
        type: 'prompt',
        position: { x: 300, y: 250 },
        data: {
          name: '이미지 처리',
          description: '이미지 입력을 병렬로 처리',
          config: {
            promptId: 'template-2',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'image-processor-1',
                config: {
                  query: '{{image}}',
                  filters: {},
                  options: {},
                },
              },
            ],
            contextMapping: {
              input: ['image'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
      {
        id: 'node-2c',
        type: 'prompt',
        position: { x: 500, y: 250 },
        data: {
          name: '오디오 처리',
          description: '오디오 입력을 병렬로 처리',
          config: {
            promptId: 'template-2',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'audio-processor-1',
                config: {
                  query: '{{audio}}',
                  filters: {},
                  options: {},
                },
              },
            ],
            contextMapping: {
              input: ['audio'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
      {
        id: 'node-3',
        type: 'prompt',
        position: { x: 200, y: 400 },
        data: {
          name: '결과 통합',
          description: '병렬 처리된 결과를 통합',
          config: {
            promptId: 'template-3',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'aggregator-1',
                config: {
                  query: '{{intent}}',
                  filters: {},
                  options: {},
                },
              },
            ],
            contextMapping: {
              input: ['intent', 'entities'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
      {
        id: 'node-4a',
        type: 'prompt',
        position: { x: 100, y: 550 },
        data: {
          name: '심층 분석 A',
          description: '첫 번째 분석 경로',
          config: {
            promptId: 'template-3',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'gpt4',
                config: {
                  query: '{{intent}}',
                  filters: {},
                  options: {
                    temperature: 0.7,
                    maxTokens: 2000,
                  },
                },
              },
            ],
            contextMapping: {
              input: ['intent', 'entities'],
              output: ['analysis_a'],
            },
          },
        },
      },
      {
        id: 'node-4b',
        type: 'prompt',
        position: { x: 300, y: 550 },
        data: {
          name: '심층 분석 B',
          description: '두 번째 분석 경로',
          config: {
            promptId: 'template-4',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'claude',
                config: {
                  query: '{{intent}}',
                  filters: {},
                  options: {
                    temperature: 0.7,
                    maxTokens: 2000,
                  },
                },
              },
            ],
            contextMapping: {
              input: ['intent', 'entities'],
              output: ['analysis_b'],
            },
          },
        },
      },
      {
        id: 'node-5',
        type: 'prompt',
        position: { x: 200, y: 700 },
        data: {
          name: '분석 결과 통합',
          description: '병렬 분석 결과를 비교하고 최적의 결과 선택',
          config: {
            promptId: 'template-5',
            variables: {},
            contextMapping: {
              input: ['intent', 'entities'],
              output: ['intent', 'entities'],
            },
          },
        },
      },
    ],
    edges: [
      {
        id: 'edge-1-2a',
        source: 'node-1',
        target: 'node-2a',
        type: 'parallel',
      },
      {
        id: 'edge-1-2b',
        source: 'node-1',
        target: 'node-2b',
        type: 'parallel',
      },
      {
        id: 'edge-1-2c',
        source: 'node-1',
        target: 'node-2c',
        type: 'parallel',
      },
      { id: 'edge-2a-3', source: 'node-2a', target: 'node-3', type: 'async' },
      { id: 'edge-2b-3', source: 'node-2b', target: 'node-3', type: 'async' },
      { id: 'edge-2c-3', source: 'node-2c', target: 'node-3', type: 'async' },
      {
        id: 'edge-3-4a',
        source: 'node-3',
        target: 'node-4a',
        type: 'parallel',
      },
      {
        id: 'edge-3-4b',
        source: 'node-3',
        target: 'node-4b',
        type: 'parallel',
      },
      { id: 'edge-4a-5', source: 'node-4a', target: 'node-5', type: 'async' },
      { id: 'edge-4b-5', source: 'node-4b', target: 'node-5', type: 'async' },
    ],
  },
  {
    id: 'weather-pipeline',
    name: '날씨 정보 처리 파이프라인',
    description: '사용자의 날씨 관련 질문을 처리하고 응답하는 파이프라인',
    agentId: 'weather-agent',
    nodes: [
      {
        id: 'node-1',
        type: 'prompt',
        position: { x: 0, y: 0 },
        data: {
          name: '의도 분석',
          description: '사용자의 날씨 관련 질문 의도를 분석',
          config: {
            promptId: 'weather-intent',
            variables: {},
            contextMapping: {
              input: ['text'],
              output: ['type', 'location', 'time', 'requiredInfo'],
            },
          },
        },
      },
      {
        id: 'node-2',
        type: 'prompt',
        position: { x: 200, y: 0 },
        data: {
          name: '날씨 정보 검색',
          description: '날씨 데이터베이스에서 정보 검색',
          config: {
            promptId: 'weather-response',
            variables: {},
            contextSources: [
              {
                type: 'connector',
                connectorId: 'weather-kb',
                config: {
                  query: '{{location}} {{time}}',
                  filters: {
                    type: '{{type}}',
                    fields: '{{requiredInfo}}',
                  },
                  options: {
                    limit: 1,
                  },
                },
              },
            ],
            contextMapping: {
              input: ['type', 'location', 'time', 'requiredInfo'],
              output: ['response'],
            },
          },
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
