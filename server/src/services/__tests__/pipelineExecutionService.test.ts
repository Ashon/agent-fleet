import { Pipeline, PipelineEdge, PipelineNode } from '@agentfleet/types'
import { Response } from 'express'
import { pipelineExecutionService } from '../pipelineExecutionService'

// 테스트 환경 설정
process.env.NODE_ENV = 'test'

describe('PipelineExecutionService', () => {
  let mockResponse: Partial<Response>
  let writtenData: string[]

  beforeEach(() => {
    writtenData = []
    mockResponse = {
      write: jest.fn((data: string) => {
        writtenData.push(data)
        return true
      }),
    }
  })

  const createMockPipeline = (): Pipeline => ({
    id: 'test-pipeline-1',
    name: '테스트 파이프라인',
    description: '테스트용 파이프라인입니다.',
    nodes: [
      {
        id: 'node-1',
        type: 'input',
        data: { name: '입력 노드' },
        position: { x: 0, y: 0 },
      },
      {
        id: 'node-2',
        type: 'process',
        data: { name: '처리 노드', description: '데이터 처리' },
        position: { x: 100, y: 0 },
      },
      {
        id: 'node-3',
        type: 'process',
        data: { name: '출력 노드' },
        position: { x: 200, y: 0 },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' },
    ],
    agentId: 'test-agent-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  describe('streamPipelineExecution', () => {
    // 테스트 타임아웃 시간 증가
    jest.setTimeout(10000)

    it('파이프라인 실행 시작과 완료 메시지를 스트리밍해야 함', async () => {
      const mockPipeline = createMockPipeline()
      const testInput = '테스트 입력'

      await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        testInput,
        mockResponse as Response,
      )

      // 시작 메시지 확인
      const startMessage = JSON.parse(writtenData[0].replace('data: ', ''))
      expect(startMessage.type).toBe('start')
      expect(startMessage.message).toBe('파이프라인 실행을 시작합니다.')
      expect(startMessage.pipelineId).toBe(mockPipeline.id)
      expect(startMessage.pipelineName).toBe(mockPipeline.name)

      // 노드 실행 메시지들 확인
      const nodeStartMessages = writtenData.filter((data) =>
        data.includes('node-start'),
      )
      const nodeCompleteMessages = writtenData.filter((data) =>
        data.includes('node-complete'),
      )

      expect(nodeStartMessages.length).toBe(mockPipeline.nodes.length)
      expect(nodeCompleteMessages.length).toBe(mockPipeline.nodes.length)

      // 완료 메시지 확인
      const completeMessage = JSON.parse(
        writtenData[writtenData.length - 1].replace('data: ', ''),
      )
      expect(completeMessage.type).toBe('complete')
      expect(completeMessage.message).toBe('파이프라인 실행이 완료되었습니다.')
      expect(completeMessage.pipelineId).toBe(mockPipeline.id)
    })

    it('순차적인 노드 실행 순서를 지켜야 함', async () => {
      const mockPipeline = createMockPipeline()
      const testInput = '테스트 입력'

      await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        testInput,
        mockResponse as Response,
      )

      const nodeExecutionOrder = writtenData
        .filter((data) => data.includes('node-complete'))
        .map((data) => {
          const parsed = JSON.parse(data.replace('data: ', ''))
          return parsed.nodeId
        })

      // node-1 -> node-2 -> node-3 순서로 실행되어야 함
      expect(nodeExecutionOrder).toEqual(['node-1', 'node-2', 'node-3'])
    })

    it('에러가 발생했을 때 적절한 에러 메시지를 전송해야 함', async () => {
      const mockPipeline: Pipeline = {
        ...createMockPipeline(),
        nodes: [], // 의도적으로 노드가 없는 파이프라인 생성
      }

      await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        '테스트 입력',
        mockResponse as Response,
      )

      const errorMessage = writtenData
        .map((data) => JSON.parse(data.replace('data: ', '')))
        .find((msg) => msg.type === 'error')

      expect(errorMessage).toBeDefined()
      expect(errorMessage?.message).toBe('파이프라인에 실행할 노드가 없습니다.')
    })

    it('노드 타입별로 올바른 출력을 생성해야 함', async () => {
      const testInput = '테스트 입력'
      const mockPipeline: Pipeline = {
        ...createMockPipeline(),
        nodes: [
          {
            id: 'input-node',
            type: 'input',
            data: { name: '입력 노드' },
            position: { x: 0, y: 0 },
          },
          {
            id: 'plan-node',
            type: 'plan',
            data: { name: '계획 노드', description: '계획 수립' },
            position: { x: 100, y: 0 },
          },
          {
            id: 'action-node',
            type: 'action',
            data: { name: '행동 노드', description: '작업 실행' },
            position: { x: 200, y: 0 },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'input-node',
            target: 'plan-node',
            type: 'default',
          },
          {
            id: 'edge-2',
            source: 'plan-node',
            target: 'action-node',
            type: 'default',
          },
        ],
      }

      await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        testInput,
        mockResponse as Response,
      )

      const nodeOutputs = writtenData
        .filter((data) => data.includes('node-complete'))
        .map((data) => JSON.parse(data.replace('data: ', '')))

      expect(nodeOutputs[0].output).toBe(`입력 처리: "${testInput}"`)
      expect(nodeOutputs[1].output).toBe('계획 수립: 계획 수립')
      expect(nodeOutputs[2].output).toBe('행동 실행: 작업 실행')
    })
  })
})
