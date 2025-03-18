import {
  NodeExecutionResult,
  NodeExecutionState,
  Pipeline,
  PipelineExecutionRecord,
  PipelineNode,
} from '@agentfleet/types'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { PipelineExecutionsRepository } from '../repositories/pipelineExecution.repository'
import { NodeExecutorFactory } from './nodeExecutors/NodeExecutorFactory'

interface StreamMessage {
  type: 'start' | 'node-start' | 'node-complete' | 'complete' | 'error'
  nodeId?: string
  nodeName?: string
  nodeType?: string
  status?: string
  args?: { [key: string]: any }
  output?: any
  message?: string
  timestamp: Date
  pipelineId?: string
  pipelineName?: string
  result?: {
    executionId: string
    pipelineId: string
    pipelineName: string
    status: 'completed' | 'failed'
    startTime: Date
    endTime: Date
    nodeResults: NodeExecutionResult[]
    finalOutput: string
  }
}

const sendStreamMessage = (res: Response, message: StreamMessage) => {
  res.write(`data: ${JSON.stringify(message)}\n\n`)
}

interface ExecutionNodeState extends NodeExecutionState {
  output?: any
}

interface NodeExecutionContext {
  jobId: string
  response: Response
  args: { [key: string]: any }
}

interface ExecutionContext {
  nodeResults: Map<string, any>
  jobId: string
  response: Response
  pipeline: Pipeline
}

export class PipelineExecutionService {
  constructor(
    private readonly repository: PipelineExecutionsRepository,
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
  ): Map<string, ExecutionNodeState> {
    const executionGraph = new Map<string, ExecutionNodeState>()

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
    executionGraph: Map<string, ExecutionNodeState>,
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
    executionGraph: Map<string, ExecutionNodeState>,
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
    executionContext: ExecutionContext,
    executionGraph: Map<string, ExecutionNodeState>,
  ): Promise<NodeExecutionResult> {
    const startTime = new Date()
    const state = executionGraph.get(node.id)

    if (state) {
      // 모든 노드에 대해 args 객체 초기화
      const args: { [key: string]: any } = {}

      if (state.dependencies.size === 0) {
        // 시작 노드인 경우 초기 입력값 사용
        const initialInput = executionContext.nodeResults.get(node.id) || ''
        executionContext.nodeResults.set('__input__', initialInput)
        args.__input__ = initialInput

        this.logExecutionStep(`노드 실행 시작 - ${node.data.name}`, {
          nodeId: node.id,
          nodeType: node.type,
          args,
        })

        try {
          const executor = this.nodeExecutorFactory.getExecutor(node)

          sendStreamMessage(executionContext.response, {
            type: 'node-start',
            nodeId: node.id,
            nodeName: node.data.name,
            nodeType: node.type,
            status: 'running',
            args,
            timestamp: startTime,
          })

          const result = await executor.execute(node, args, {
            jobId: executionContext.jobId,
            response: executionContext.response,
            args,
          } as NodeExecutionContext)

          // 실행 결과를 컨텍스트에 저장
          executionContext.nodeResults.set(node.id, result.output)

          this.logExecutionStep(`노드 실행 완료 - ${node.data.name}`, {
            executor: executor.constructor.name,
            nodeId: node.id,
            output: result.output,
          })

          sendStreamMessage(executionContext.response, {
            type: 'node-complete',
            nodeId: node.id,
            nodeName: node.data.name,
            nodeType: node.type,
            status: 'success',
            args,
            output: JSON.stringify(result.output),
            timestamp: new Date(),
          })

          // 실행 결과를 실행 기록에 저장
          const record = await this.repository.findById(executionContext.jobId)
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

          sendStreamMessage(executionContext.response, {
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
      } else {
        // 의존성이 있는 노드의 경우 이전 노드들의 결과를 병합
        const mergedInputs: { [key: string]: any } = {}

        state.dependencies.forEach((depNodeId) => {
          const depNode = executionContext.pipeline.nodes.find(
            (n: PipelineNode) => n.id === depNodeId,
          )
          const depResult = executionContext.nodeResults.get(depNodeId)

          if (depResult !== undefined && depNode) {
            // 노드의 결과를 args에 추가
            const resultValue =
              typeof depResult === 'object' && depResult.value !== undefined
                ? depResult.value
                : depResult

            args[depNode.data.name] = resultValue
            mergedInputs[depNode.data.name] = resultValue
          }
        })

        // __input__ 필드에 병합된 입력값을 JSON 문자열로 저장
        args.__input__ = executionContext.nodeResults.get('__input__')

        this.logExecutionStep(`노드 실행 시작 - ${node.data.name}`, {
          nodeId: node.id,
          nodeType: node.type,
          args,
        })

        try {
          const executor = this.nodeExecutorFactory.getExecutor(node)

          sendStreamMessage(executionContext.response, {
            type: 'node-start',
            nodeId: node.id,
            nodeName: node.data.name,
            nodeType: node.type,
            status: 'running',
            args,
            timestamp: startTime,
          })

          const result = await executor.execute(node, args, {
            jobId: executionContext.jobId,
            response: executionContext.response,
            args,
          } as NodeExecutionContext)

          // 실행 결과를 컨텍스트에 저장
          executionContext.nodeResults.set(node.id, result.output)

          this.logExecutionStep(`노드 실행 완료 - ${node.data.name}`, {
            executor: executor.constructor.name,
            nodeId: node.id,
            output: result.output,
          })

          sendStreamMessage(executionContext.response, {
            type: 'node-complete',
            nodeId: node.id,
            nodeName: node.data.name,
            nodeType: node.type,
            status: 'success',
            args,
            output: JSON.stringify(result.output),
            timestamp: new Date(),
          })

          // 실행 결과를 실행 기록에 저장
          const record = await this.repository.findById(executionContext.jobId)
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

          sendStreamMessage(executionContext.response, {
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
    }

    this.logExecutionStep(`노드 실행 실패 - ${node.data.name}`, {
      nodeId: node.id,
      error: '의존성 문제로 인해 실행할 수 없습니다',
    })

    sendStreamMessage(executionContext.response, {
      type: 'node-complete',
      nodeId: node.id,
      nodeName: node.data.name,
      nodeType: node.type,
      status: 'error',
      message: '의존성 문제로 인해 실행할 수 없습니다',
      timestamp: new Date(),
    })
    throw new Error('의존성 문제로 인해 실행할 수 없습니다')
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
      args: { __input__: input },
    })

    // 노드 배열이 비어있는지 검증
    if (!pipeline.nodes || pipeline.nodes.length === 0) {
      const error = new Error('파이프라인에 실행할 노드가 없습니다')
      this.logExecutionStep('파이프라인 실행 실패', {
        error: error.message,
      })

      // 실행 실패 기록 생성
      await this.repository.save({
        id,
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
        args: { __input__: input },
        status: 'failed',
        startTime,
        endTime: new Date(),
        error: error.message,
        nodeResults: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      sendStreamMessage(res, {
        type: 'error',
        message: error.message,
        timestamp: new Date(),
      })

      throw error
    }

    // 실행 기록 생성
    await this.repository.save({
      id,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      args: { __input__: input },
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
      args: { __input__: input },
      timestamp: startTime,
    })

    try {
      const executionGraph = this.buildExecutionGraph(pipeline)
      const executionContext: ExecutionContext = {
        nodeResults: new Map(),
        jobId: id,
        response: res,
        pipeline,
      }

      // 초기 입력값을 시작 노드들에 설정
      const startNodes = this.findStartNodes(pipeline)
      startNodes.forEach((nodeId) => {
        executionContext.nodeResults.set(nodeId, input)
      })

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
            const result = await this.executeNode(
              node,
              executionContext,
              executionGraph,
            )
            const state = executionGraph.get(node.id)
            if (state) {
              state.output = result.output
              if (this.isFinalNode(node.id, pipeline)) {
                finalOutput =
                  typeof state.output === 'string'
                    ? state.output
                    : JSON.stringify(state.output)
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
        result: {
          executionId: id,
          pipelineId: pipeline.id,
          pipelineName: pipeline.name,
          status: 'completed',
          startTime: startTime,
          endTime: new Date(),
          nodeResults: record?.nodeResults || [],
          finalOutput,
        },
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

  private findStartNodes(pipeline: Pipeline): string[] {
    const startNodes: string[] = []
    const nodeWithIncomingEdges = new Set(
      pipeline.edges.map((edge) => edge.target),
    )

    pipeline.nodes.forEach((node) => {
      if (!nodeWithIncomingEdges.has(node.id)) {
        startNodes.push(node.id)
      }
    })

    return startNodes
  }
}
