import { Pipeline } from '@agentfleet/types'
import { Response } from 'express'
import { MockRepositoryDriver } from '../../drivers/mockRepositoryDriver'
import { PipelineExecutionsRepository } from '../../repositories/pipelineExecution.repository'
import { NodeExecutorFactory } from '../nodeExecutors/NodeExecutorFactory'
import { MockNodeExecutor } from '../nodeExecutors/NoopNodeExecutor'
import { PipelineExecutionService } from '../pipelineExecution.service'

// 테스트 환경 설정
process.env.NODE_ENV = 'test'

describe('PipelineExecutionService', () => {
  let mockResponse: Partial<Response>
  let writtenData: string[]
  let pipelineExecutionService: PipelineExecutionService
  let nodeExecutorFactory: NodeExecutorFactory
  let mockRepositoryDriver: MockRepositoryDriver

  beforeEach(() => {
    writtenData = []
    mockResponse = {
      write: jest.fn((data: string) => {
        writtenData.push(data)
        return true
      }),
    }

    // Mock 저장소 드라이버 설정
    mockRepositoryDriver = new MockRepositoryDriver()

    // 노드 실행기 팩토리 설정
    nodeExecutorFactory = new NodeExecutorFactory()
    nodeExecutorFactory.registerExecutor(new MockNodeExecutor('prompt'))

    pipelineExecutionService = new PipelineExecutionService(
      new PipelineExecutionsRepository(mockRepositoryDriver),
      nodeExecutorFactory,
    )
  })

  const createMockPipeline = (): Pipeline => ({
    id: 'test-pipeline-1',
    name: '테스트 파이프라인',
    description: '테스트용 파이프라인입니다.',
    nodes: [
      {
        id: 'node-1',
        type: 'prompt',
        data: {
          name: '입력 노드',
          config: {
            templateId: 'template-1',
            variables: {},
            contextMapping: {
              input: ['text'],
              output: ['intent'],
            },
          },
        },
        position: { x: 0, y: 0 },
      },
      {
        id: 'node-2',
        type: 'prompt',
        data: {
          name: '처리 노드',
          description: '데이터 처리',
          config: {
            templateId: 'template-2',
            variables: {},
            contextMapping: {
              input: ['intent'],
              output: ['response'],
            },
          },
        },
        position: { x: 100, y: 0 },
      },
      {
        id: 'node-3',
        type: 'prompt',
        data: {
          name: '출력 노드',
          config: {
            templateId: 'template-3',
            variables: {},
            contextMapping: {
              input: ['response'],
              output: ['final'],
            },
          },
        },
        position: { x: 200, y: 0 },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' },
    ],
    agentId: 'test-agent-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  describe('streamPipelineExecution', () => {
    // 테스트 타임아웃 시간 증가
    jest.setTimeout(10000)

    it('파이프라인 실행 시작과 완료 메시지를 스트리밍해야 함', async () => {
      const mockPipeline = createMockPipeline()
      const testInput = '테스트 입력'

      const jobId = await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        testInput,
        mockResponse as Response,
      )

      // 노드 실행 메시지들 확인
      const nodeStartMessages = writtenData.filter((data) =>
        data.includes('node-start'),
      )
      const nodeCompleteMessages = writtenData.filter((data) =>
        data.includes('node-complete'),
      )

      expect(nodeStartMessages.length).toBe(mockPipeline.nodes.length)
      expect(nodeCompleteMessages.length).toBe(mockPipeline.nodes.length)

      // 실행 기록 확인
      const record = await pipelineExecutionService.getExecutionRecord(jobId)
      expect(record).toBeDefined()
      expect(record?.status).toBe('completed')
    })

    it('순차적인 노드 실행 순서를 지켜야 함', async () => {
      const mockPipeline = createMockPipeline()
      const testInput = '테스트 입력'

      const jobId = await pipelineExecutionService.streamPipelineExecution(
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

      // 실행 기록 확인
      const record = await pipelineExecutionService.getExecutionRecord(jobId)
      expect(record).toBeDefined()
      expect(record?.status).toBe('completed')
      expect(record?.nodeResults.length).toBe(3)
      expect(record?.nodeResults.map((r) => r.nodeId)).toEqual([
        'node-1',
        'node-2',
        'node-3',
      ])
    })

    it('에러가 발생했을 때 적절한 에러 메시지를 전송해야 함', async () => {
      const mockPipeline: Pipeline = {
        ...createMockPipeline(),
        nodes: [], // 의도적으로 노드가 없는 파이프라인 생성
      }

      await expect(
        pipelineExecutionService.streamPipelineExecution(
          mockPipeline,
          '테스트 입력',
          mockResponse as Response,
        ),
      ).rejects.toThrow('Pipeline has no nodes to execute')

      // 에러 메시지 확인
      const errorMessages = writtenData.filter((data) =>
        data.includes('"type":"error"'),
      )
      expect(errorMessages.length).toBe(1)

      // 실행 기록 확인 (마지막으로 생성된 실행 기록)
      const records = await pipelineExecutionService.getAllExecutionRecords()
      const lastRecord = records[records.length - 1]
      expect(lastRecord).toBeDefined()
      expect(lastRecord.status).toBe('failed')
      expect(lastRecord.error).toBe('Pipeline has no nodes to execute')
    })

    it('노드 타입별로 올바른 출력을 생성해야 함', async () => {
      const testInput = '테스트 입력'
      const mockPipeline: Pipeline = {
        ...createMockPipeline(),
        nodes: [
          {
            id: 'input-node',
            type: 'prompt',
            data: {
              name: '입력 노드',
              config: {
                templateId: 'template-1',
                variables: {},
                contextMapping: {
                  input: ['text'],
                  output: ['result'],
                },
              },
            },
            position: { x: 0, y: 0 },
          },
          {
            id: 'plan-node',
            type: 'prompt',
            data: {
              name: '계획 노드',
              description: '계획 수립',
              config: {
                templateId: 'template-2',
                variables: {},
                contextMapping: {
                  input: ['result'],
                  output: ['plan'],
                },
              },
            },
            position: { x: 100, y: 0 },
          },
          {
            id: 'action-node',
            type: 'prompt',
            data: {
              name: '행동 노드',
              description: '작업 실행',
              config: {
                templateId: 'template-3',
                variables: {},
                contextMapping: {
                  input: ['plan'],
                  output: ['action'],
                },
              },
            },
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

      const jobId = await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        testInput,
        mockResponse as Response,
      )

      const nodeOutputs = writtenData
        .filter((data) => data.includes('node-complete'))
        .map((data) => {
          const parsed = JSON.parse(data.replace('data: ', ''))
          return {
            ...parsed,
            output: JSON.parse(parsed.output),
          }
        })

      // 상태 검증 추가
      nodeOutputs.forEach((output) => {
        expect(output.status).toBe('success')
      })

      // 각 노드의 출력 검증
      expect(nodeOutputs[0].output.value).toBe(`프롬프트 처리: "${testInput}"`)
      expect(nodeOutputs[1].output.value).toBe(`프롬프트 처리: "${testInput}"`)
      expect(nodeOutputs[2].output.value).toBe(`프롬프트 처리: "${testInput}"`)

      // 이전 결과 전파 검증
      expect(nodeOutputs[1].output.prevResults).toEqual({
        '입력 노드': `프롬프트 처리: "${testInput}"`,
      })
      expect(nodeOutputs[2].output.prevResults).toEqual({
        '계획 노드': `프롬프트 처리: "${testInput}"`,
      })

      // 글로벌 값 전파 검증
      expect(nodeOutputs[1].args.__input__).toBe(testInput)
      expect(nodeOutputs[2].args.__input__).toBe(testInput)

      // 실행 기록 확인
      const record = await pipelineExecutionService.getExecutionRecord(jobId)
      expect(record).toBeDefined()
      expect(record?.status).toBe('completed')
      expect(record?.nodeResults).toHaveLength(3)
    })
  })

  describe('실행 기록 관리', () => {
    let pipelineExecutionService: PipelineExecutionService
    let mockRepository: PipelineExecutionsRepository
    let mockRepositoryDriver: MockRepositoryDriver

    beforeEach(() => {
      mockRepositoryDriver = new MockRepositoryDriver()
      mockRepository = new PipelineExecutionsRepository(mockRepositoryDriver)
      nodeExecutorFactory = new NodeExecutorFactory()
      nodeExecutorFactory.registerExecutor(new MockNodeExecutor('prompt'))

      pipelineExecutionService = new PipelineExecutionService(
        mockRepository,
        nodeExecutorFactory,
      )
    })

    it('파이프라인 ID로 실행 기록을 조회할 수 있어야 함', async () => {
      const mockPipeline = createMockPipeline()

      const jobId = await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        '테스트 입력',
        mockResponse as Response,
      )

      const records =
        await pipelineExecutionService.getExecutionRecordsByPipelineId(
          mockPipeline.id,
        )
      expect(records).toHaveLength(1)
      expect(records[0].pipelineId).toBe(mockPipeline.id)
      expect(records[0].status).toBe('completed')
    })

    it('모든 실행 기록을 조회할 수 있어야 함', async () => {
      mockRepositoryDriver.clear('pipeline-executions')
      const mockPipeline = createMockPipeline()

      const jobId1 = await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        '테스트 입력 1',
        mockResponse as Response,
      )
      const jobId2 = await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        '테스트 입력 2',
        mockResponse as Response,
      )

      const records = await pipelineExecutionService.getAllExecutionRecords()
      expect(records).toHaveLength(2)
      expect(records.map((r) => r.id)).toEqual(
        expect.arrayContaining([jobId1, jobId2]),
      )
    })
  })
})
