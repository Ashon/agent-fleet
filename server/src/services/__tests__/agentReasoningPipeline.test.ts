import { Pipeline, PipelineNode } from '@agentfleet/types'
import { mockPipelines } from '../../mocks/agentReasoningPipeline'
import { PipelineService } from '../agentReasoningPipeline'

describe('PipelineService', () => {
  let pipelineService: PipelineService
  let testPipeline: Pipeline

  beforeEach(() => {
    pipelineService = new PipelineService()
    testPipeline = mockPipelines[0]
  })

  describe('getAllPipelines', () => {
    it('모든 파이프라인을 반환해야 합니다', async () => {
      const pipelines = await pipelineService.getAllPipelines()
      expect(pipelines).toEqual(mockPipelines)
    })

    it('반환된 배열은 원본과 다른 참조여야 합니다', async () => {
      const pipelines = await pipelineService.getAllPipelines()
      expect(pipelines).not.toBe(mockPipelines)
    })
  })

  describe('getPipelineById', () => {
    it('존재하는 ID로 파이프라인을 찾아야 합니다', async () => {
      const pipeline = await pipelineService.getPipelineById(testPipeline.id)
      expect(pipeline).toEqual(testPipeline)
    })

    it('존재하지 않는 ID는 undefined를 반환해야 합니다', async () => {
      const pipeline = await pipelineService.getPipelineById('pipeline-999')
      expect(pipeline).toBeUndefined()
    })

    it('빈 ID는 undefined를 반환해야 합니다', async () => {
      const pipeline = await pipelineService.getPipelineById('')
      expect(pipeline).toBeUndefined()
    })
  })

  describe('createPipeline', () => {
    it('새로운 파이프라인을 생성해야 합니다', async () => {
      const newPipeline = {
        name: 'Test Pipeline',
        description: '테스트용 파이프라인',
        nodes: testPipeline.nodes,
        edges: testPipeline.edges,
        agentId: testPipeline.agentId,
      }

      const createdPipeline = await pipelineService.createPipeline(newPipeline)
      expect(createdPipeline).toMatchObject(newPipeline)
      expect(createdPipeline.id).toMatch(/^pipeline-\d+$/)
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
    it('존재하는 파이프라인을 업데이트해야 합니다', async () => {
      const updateData = {
        name: 'Updated Pipeline',
        description: '업데이트된 설명',
      }

      const updatedPipeline = await pipelineService.updatePipeline(
        testPipeline.id,
        updateData,
      )
      expect(updatedPipeline).toMatchObject({
        id: testPipeline.id,
        ...updateData,
      })
    })

    it('존재하지 않는 파이프라인은 undefined를 반환해야 합니다', async () => {
      const updateData = {
        name: 'Updated Pipeline',
      }

      const updatedPipeline = await pipelineService.updatePipeline(
        'pipeline-999',
        updateData,
      )
      expect(updatedPipeline).toBeUndefined()
    })

    it('ID는 변경할 수 없어야 합니다', async () => {
      const updateData = {
        id: 'new-workflow-id',
      }

      const updatedPipeline = await pipelineService.updatePipeline(
        testPipeline.id,
        updateData,
      )
      expect(updatedPipeline?.id).toBe(testPipeline.id)
    })
  })

  describe('deletePipeline', () => {
    it('존재하는 파이프라인을 삭제해야 합니다', async () => {
      const result = await pipelineService.deletePipeline(testPipeline.id)
      expect(result).toBe(true)

      const deletedPipeline = await pipelineService.getPipelineById(
        testPipeline.id,
      )
      expect(deletedPipeline).toBeUndefined()
    })

    it('존재하지 않는 파이프라인 삭제는 false를 반환해야 합니다', async () => {
      const result = await pipelineService.deletePipeline('pipeline-999')
      expect(result).toBe(false)
    })
  })

  describe('updatePipelineNodes', () => {
    it('파이프라인 노드를 업데이트해야 합니다', async () => {
      const newNodes = [...testPipeline.nodes]
      newNodes[0].data.name = 'Updated Start'

      const updatedPipeline = await pipelineService.updatePipelineNodes(
        testPipeline.id,
        newNodes,
      )
      expect(updatedPipeline?.nodes[0].data.name).toBe('Updated Start')
    })

    it('존재하지 않는 파이프라인은 undefined를 반환해야 합니다', async () => {
      const newNodes = [...testPipeline.nodes]
      const updatedPipeline = await pipelineService.updatePipelineNodes(
        'pipeline-999',
        newNodes,
      )
      expect(updatedPipeline).toBeUndefined()
    })
  })

  describe('updatePipelineEdges', () => {
    it('파이프라인 엣지를 업데이트해야 합니다', async () => {
      const newEdges = [...testPipeline.edges]
      newEdges[0].type = 'success'

      const updatedPipeline = await pipelineService.updatePipelineEdges(
        testPipeline.id,
        newEdges,
      )
      expect(updatedPipeline?.edges[0].type).toBe('success')
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

    it('존재하지 않는 파이프라인은 false를 반환해야 합니다', async () => {
      const result = await pipelineService.validatePipeline('pipeline-999')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('파이프라인을 찾을 수 없습니다.')
    })

    it('유효하지 않은 엣지가 있는 파이프라인은 false를 반환해야 합니다', async () => {
      const pipeline = await pipelineService.getPipelineById(testPipeline.id)
      if (!pipeline) return

      const invalidPipeline = {
        ...pipeline,
        edges: [
          ...pipeline.edges,
          {
            id: 'invalid-edge',
            source: 'non-existent',
            target: 'node-1',
            type: 'default' as const,
          },
        ],
      }
      await pipelineService.updatePipeline(testPipeline.id, invalidPipeline)

      const result = await pipelineService.validatePipeline(testPipeline.id)
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('유효하지 않은 엣지가 있습니다.')
    })
  })
})
