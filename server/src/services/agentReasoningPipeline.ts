import {
  CreatePipelinePayload,
  Pipeline,
  PipelineEdge,
  PipelineNode,
  PipelineTestRequest,
  PipelineTestResponse,
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

  async testPipeline(
    request: PipelineTestRequest,
  ): Promise<PipelineTestResponse> {
    const { pipelineId, input } = request

    const pipeline = await this.getPipelineById(pipelineId)
    if (!pipeline) {
      throw new Error('파이프라인을 찾을 수 없습니다.')
    }

    // 파이프라인 유효성 검사
    const validation = await this.validatePipeline(pipelineId)
    if (!validation.isValid) {
      throw new Error(validation.message || '유효하지 않은 파이프라인입니다.')
    }

    // 실행 경로 추적
    const executionPath: PipelineTestResponse['executionPath'] = []

    // 입력 노드 찾기
    const inputNode = pipeline.nodes.find((node) => node.type === 'input')
    if (!inputNode) {
      throw new Error('입력 노드를 찾을 수 없습니다.')
    }

    // 입력 노드 실행
    executionPath.push({
      nodeId: inputNode.id,
      status: 'success',
      output: `입력: ${input}`,
      timestamp: new Date(),
    })

    // 다음 노드 찾기 및 실행
    let currentNodeId = inputNode.id
    let nextEdge: PipelineEdge | undefined

    // 최대 10번의 노드 실행 (무한 루프 방지)
    for (let i = 0; i < 10; i++) {
      // 현재 노드에서 나가는 엣지 찾기
      nextEdge = pipeline.edges.find((edge) => edge.source === currentNodeId)
      if (!nextEdge) break

      // 다음 노드 찾기
      const nextNode = pipeline.nodes.find(
        (node) => node.id === nextEdge?.target,
      )
      if (!nextNode) break

      // 노드 타입에 따른 처리
      let output = ''
      switch (nextNode.type) {
        case 'plan':
          output = `계획: ${input}에 대한 작업 계획을 수립합니다.`
          break
        case 'decision':
          output = `결정: ${input}에 대한 다음 단계를 결정합니다.`
          break
        case 'action':
          output = `행동: ${input}에 대한 최종 행동을 실행합니다.`
          break
        default:
          output = `처리: ${input}`
      }

      // 실행 경로에 추가
      executionPath.push({
        nodeId: nextNode.id,
        status: 'success',
        output,
        timestamp: new Date(),
      })

      // 다음 노드로 이동
      currentNodeId = nextNode.id
    }

    // 최종 출력 생성
    const finalNode = pipeline.nodes.find((node) => node.id === currentNodeId)
    const finalOutput =
      finalNode?.type === 'action'
        ? `"${input}"에 대한 처리가 완료되었습니다.`
        : '파이프라인 실행이 완료되지 않았습니다.'

    return {
      output: finalOutput,
      executionPath,
    }
  }
}

export const pipelineService = new PipelineService()
