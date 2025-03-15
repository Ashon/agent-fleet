import {
  CreatePipelinePayload,
  Pipeline,
  PipelineEdge,
  PipelineTestRequest,
  PipelineTestResponse,
} from '@agentfleet/types'
import { PipelineRepository } from '../repositories/pipeline.repository'

export class PipelineService {
  private readonly repository: PipelineRepository

  constructor(repository: PipelineRepository) {
    this.repository = repository
  }

  async getAllPipelines(filters?: { agentId?: string }): Promise<Pipeline[]> {
    const pipelines = await this.repository.findAll()
    let filteredPipelines = [...pipelines]

    if (filters?.agentId) {
      filteredPipelines = filteredPipelines.filter(
        (pipeline) => pipeline.agentId === filters.agentId,
      )
    }

    return filteredPipelines
  }

  async getPipelineById(id: string): Promise<Pipeline | undefined> {
    const pipeline = await this.repository.findById(id)
    return pipeline ?? undefined
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

    return this.repository.create(payload)
  }

  async updatePipeline(
    id: string,
    payload: Partial<Pipeline>,
  ): Promise<Pipeline | undefined> {
    const pipeline = await this.repository.findById(id)
    if (!pipeline) return undefined

    return this.repository.save({
      ...pipeline,
      ...payload,
      id, // ID는 변경 불가
    })
  }

  async deletePipeline(id: string): Promise<boolean> {
    try {
      await this.repository.delete(id)
      return true
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return false
      }
      throw error
    }
  }

  async updatePipelineNodes(
    id: string,
    nodes: Pipeline['nodes'],
  ): Promise<Pipeline | undefined> {
    const pipeline = await this.repository.findById(id)
    if (!pipeline) return undefined

    return this.repository.save({
      ...pipeline,
      nodes,
    })
  }

  async updatePipelineEdges(
    id: string,
    edges: Pipeline['edges'],
  ): Promise<Pipeline | undefined> {
    const pipeline = await this.repository.findById(id)
    if (!pipeline) return undefined

    return this.repository.save({
      ...pipeline,
      edges,
    })
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

    // 1. 모든 노드 ID를 Set으로 저장
    const nodeIds = new Set(pipeline.nodes.map((node) => node.id))

    // 2. 모든 엣지가 유효한 노드를 참조하는지 확인
    const hasInvalidEdge = pipeline.edges.some(
      (edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target),
    )

    if (hasInvalidEdge) {
      return {
        isValid: false,
        message: '유효하지 않은 엣지가 있습니다.',
      }
    }

    // 3. 순환 참조 확인
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (nodeId: string): boolean => {
      if (!nodeIds.has(nodeId)) return false
      if (recursionStack.has(nodeId)) return true
      if (visited.has(nodeId)) return false

      visited.add(nodeId)
      recursionStack.add(nodeId)

      const outgoingEdges = pipeline.edges.filter(
        (edge) => edge.source === nodeId,
      )
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true
      }

      recursionStack.delete(nodeId)
      return false
    }

    // 모든 노드에 대해 순환 참조 검사
    for (const node of pipeline.nodes) {
      if (hasCycle(node.id)) {
        return {
          isValid: false,
          message: '순환 참조가 있습니다.',
        }
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
