import { PipelineExecutionRecord } from '@agentfleet/types'

export const mockPipelineExecutions: PipelineExecutionRecord[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    pipelineId: 'pipeline-1',
    pipelineName: '기본 추론 파이프라인',
    args: {
      __input__: '사용자 입력 데이터',
    },
    status: 'completed',
    startTime: new Date('2024-03-15T09:00:00.000Z'),
    endTime: new Date('2024-03-15T09:02:00.000Z'),
    nodeResults: [
      {
        nodeId: 'node-1',
        nodeName: '입력 처리',
        nodeType: 'prompt',
        args: {
          __input__: '사용자 입력 데이터',
        },
        output: '입력 처리: "사용자 입력 데이터"',
        startTime: new Date('2024-03-15T09:00:00.000Z'),
        endTime: new Date('2024-03-15T09:00:30.000Z'),
        status: 'success',
        config: {
          templateId: 'prompt-template-1',
          contextSources: [],
          variables: {},
          contextMapping: { input: [], output: [] },
        },
      },
      {
        nodeId: 'node-2',
        nodeName: '계획 수립',
        nodeType: 'prompt',
        args: {
          __input__: '사용자 입력 데이터',
        },
        output: '계획 수립: 사용자 요청 분석 및 실행 계획 수립',
        startTime: new Date('2024-03-15T09:00:31.000Z'),
        endTime: new Date('2024-03-15T09:01:00.000Z'),
        status: 'success',
        config: {
          templateId: 'prompt-template-1',
          contextSources: [],
          variables: {},
          contextMapping: { input: [], output: [] },
        },
      },
      {
        nodeId: 'node-3',
        nodeName: '실행',
        nodeType: 'prompt',
        args: {
          __input__: '계획 수립: 사용자 요청 분석 및 실행 계획 수립',
        },
        output: '행동 실행: 계획에 따른 작업 수행',
        startTime: new Date('2024-03-15T09:01:01.000Z'),
        endTime: new Date('2024-03-15T09:02:00.000Z'),
        status: 'success',
        config: {
          templateId: 'prompt-template-1',
          contextSources: [],
          variables: {},
          contextMapping: { input: [], output: [] },
        },
      },
    ],
    finalOutput: '행동 실행: 계획에 따른 작업 수행',
    createdAt: new Date('2024-03-15T09:00:00.000Z'),
    updatedAt: new Date('2024-03-15T09:02:00.000Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    pipelineId: 'pipeline-2',
    pipelineName: '고급 분석 파이프라인',
    args: {
      __input__: '분석 요청 데이터',
    },
    status: 'failed',
    startTime: new Date('2024-03-15T10:00:00.000Z'),
    endTime: new Date('2024-03-15T10:01:30.000Z'),
    nodeResults: [
      {
        nodeId: 'node-1',
        nodeName: '데이터 전처리',
        nodeType: 'prompt',
        args: {
          __input__: '분석 요청 데이터',
        },
        output: '데이터 처리: 입력 데이터 정규화',
        startTime: new Date('2024-03-15T10:00:00.000Z'),
        endTime: new Date('2024-03-15T10:00:30.000Z'),
        status: 'success',
      },
      {
        nodeId: 'node-2',
        nodeName: '분석 수행',
        nodeType: 'prompt',
        args: {
          __input__: '분석 요청 데이터',
        },
        output: '오류: 데이터 분석 중 예외 발생',
        startTime: new Date('2024-03-15T10:00:31.000Z'),
        endTime: new Date('2024-03-15T10:01:30.000Z'),
        status: 'failed',
      },
    ],
    error: '데이터 분석 중 예외가 발생했습니다.',
    createdAt: new Date('2024-03-15T10:00:00.000Z'),
    updatedAt: new Date('2024-03-15T10:01:30.000Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    pipelineId: 'pipeline-1',
    pipelineName: '기본 추론 파이프라인',
    args: {
      __input__: '두 번째 테스트 입력',
    },
    status: 'running',
    startTime: new Date('2024-03-15T11:00:00.000Z'),
    nodeResults: [
      {
        nodeId: 'node-1',
        nodeName: '입력 처리',
        nodeType: 'prompt',
        args: {
          __input__: '두 번째 테스트 입력',
        },
        output: '입력 처리: "두 번째 테스트 입력"',
        startTime: new Date('2024-03-15T11:00:00.000Z'),
        endTime: new Date('2024-03-15T11:00:30.000Z'),
        status: 'success',
      },
    ],
    createdAt: new Date('2024-03-15T11:00:00.000Z'),
    updatedAt: new Date('2024-03-15T11:00:00.000Z'),
  },
]
