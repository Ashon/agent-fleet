import { Pipeline, PipelineEdge, PipelineNode } from '@agentfleet/types'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { MockRepositoryDriver } from '../../drivers/mockRepositoryDriver'
import { PipelineJobsRepository } from '../../repositories/pipelineJobsRepository'
import { PipelineExecutionService } from '../pipelineExecutionService'

// 테스트 환경 설정
process.env.NODE_ENV = 'test'

describe('PipelineExecutionService', () => {
  let mockResponse: Partial<Response>
  let writtenData: string[]
  let pipelineExecutionService: PipelineExecutionService

  beforeEach(() => {
    writtenData = []
    mockResponse = {
      write: jest.fn((data: string) => {
        writtenData.push(data)
        return true
      }),
    }
    pipelineExecutionService = new PipelineExecutionService(
      new PipelineJobsRepository(new MockRepositoryDriver()),
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
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  describe('streamPipelineExecution', () => {
    // 테스트 타임아웃 시간 증가
    jest.setTimeout(10000)

    it('파이프라인 실행 시작과 완료 메시지를 스트리밍해야 함', async () => {
      const mockPipeline = createMockPipeline()
      const testInput = '테스트 입력'

      const id = await pipelineExecutionService.streamPipelineExecution(
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
      expect(startMessage.id).toBe(id)

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
      expect(completeMessage.id).toBe(id)
    })

    it('순차적인 노드 실행 순서를 지켜야 함', async () => {
      const mockPipeline = createMockPipeline()
      const testInput = '테스트 입력'

      const id = await pipelineExecutionService.streamPipelineExecution(
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
      const record = await pipelineExecutionService.getExecutionRecord(id)
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

      const id = await pipelineExecutionService.streamPipelineExecution(
        mockPipeline,
        '테스트 입력',
        mockResponse as Response,
      )

      const errorMessage = writtenData
        .map((data) => JSON.parse(data.replace('data: ', '')))
        .find((msg) => msg.type === 'error')

      expect(errorMessage).toBeDefined()
      expect(errorMessage?.message).toBe('파이프라인에 실행할 노드가 없습니다.')
      expect(errorMessage?.id).toBe(id)

      // 실행 기록 확인
      const record = await pipelineExecutionService.getExecutionRecord(id)
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

      const id = await pipelineExecutionService.streamPipelineExecution(
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

      // 실행 기록 확인
      const record = await pipelineExecutionService.getExecutionRecord(id)
      expect(record).toBeDefined()
      expect(record?.status).toBe('completed')
      expect(record?.nodeResults).toHaveLength(3)
      expect(record?.nodeResults[0].output).toBe(`입력 처리: "${testInput}"`)
      expect(record?.nodeResults[1].output).toBe('계획 수립: 계획 수립')
      expect(record?.nodeResults[2].output).toBe('행동 실행: 작업 실행')
      expect(record?.finalOutput).toBe('행동 실행: 작업 실행')
    })
  })

  describe('실행 기록 관리', () => {
    let pipelineExecutionService: PipelineExecutionService
    let mockRepository: PipelineJobsRepository

    beforeEach(() => {
      mockRepository = new PipelineJobsRepository(new MockRepositoryDriver())
      // Mock 저장소 초기화
      mockRepository.clear()
      pipelineExecutionService = new PipelineExecutionService(mockRepository)
    })

    it('파이프라인 ID로 실행 기록을 조회할 수 있어야 함', async () => {
      const testInput = '테스트 입력'
      const id = uuidv4()
      const mockPipeline: Pipeline = {
        id: 'test-pipeline-1',
        agentId: 'test-agent-1',
        name: '테스트 파이프라인',
        description: '테스트용 파이프라인입니다.',
        nodes: [
          {
            id: 'node-1',
            type: 'input',
            position: { x: 0, y: 0 },
            data: {
              name: '입력 노드',
              description: '입력을 처리하는 노드',
              config: {},
            },
          },
          {
            id: 'node-2',
            type: 'process',
            position: { x: 100, y: 0 },
            data: {
              name: '처리 노드',
              description: '데이터를 처리하는 노드',
              config: {},
            },
          },
          {
            id: 'node-3',
            type: 'process',
            position: { x: 200, y: 0 },
            data: {
              name: '출력 노드',
              description: '결과를 출력하는 노드',
              config: {},
            },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            type: 'default',
          },
          {
            id: 'edge-2',
            source: 'node-2',
            target: 'node-3',
            type: 'default',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await pipelineExecutionService.executePipeline(
        mockPipeline,
        testInput,
        id,
        mockResponse as Response,
      )

      const records =
        await pipelineExecutionService.getExecutionRecordsByPipelineId(
          mockPipeline.id,
        )
      expect(records).toHaveLength(1)
      expect(records[0].id).toBe(id)
      expect(records[0].pipelineId).toBe(mockPipeline.id)
      expect(records[0].input).toBe(testInput)
    })

    it('모든 실행 기록을 조회할 수 있어야 함', async () => {
      const testInput1 = '테스트 입력 1'
      const testInput2 = '테스트 입력 2'
      const id1 = uuidv4()
      const id2 = uuidv4()
      const mockPipeline: Pipeline = {
        id: 'test-pipeline-1',
        agentId: 'test-agent-1',
        name: '테스트 파이프라인',
        description: '테스트용 파이프라인입니다.',
        nodes: [
          {
            id: 'node-1',
            type: 'input',
            position: { x: 0, y: 0 },
            data: {
              name: '입력 노드',
              description: '입력을 처리하는 노드',
              config: {},
            },
          },
          {
            id: 'node-2',
            type: 'process',
            position: { x: 100, y: 0 },
            data: {
              name: '처리 노드',
              description: '데이터를 처리하는 노드',
              config: {},
            },
          },
          {
            id: 'node-3',
            type: 'process',
            position: { x: 200, y: 0 },
            data: {
              name: '출력 노드',
              description: '결과를 출력하는 노드',
              config: {},
            },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            type: 'default',
          },
          {
            id: 'edge-2',
            source: 'node-2',
            target: 'node-3',
            type: 'default',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await pipelineExecutionService.executePipeline(
        mockPipeline,
        testInput1,
        id1,
        mockResponse as Response,
      )
      await pipelineExecutionService.executePipeline(
        mockPipeline,
        testInput2,
        id2,
        mockResponse as Response,
      )

      const records = await pipelineExecutionService.getAllExecutionRecords()
      expect(records).toHaveLength(2)
      expect(records[0].input).toBe(testInput1)
      expect(records[1].input).toBe(testInput2)
    })
  })
})
