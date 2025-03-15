import {
  CreatePipelinePayload,
  Pipeline,
  PipelineNode,
} from '@agentfleet/types'
import { S3RepositoryDriver } from '../../drivers/s3RepositoryDriver'
import { mockPipelines } from '../../mocks/agentReasoningPipeline'
import { PipelineRepository } from '../../repositories/pipelineRepository'
import { PipelineService } from '../agentReasoningPipeline.service'

jest.mock('../../repositories/pipelineRepository')

describe('PipelineService', () => {
  let pipelineService: PipelineService
  let testPipeline: Pipeline
  let mockRepository: jest.Mocked<PipelineRepository>

  beforeEach(() => {
    mockRepository = new PipelineRepository(
      {} as S3RepositoryDriver,
    ) as jest.Mocked<PipelineRepository>
    mockRepository.findAll = jest.fn().mockResolvedValue(mockPipelines)
    mockRepository.findById = jest
      .fn()
      .mockImplementation((id) =>
        Promise.resolve(mockPipelines.find((p) => p.id === id) || null),
      )
    mockRepository.create = jest
      .fn()
      .mockImplementation((pipeline) => Promise.resolve(pipeline))
    mockRepository.delete = jest.fn().mockResolvedValue(undefined)

    pipelineService = new PipelineService(mockRepository)
    testPipeline = mockPipelines[0]
  })

  describe('getAllPipelines', () => {
    it('모든 파이프라인을 반환해야 합니다', async () => {
      const pipelines = await pipelineService.getAllPipelines()
      expect(pipelines).toEqual(mockPipelines)
      expect(mockRepository.findAll).toHaveBeenCalled()
    })

    it('반환된 배열은 원본과 다른 참조여야 합니다', async () => {
      const pipelines = await pipelineService.getAllPipelines()
      expect(pipelines).not.toBe(mockPipelines)
    })

    it('agentId로 필터링된 파이프라인을 반환해야 합니다', async () => {
      const agentId = testPipeline.agentId
      const pipelines = await pipelineService.getAllPipelines({ agentId })
      expect(pipelines).toEqual(
        mockPipelines.filter((p) => p.agentId === agentId),
      )
    })
  })

  describe('getPipelineById', () => {
    it('ID로 파이프라인을 조회해야 합니다', async () => {
      const pipeline = await pipelineService.getPipelineById(testPipeline.id)
      expect(pipeline).toEqual(testPipeline)
      expect(mockRepository.findById).toHaveBeenCalledWith(testPipeline.id)
    })

    it('존재하지 않는 ID로 조회 시 undefined를 반환해야 합니다', async () => {
      const pipeline = await pipelineService.getPipelineById('non-existent')
      expect(pipeline).toBeUndefined()
    })
  })

  describe('createPipeline', () => {
    it('새로운 파이프라인을 생성해야 합니다', async () => {
      const newPipeline: CreatePipelinePayload = {
        name: '새 파이프라인',
        description: '새로운 테스트 파이프라인',
        agentId: 'test-agent-1',
        nodes: [],
        edges: [],
      }

      mockRepository.create.mockImplementationOnce((pipeline) =>
        Promise.resolve({
          ...pipeline,
          id: 'new-pipeline-id',
          createdAt: '2024-03-15T09:00:00.000Z',
          updatedAt: '2024-03-15T09:00:00.000Z',
        }),
      )

      const result = await pipelineService.createPipeline(newPipeline)
      expect(result).toMatchObject({
        ...newPipeline,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
      expect(mockRepository.create).toHaveBeenCalled()
    })

    it('필수 필드가 누락된 경우 에러를 발생시켜야 합니다', async () => {
      const invalidPipeline = {
        name: 'Test Pipeline',
        // description, nodes, edges가 누락됨
      }

      await expect(
        pipelineService.createPipeline(invalidPipeline as Pipeline),
      ).rejects.toThrow()
    })
  })

  describe('updatePipeline', () => {
    it('파이프라인을 업데이트해야 합니다', async () => {
      const updateData = {
        name: '수정된 파이프라인',
        description: '수정된 설명',
      }

      mockRepository.findById.mockResolvedValueOnce(testPipeline)
      mockRepository.save.mockImplementationOnce((pipeline) =>
        Promise.resolve({
          ...pipeline,
          ...updateData,
          id: testPipeline.id,
          updatedAt: '2024-03-15T09:02:00.000Z',
        }),
      )

      const result = await pipelineService.updatePipeline(
        testPipeline.id,
        updateData,
      )
      expect(result).toMatchObject({
        ...testPipeline,
        ...updateData,
        id: testPipeline.id,
        updatedAt: expect.any(String),
      })
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('존재하지 않는 파이프라인 업데이트 시 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValueOnce(null)

      const result = await pipelineService.updatePipeline('non-existent', {
        name: '수정된 파이프라인',
      })
      expect(result).toBeUndefined()
      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('ID는 변경할 수 없어야 합니다', async () => {
      const updateData = {
        id: 'new-workflow-id',
      }

      mockRepository.findById.mockResolvedValueOnce(testPipeline)
      mockRepository.save.mockImplementationOnce((pipeline) =>
        Promise.resolve({
          ...pipeline,
          id: testPipeline.id,
        }),
      )

      const updatedPipeline = await pipelineService.updatePipeline(
        testPipeline.id,
        updateData,
      )
      expect(updatedPipeline?.id).toBe(testPipeline.id)
    })
  })

  describe('deletePipeline', () => {
    it('파이프라인을 삭제해야 합니다', async () => {
      mockRepository.findById.mockResolvedValueOnce(testPipeline)
      mockRepository.delete.mockResolvedValue()

      const result = await pipelineService.deletePipeline(testPipeline.id)
      expect(result).toBe(true)
      expect(mockRepository.delete).toHaveBeenCalledWith(testPipeline.id)
    })

    it('존재하지 않는 파이프라인 삭제 시 false를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValueOnce(null)
      mockRepository.delete.mockRejectedValue(new Error('Entity not found'))

      const result = await pipelineService.deletePipeline('non-existent')
      expect(result).toBe(false)
      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent')
    })

    it('이미 삭제된 파이프라인을 다시 삭제하려고 할 때 false를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValueOnce(null)
      mockRepository.delete.mockRejectedValue(new Error('Entity not found'))

      const result = await pipelineService.deletePipeline(testPipeline.id)
      expect(result).toBe(false)
      expect(mockRepository.delete).toHaveBeenCalledWith(testPipeline.id)
    })
  })

  describe('updatePipelineNodes', () => {
    it('파이프라인의 노드를 업데이트해야 합니다', async () => {
      const newNodes: PipelineNode[] = [
        {
          id: 'new-node-1',
          type: 'input',
          data: { name: '새 입력 노드' },
          position: { x: 0, y: 0 },
        },
      ]

      mockRepository.findById.mockResolvedValueOnce(testPipeline)
      mockRepository.save.mockImplementationOnce((pipeline) =>
        Promise.resolve({
          ...pipeline,
          nodes: newNodes,
          updatedAt: new Date().toISOString(),
        }),
      )

      const result = await pipelineService.updatePipelineNodes(
        testPipeline.id,
        newNodes,
      )
      expect(result).toMatchObject({
        ...testPipeline,
        nodes: newNodes,
        updatedAt: expect.any(String),
      })
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('존재하지 않는 파이프라인의 노드 업데이트 시 undefined를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValueOnce(null)

      const result = await pipelineService.updatePipelineNodes(
        'non-existent',
        [],
      )
      expect(result).toBeUndefined()
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('updatePipelineEdges', () => {
    it('파이프라인 엣지를 업데이트해야 합니다', async () => {
      const newEdges = [...testPipeline.edges]
      newEdges[0] = { ...newEdges[0], type: 'success' }

      mockRepository.findById.mockResolvedValueOnce(testPipeline)
      mockRepository.save.mockImplementationOnce((pipeline) =>
        Promise.resolve({
          ...pipeline,
          edges: newEdges,
          updatedAt: '2024-03-15T09:03:00.000Z',
        }),
      )

      const updatedPipeline = await pipelineService.updatePipelineEdges(
        testPipeline.id,
        newEdges,
      )
      expect(updatedPipeline).toBeDefined()
      expect(updatedPipeline?.edges[0].type).toBe('success')
      expect(updatedPipeline?.id).toBe(testPipeline.id)
    })

    it('존재하지 않는 파이프라인은 undefined를 반환해야 합니다', async () => {
      const newEdges = [...testPipeline.edges]
      const updatedPipeline = await pipelineService.updatePipelineEdges(
        'pipeline-999',
        newEdges,
      )
      expect(updatedPipeline).toBeUndefined()
    })
  })

  describe('validatePipeline', () => {
    it('유효한 파이프라인은 true를 반환해야 합니다', async () => {
      const result = await pipelineService.validatePipeline(testPipeline.id)
      expect(result.isValid).toBe(true)
    })

    it('유효하지 않은 엣지가 있는 파이프라인은 false를 반환해야 합니다', async () => {
      // 잘못된 엣지를 포함하는 파이프라인 생성
      const invalidPipeline: Pipeline = {
        ...testPipeline,
        edges: [
          ...testPipeline.edges,
          {
            id: 'invalid-edge',
            source: 'non-existent-source',
            target: 'non-existent-target',
            type: 'default',
          },
        ],
      }

      mockRepository.findById.mockResolvedValueOnce(invalidPipeline)
      const result = await pipelineService.validatePipeline(invalidPipeline.id)
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('유효하지 않은 엣지가 있습니다.')
    })

    it('존재하지 않는 파이프라인은 false를 반환해야 합니다', async () => {
      mockRepository.findById.mockResolvedValueOnce(null)
      const result = await pipelineService.validatePipeline('non-existent')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('파이프라인을 찾을 수 없습니다.')
    })
  })
})
