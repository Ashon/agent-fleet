import { Pipeline } from '@agentfleet/types'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { MockRepositoryDriver } from '../../drivers/mockRepositoryDriver'
import { PipelineExecutionsRepository } from '../../repositories/pipelineExecutionsRepository'
import { PromptTemplateRepository } from '../../repositories/promptTemplateRepository'
import { NodeExecutorFactory } from '../nodeExecutors/NodeExecutorFactory'
import { MockNodeExecutor } from '../nodeExecutors/NoopNodeExecutor'
import { PipelineExecutionService } from '../pipelineExecution.service'
import { PromptService } from '../prompt.service'

// 테스트 환경 설정
process.env.NODE_ENV = 'test'

describe('PipelineExecutionService', () => {
  let mockResponse: Partial<Response>
  let writtenData: string[]
  let pipelineExecutionService: PipelineExecutionService
  let nodeExecutorFactory: NodeExecutorFactory
  let promptService: PromptService
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
    ;[
      'input',
      'process',
      'plan',
      'action',
      'decision',
      'aggregator',
      'analysis',
    ].forEach((nodeType) => {
      nodeExecutorFactory.registerExecutor(new MockNodeExecutor(nodeType))
    })

    // PromptService 설정
    const promptTemplateRepository = new PromptTemplateRepository(
      mockRepositoryDriver,
    )
    promptService = new PromptService(promptTemplateRepository)

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  describe('executePipeline', () => {
    // 테스트 타임아웃 시간 증가
    jest.setTimeout(10000)

    it('파이프라인 실행 시작과 완료 메시지를 스트리밍해야 함', async () => {
      const mockPipeline = createMockPipeline()
      const testInput = '테스트 입력'
      const jobId = uuidv4()

      await pipelineExecutionService.executePipeline(
        mockPipeline,
        testInput,
        jobId,
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
      const jobId = uuidv4()

      await pipelineExecutionService.executePipeline(
        mockPipeline,
        testInput,
        jobId,
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
      const jobId = uuidv4()

      await expect(
        pipelineExecutionService.executePipeline(
          mockPipeline,
          '테스트 입력',
          jobId,
          mockResponse as Response,
        ),
      ).rejects.toThrow('파이프라인에 실행할 노드가 없습니다.')

      // 실행 기록 확인
      const record = await pipelineExecutionService.getExecutionRecord(jobId)
      expect(record).toBeDefined()
      expect(record?.status).toBe('failed')
      expect(record?.error).toBe('파이프라인에 실행할 노드가 없습니다.')
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
      const jobId = uuidv4()

      await pipelineExecutionService.executePipeline(
        mockPipeline,
        testInput,
        jobId,
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

      expect(nodeOutputs[0].output.value).toBe(`입력 처리: "${testInput}"`)
      expect(nodeOutputs[1].output.value).toBe('계획 수립: 계획 수립')
      expect(nodeOutputs[2].output.value).toBe('행동 실행: 작업 실행')

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
    let promptService: PromptService
    let mockRepositoryDriver: MockRepositoryDriver

    beforeEach(() => {
      mockRepositoryDriver = new MockRepositoryDriver()
      mockRepository = new PipelineExecutionsRepository(mockRepositoryDriver)
      nodeExecutorFactory = new NodeExecutorFactory()
      ;['input', 'process', 'plan', 'action'].forEach((nodeType) => {
        nodeExecutorFactory.registerExecutor(new MockNodeExecutor(nodeType))
      })

      // PromptService 설정
      const promptTemplateRepository = new PromptTemplateRepository(
        mockRepositoryDriver,
      )
      promptService = new PromptService(promptTemplateRepository)

      pipelineExecutionService = new PipelineExecutionService(
        mockRepository,
        nodeExecutorFactory,
      )
    })

    it('파이프라인 ID로 실행 기록을 조회할 수 있어야 함', async () => {
      const mockPipeline = createMockPipeline()
      const jobId = uuidv4()

      await pipelineExecutionService.executePipeline(
        mockPipeline,
        '테스트 입력',
        jobId,
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
      const jobId1 = uuidv4()
      const jobId2 = uuidv4()

      await pipelineExecutionService.executePipeline(
        mockPipeline,
        '테스트 입력 1',
        jobId1,
        mockResponse as Response,
      )
      await pipelineExecutionService.executePipeline(
        mockPipeline,
        '테스트 입력 2',
        jobId2,
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
