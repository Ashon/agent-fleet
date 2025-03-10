import { Pipeline } from '@agentfleet/types'

export const mockPipelines: Pipeline[] = [
  {
    id: 'pipeline-1',
    agentId: '1',
    name: '기본 추론 파이프라인',
    description:
      '사용자 입력을 분석하고 적절한 응답을 생성하는 기본 추론 파이프라인',
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: 'node-1',
        type: 'input',
        position: { x: 200, y: 100 },
        data: {
          name: '사용자 입력',
          description: '사용자로부터 받은 질문이나 요청을 처리합니다',
          config: {
            inputType: 'text',
            maxLength: 1000,
          },
        },
      },
      {
        id: 'node-2',
        type: 'plan',
        position: { x: 200, y: 250 },
        connectorId: 'llm-gpt4',
        data: {
          name: '의도 파악 및 계획',
          description: '사용자 입력의 의도를 파악하고 응답 계획을 수립합니다',
          config: {
            prompt: '사용자의 의도를 파악하고 어떻게 응답할지 계획을 세우세요',
            temperature: 0.7,
          },
        },
      },
      {
        id: 'node-3',
        type: 'decision',
        position: { x: 200, y: 400 },
        connectorId: 'llm-gpt4',
        data: {
          name: '도구 선택',
          description: '필요한 도구를 선택하고 실행 여부를 결정합니다',
          config: {
            tools: ['search', 'calculator', 'database'],
            decisionThreshold: 0.8,
          },
        },
      },
      {
        id: 'node-4',
        type: 'action',
        position: { x: 200, y: 550 },
        connectorId: 'llm-gpt4',
        data: {
          name: '응답 생성',
          description: '최종 응답을 생성하고 사용자에게 전달합니다',
          config: {
            format: 'markdown',
            maxTokens: 500,
          },
        },
      },
    ],
    edges: [
      { id: 'edge-1-2', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2-3', source: 'node-2', target: 'node-3', type: 'default' },
      { id: 'edge-3-4', source: 'node-3', target: 'node-4', type: 'default' },
    ],
  },
  {
    id: 'pipeline-2',
    agentId: '2',
    name: '검색 강화 추론 파이프라인',
    description:
      '웹 검색을 활용하여 최신 정보로 응답을 생성하는 추론 파이프라인',
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: 'node-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {
          name: '사용자 질문',
          description: '사용자의 질문을 입력받습니다',
          config: {
            inputType: 'text',
            requiresContext: false,
          },
        },
      },
      {
        id: 'node-2',
        type: 'plan',
        position: { x: 100, y: 250 },
        connectorId: 'llm-claude',
        data: {
          name: '검색 키워드 추출',
          description: '질문에서 핵심 검색 키워드를 추출합니다',
          config: {
            prompt: '다음 질문에서 검색에 필요한 핵심 키워드를 추출하세요',
            outputFormat: 'json',
          },
        },
      },
      {
        id: 'node-3',
        type: 'action',
        position: { x: 300, y: 250 },
        connectorId: 'search-api',
        data: {
          name: '웹 검색 실행',
          description: '추출된 키워드로 웹 검색을 실행합니다',
          config: {
            searchEngine: 'google',
            resultCount: 5,
          },
        },
      },
      {
        id: 'node-4',
        type: 'decision',
        position: { x: 100, y: 400 },
        connectorId: 'llm-claude',
        data: {
          name: '정보 관련성 평가',
          description: '검색 결과의 관련성을 평가하고 필요한 정보를 선택합니다',
          config: {
            relevanceThreshold: 0.7,
            maxSourceCount: 3,
          },
        },
      },
      {
        id: 'node-5',
        type: 'action',
        position: { x: 100, y: 550 },
        connectorId: 'llm-claude',
        data: {
          name: '최종 응답 생성',
          description: '검색 결과를 바탕으로 최종 응답을 생성합니다',
          config: {
            citeSources: true,
            format: 'markdown',
          },
        },
      },
    ],
    edges: [
      { id: 'edge-1-2', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2-3', source: 'node-2', target: 'node-3', type: 'default' },
      { id: 'edge-3-4', source: 'node-3', target: 'node-4', type: 'default' },
      { id: 'edge-4-5', source: 'node-4', target: 'node-5', type: 'default' },
    ],
  },
  {
    id: 'pipeline-3',
    agentId: '3',
    name: '멀티모달 추론 파이프라인',
    description:
      '이미지와 텍스트를 함께 처리할 수 있는 멀티모달 추론 파이프라인',
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: 'node-1',
        type: 'input',
        position: { x: 200, y: 100 },
        data: {
          name: '멀티모달 입력',
          description: '텍스트와 이미지를 함께 입력받습니다',
          config: {
            acceptedTypes: ['text', 'image'],
            maxImages: 5,
          },
        },
      },
      {
        id: 'node-2',
        type: 'plan',
        position: { x: 100, y: 250 },
        connectorId: 'vision-model',
        data: {
          name: '이미지 분석',
          description: '입력된 이미지를 분석하고 주요 특징을 추출합니다',
          config: {
            detectionLevel: 'high',
            extractText: true,
          },
        },
      },
      {
        id: 'node-3',
        type: 'plan',
        position: { x: 300, y: 250 },
        connectorId: 'llm-gpt4',
        data: {
          name: '텍스트 분석',
          description: '입력된 텍스트를 분석하고 주요 의도를 파악합니다',
          config: {
            contextAware: true,
            intentDetection: true,
          },
        },
      },
      {
        id: 'node-4',
        type: 'decision',
        position: { x: 200, y: 400 },
        connectorId: 'llm-gpt4',
        data: {
          name: '통합 분석 및 결정',
          description:
            '이미지와 텍스트 분석 결과를 통합하고 응답 방향을 결정합니다',
          config: {
            integrationStrategy: 'weighted',
            imageWeight: 0.6,
            textWeight: 0.4,
          },
        },
      },
      {
        id: 'node-5',
        type: 'action',
        position: { x: 200, y: 550 },
        connectorId: 'llm-gpt4',
        data: {
          name: '멀티모달 응답 생성',
          description:
            '텍스트 응답과 필요시 이미지 생성을 포함한 응답을 생성합니다',
          config: {
            generateImages: true,
            imageModel: 'dalle3',
            responseFormat: 'rich-text',
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
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: 'node-1',
        type: 'input',
        position: { x: 200, y: 100 },
        data: {
          name: '복합 입력',
          description: '여러 종류의 입력을 동시에 처리합니다',
          config: {
            inputTypes: ['text', 'image', 'audio'],
            parallel: true,
          },
        },
      },
      {
        id: 'node-2a',
        type: 'process',
        position: { x: 100, y: 250 },
        connectorId: 'text-processor',
        data: {
          name: '텍스트 처리',
          description: '텍스트 입력을 병렬로 처리',
          config: {
            processingType: 'async',
            batchSize: 10,
            executionGroup: 'input-processing',
          },
        },
      },
      {
        id: 'node-2b',
        type: 'process',
        position: { x: 300, y: 250 },
        connectorId: 'image-processor',
        data: {
          name: '이미지 처리',
          description: '이미지 입력을 병렬로 처리',
          config: {
            processingType: 'async',
            batchSize: 5,
            executionGroup: 'input-processing',
          },
        },
      },
      {
        id: 'node-2c',
        type: 'process',
        position: { x: 500, y: 250 },
        connectorId: 'audio-processor',
        data: {
          name: '오디오 처리',
          description: '오디오 입력을 병렬로 처리',
          config: {
            processingType: 'async',
            batchSize: 3,
            executionGroup: 'input-processing',
          },
        },
      },
      {
        id: 'node-3',
        type: 'aggregator',
        position: { x: 200, y: 400 },
        connectorId: 'result-aggregator',
        data: {
          name: '결과 통합',
          description: '병렬 처리된 결과를 통합',
          config: {
            waitForAll: true,
            timeout: 30000,
            retryStrategy: {
              maxAttempts: 3,
              backoff: 'exponential',
            },
          },
        },
      },
      {
        id: 'node-4a',
        type: 'analysis',
        position: { x: 100, y: 550 },
        connectorId: 'llm-gpt4',
        data: {
          name: '심층 분석 A',
          description: '첫 번째 분석 경로',
          config: {
            executionGroup: 'analysis',
            processingType: 'async',
          },
        },
      },
      {
        id: 'node-4b',
        type: 'analysis',
        position: { x: 300, y: 550 },
        connectorId: 'llm-claude',
        data: {
          name: '심층 분석 B',
          description: '두 번째 분석 경로',
          config: {
            executionGroup: 'analysis',
            processingType: 'async',
          },
        },
      },
      {
        id: 'node-5',
        type: 'decision',
        position: { x: 200, y: 700 },
        connectorId: 'consensus-engine',
        data: {
          name: '분석 결과 통합',
          description: '병렬 분석 결과를 비교하고 최적의 결과 선택',
          config: {
            consensusStrategy: 'weighted-vote',
            minConfidence: 0.8,
            timeout: 5000,
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
]
