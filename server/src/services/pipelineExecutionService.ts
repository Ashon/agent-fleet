import {
  NodeExecutionResult,
  NodeExecutionState,
  Pipeline,
  PipelineExecutionRecord,
  PipelineNode,
} from '@agentfleet/types'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { LLMProvider } from '../clients/llm/LLMProvider'
import { PipelineJobsRepository } from '../repositories/pipelineJobsRepository'
import { NodeExecutorFactory } from './nodeExecutors/NodeExecutorFactory'
import { PromptService } from './prompt.service'

interface StreamMessage {
  type: 'start' | 'node-start' | 'node-complete' | 'complete' | 'error'
  nodeId?: string
  nodeName?: string
  nodeType?: string
  status?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output?: any
  message?: string
  timestamp: Date
  pipelineId?: string
  pipelineName?: string
}

const sendStreamMessage = (res: Response, message: StreamMessage) => {
  res.write(`data: ${JSON.stringify(message)}\n\n`)
}

export class PipelineExecutionService {
  constructor(
    private readonly repository: PipelineJobsRepository,
    private readonly promptService: PromptService,
    private readonly llmProvider: LLMProvider,
    private readonly nodeExecutorFactory: NodeExecutorFactory,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logExecutionStep(message: string, data?: any) {
    console.log(
      `[파이프라인 실행] ${message}`,
      data ? JSON.stringify(data, null, 2) : '',
    )
  }

  // 실행 기록 조회
  async getExecutionRecord(
    id: string,
  ): Promise<PipelineExecutionRecord | undefined> {
    const record = await this.repository.findById(id)
    return record ?? undefined
  }

  // 파이프라인 ID로 실행 기록 조회
  async getExecutionRecordsByPipelineId(
    pipelineId: string,
  ): Promise<PipelineExecutionRecord[]> {
    return this.repository.findByPipelineId(pipelineId)
  }

  // 모든 실행 기록 조회
  async getAllExecutionRecords(): Promise<PipelineExecutionRecord[]> {
    return this.repository.findAll()
  }

  // 실행 그래프 생성
  private buildExecutionGraph(
    pipeline: Pipeline,
  ): Map<string, NodeExecutionState> {
    const executionGraph = new Map<string, NodeExecutionState>()

    pipeline.nodes.forEach((node) => {
      executionGraph.set(node.id, {
        node,
        inDegree: 0,
        dependencies: new Set<string>(),
        executed: false,
      })
    })

    pipeline.edges.forEach((edge) => {
      const targetNode = executionGraph.get(edge.target)
      if (targetNode) {
        targetNode.inDegree++
        targetNode.dependencies.add(edge.source)
      }
    })

    return executionGraph
  }

  // 실행 가능한 노드 찾기
  private findExecutableNodes(
    executionGraph: Map<string, NodeExecutionState>,
  ): PipelineNode[] {
    const executableNodes: PipelineNode[] = []

    executionGraph.forEach((state) => {
      if (!state.executed && state.inDegree === 0) {
        executableNodes.push(state.node)
      }
    })

    return executableNodes
  }

  // 실행 상태 업데이트
  private updateExecutionState(
    nodeId: string,
    executionGraph: Map<string, NodeExecutionState>,
    pipeline: Pipeline,
  ): void {
    const state = executionGraph.get(nodeId)
    if (!state) return

    state.executed = true

    pipeline.edges
      .filter((edge) => edge.source === nodeId)
      .forEach((edge) => {
        const targetState = executionGraph.get(edge.target)
        if (targetState) {
          targetState.inDegree--
        }
      })
  }

  // 노드 실행
  private async executeNode(
    node: PipelineNode,
    input: string,
    res: Response,
    jobId: string,
  ): Promise<NodeExecutionResult> {
    const startTime = new Date()
    this.logExecutionStep(`노드 실행 시작 - ${node.data.name}`, {
      nodeId: node.id,
      nodeType: node.type,
      input: input,
    })

    try {
      const executor = this.nodeExecutorFactory.getExecutor(node)

      sendStreamMessage(res, {
        type: 'node-start',
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        status: 'running',
        timestamp: startTime,
      })

      const result = await executor.execute(node, input, {
        jobId,
        response: res,
      })

      this.logExecutionStep(`노드 실행 완료 - ${node.data.name}`, {
        executor: executor.constructor.name,
        nodeId: node.id,
        output: result.output,
      })

      sendStreamMessage(res, {
        type: 'node-complete',
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        status: 'success',
        output:
          typeof result.output === 'string'
            ? result.output
            : JSON.stringify(result.output),
        timestamp: new Date(),
      })

      // 실행 결과를 실행 기록에 저장
      const record = await this.repository.findById(jobId)
      if (record) {
        record.nodeResults = [...(record.nodeResults || []), result]
        await this.repository.save(record)
      }

      return result
    } catch (error) {
      this.logExecutionStep(`노드 실행 실패 - ${node.data.name}`, {
        nodeId: node.id,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      })

      sendStreamMessage(res, {
        type: 'node-complete',
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        status: 'error',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date(),
      })
      throw error
    }
  }

  // 파이프라인 실행
  async executePipeline(
    pipeline: Pipeline,
    input: string,
    jobId: string,
    res: Response,
  ) {
    // 실행 기록 초기화
    await this.repository.save({
      id: jobId,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      input,
      status: 'running',
      startTime: new Date(),
      nodeResults: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    try {
      if (!pipeline.nodes.length) {
        throw new Error('파이프라인에 실행할 노드가 없습니다.')
      }

      const executionGraph = this.buildExecutionGraph(pipeline)
      let finalOutput = ''

      while (true) {
        const executableNodes = this.findExecutableNodes(executionGraph)
        if (executableNodes.length === 0) {
          const allExecuted = Array.from(executionGraph.values()).every(
            (state) => state.executed,
          )
          if (allExecuted) break

          throw new Error(
            '파이프라인 실행 오류: 실행할 수 없는 노드가 있습니다',
          )
        }

        await Promise.all(
          executableNodes.map(async (node) => {
            const result = await this.executeNode(node, input, res, jobId)
            const state = executionGraph.get(node.id)
            if (state) {
              state.output =
                typeof result.output === 'string'
                  ? result.output
                  : JSON.stringify(result.output)
              if (this.isFinalNode(node.id, pipeline)) {
                finalOutput = state.output
              }
            }
            this.updateExecutionState(node.id, executionGraph, pipeline)
          }),
        )
      }

      // 실행 완료 처리
      const record = await this.repository.findById(jobId)
      if (record) {
        record.status = 'completed'
        record.endTime = new Date()
        record.finalOutput = finalOutput
        await this.repository.save(record)
      }

      // 최종 노드의 출력을 반환
      const finalNodeId = this.findFinalNodeId(pipeline)
      if (finalNodeId) {
        const finalState = executionGraph.get(finalNodeId)
        return finalState?.output || ''
      }

      return ''
    } catch (error) {
      // 에러 발생 시 실행 기록 업데이트
      const record = await this.repository.findById(jobId)
      if (record) {
        record.status = 'failed'
        record.error =
          error instanceof Error ? error.message : '알 수 없는 오류'
        record.endTime = new Date()
        await this.repository.save(record)
      }

      throw error
    }
  }

  private findFinalNodeId(pipeline: Pipeline): string | undefined {
    // 나가는 엣지가 없는 노드를 찾음
    const outgoingEdges = new Set(pipeline.edges.map((edge) => edge.source))
    return pipeline.nodes.find((node) => !outgoingEdges.has(node.id))?.id
  }

  // 파이프라인 실행 스트리밍
  async streamPipelineExecution(
    pipeline: Pipeline,
    input: string,
    res: Response,
  ) {
    const id = uuidv4()
    const startTime = new Date()

    this.logExecutionStep('파이프라인 실행 시작', {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      input: input,
    })

    // 실행 기록 생성
    await this.repository.save({
      id,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      input,
      status: 'running',
      startTime,
      nodeResults: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    sendStreamMessage(res, {
      type: 'start',
      message: '파이프라인 실행을 시작합니다.',
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      timestamp: startTime,
    })

    try {
      const executionGraph = this.buildExecutionGraph(pipeline)
      this.logExecutionStep('실행 그래프 생성 완료', {
        nodes: Array.from(executionGraph.keys()),
      })

      let finalOutput = ''

      while (true) {
        const executableNodes = this.findExecutableNodes(executionGraph)
        this.logExecutionStep('실행 가능한 노드 발견', {
          count: executableNodes.length,
          nodes: executableNodes.map((n) => ({ id: n.id, name: n.data.name })),
        })

        if (executableNodes.length === 0) {
          const allExecuted = Array.from(executionGraph.values()).every(
            (state) => state.executed,
          )
          if (allExecuted) {
            this.logExecutionStep('모든 노드 실행 완료')
            break
          }

          throw new Error(
            '파이프라인 실행 오류: 실행할 수 없는 노드가 있습니다',
          )
        }

        await Promise.all(
          executableNodes.map(async (node) => {
            const result = await this.executeNode(node, input, res, id)
            const state = executionGraph.get(node.id)
            if (state) {
              state.output =
                typeof result.output === 'string'
                  ? result.output
                  : JSON.stringify(result.output)
              if (this.isFinalNode(node.id, pipeline)) {
                finalOutput = state.output
                this.logExecutionStep('최종 노드 실행 완료', {
                  nodeId: node.id,
                  output: finalOutput,
                })
              }
            }
            this.updateExecutionState(node.id, executionGraph, pipeline)
          }),
        )
      }

      // 실행 완료 기록
      const record = await this.repository.findById(id)
      if (record) {
        record.status = 'completed'
        record.endTime = new Date()
        record.finalOutput = finalOutput
        await this.repository.save(record)
        this.logExecutionStep('파이프라인 실행 기록 저장 완료', {
          recordId: record.id,
          status: record.status,
        })
      }

      sendStreamMessage(res, {
        type: 'complete',
        message: '파이프라인 실행이 완료되었습니다.',
        output: finalOutput,
        timestamp: new Date(),
      })
    } catch (error) {
      this.logExecutionStep('파이프라인 실행 실패', {
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      })

      // 실행 실패 기록
      const record = await this.repository.findById(id)
      if (record) {
        record.status = 'failed'
        record.endTime = new Date()
        record.error =
          error instanceof Error ? error.message : '알 수 없는 오류'
        await this.repository.save(record)
      }

      sendStreamMessage(res, {
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : '파이프라인 실행 중 오류가 발생했습니다.',
        timestamp: new Date(),
      })

      throw error
    }

    return id
  }

  private isFinalNode(nodeId: string, pipeline: Pipeline): boolean {
    return !pipeline.edges.some((edge) => edge.source === nodeId)
  }
}
