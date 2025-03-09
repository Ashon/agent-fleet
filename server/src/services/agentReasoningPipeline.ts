import {
  CreatePipelinePayload,
  Pipeline,
  PipelineEdge,
  PipelineNode,
} from '@agentfleet/types'
import { mockPipelines } from '../mocks/agentReasoningPipeline'

export class PipelineService {
  private readonly pipelines: Pipeline[]

  constructor() {
    this.pipelines = [...mockPipelines]
  }

  async getAllPipelines(filters?: { agentId?: string }): Promise<Pipeline[]> {
    let filteredPipelines = [...this.pipelines]

    if (filters?.agentId) {
      filteredPipelines = filteredPipelines.filter(
        (pipeline) => pipeline.agentId === filters.agentId,
      )
    }

    return filteredPipelines
  }

  async getPipelineById(id: string): Promise<Pipeline | undefined> {
    return this.pipelines.find((pipeline) => pipeline.id === id)
  }

  async createPipeline(payload: CreatePipelinePayload): Promise<Pipeline> {
    // 필수 필드 검증
    if (
      !payload.name ||
      !payload.agentId ||
      !payload.description ||
      !payload.nodes ||
      !payload.edges
    ) {
      throw new Error('필수 필드가 누락되었습니다.')
    }

    const newPipeline: Pipeline = {
      id: `pipeline-${this.pipelines.length + 1}`,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.pipelines.push(newPipeline)
    return newPipeline
  }

  async updatePipeline(
    id: string,
    payload: Partial<Pipeline>,
  ): Promise<Pipeline | undefined> {
    const index = this.pipelines.findIndex((pipeline) => pipeline.id === id)
    if (index === -1) return undefined

    this.pipelines[index] = {
      ...this.pipelines[index],
      ...payload,
      id, // ID는 변경 불가
    }
    return this.pipelines[index]
  }

  async deletePipeline(id: string): Promise<boolean> {
    const index = this.pipelines.findIndex((pipeline) => pipeline.id === id)
    if (index === -1) return false

    this.pipelines.splice(index, 1)
    return true
  }

  async updatePipelineNodes(
    id: string,
    nodes: Pipeline['nodes'],
  ): Promise<Pipeline | undefined> {
    const index = this.pipelines.findIndex((pipeline) => pipeline.id === id)
    if (index === -1) return undefined

    const pipeline = this.pipelines[index]
    this.pipelines[index] = {
      ...pipeline,
      nodes,
    }
    return this.pipelines[index]
  }

  async updatePipelineEdges(
    id: string,
    edges: Pipeline['edges'],
  ): Promise<Pipeline | undefined> {
    const index = this.pipelines.findIndex((pipeline) => pipeline.id === id)
    if (index === -1) return undefined

    const pipeline = this.pipelines[index]
    this.pipelines[index] = {
      ...pipeline,
      edges,
    }
    return this.pipelines[index]
  }

  async validatePipeline(
    id: string,
  ): Promise<{ isValid: boolean; message?: string }> {
    const pipeline = await this.getPipelineById(id)
    if (!pipeline) {
      return {
        isValid: false,
        message: '파이프라인을 찾을 수 없습니다.',
      }
    }

    // 모든 엣지가 유효한 노드를 참조하는지 확인
    const nodeIds = new Set(pipeline.nodes.map((node: PipelineNode) => node.id))
    const hasInvalidEdge = pipeline.edges.some(
      (edge: PipelineEdge) =>
        !nodeIds.has(edge.source) || !nodeIds.has(edge.target),
    )

    if (hasInvalidEdge) {
      return {
        isValid: false,
        message: '유효하지 않은 엣지가 있습니다.',
      }
    }

    return { isValid: true }
  }
}

export const pipelineService = new PipelineService()
