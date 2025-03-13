import {
  NodeExecutionState,
  Pipeline,
  PipelineExecutionRecord,
  PipelineNode,
} from '@agentfleet/types'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

export class PipelineExecutionService {
  // 테스트 환경에서 사용할 지연 시간 (ms)
  private nodeExecutionDelay = process.env.NODE_ENV === 'test' ? 100 : 5000
  private nodeCompletionDelay = process.env.NODE_ENV === 'test' ? 50 : 500

  // 실행 기록 저장소
  private executionRecords: Map<string, PipelineExecutionRecord> = new Map()

  // 실행 기록 조회
  async getExecutionRecord(
    jobId: string,
  ): Promise<PipelineExecutionRecord | undefined> {
    return this.executionRecords.get(jobId)
  }

  // 파이프라인 ID로 실행 기록 조회
  async getExecutionRecordsByPipelineId(
    pipelineId: string,
  ): Promise<PipelineExecutionRecord[]> {
    return Array.from(this.executionRecords.values()).filter(
      (record) => record.pipelineId === pipelineId,
    )
  }

  // 모든 실행 기록 조회
  async getAllExecutionRecords(): Promise<PipelineExecutionRecord[]> {
    return Array.from(this.executionRecords.values())
  }

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

  private async executeNode(
    node: PipelineNode,
    input: string,
    res: Response,
    jobId: string,
  ): Promise<string> {
    const startTime = new Date()
    const record = this.executionRecords.get(jobId)
    if (!record) throw new Error('실행 기록을 찾을 수 없습니다.')

    res.write(
      `data: ${JSON.stringify({
        type: 'node-start',
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        jobId,
      })}\n\n`,
    )

    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * this.nodeExecutionDelay),
    )

    let output = ''
    try {
      switch (node.type) {
        case 'input':
          output = `입력 처리: "${input}"`
          break
        case 'plan':
          output = `계획 수립: ${node.data.description || ''}`
          break
        case 'decision':
          output = `결정: ${node.data.description || ''}`
          break
        case 'action':
          output = `행동 실행: ${node.data.description || ''}`
          break
        case 'process':
          output = `데이터 처리: ${node.data.description || ''}`
          break
        case 'aggregator':
          output = `결과 통합: ${node.data.description || ''}`
          break
        case 'analysis':
          output = `분석 수행: ${node.data.description || ''}`
          break
        default:
          output = `알 수 없는 노드 타입: ${node.type}`
      }

      const endTime = new Date()
      record.nodeResults.push({
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        output,
        startTime,
        endTime,
        status: 'success',
      })

      res.write(
        `data: ${JSON.stringify({
          type: 'node-complete',
          nodeId: node.id,
          output,
          status: 'success',
          jobId,
        })}\n\n`,
      )

      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * this.nodeCompletionDelay),
      )
      return output
    } catch (error) {
      const endTime = new Date()
      record.nodeResults.push({
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        output: error instanceof Error ? error.message : '알 수 없는 오류',
        startTime,
        endTime,
        status: 'failed',
      })

      throw error
    }
  }

  async executePipeline(
    pipeline: Pipeline,
    input: string,
    jobId: string,
    res: Response,
  ) {
    if (!pipeline.nodes.length) {
      throw new Error('파이프라인에 실행할 노드가 없습니다.')
    }

    // 실행 기록 초기화
    this.executionRecords.set(jobId, {
      jobId,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      input,
      status: 'running',
      startTime: new Date(),
      nodeResults: [],
    })

    const executionGraph = this.buildExecutionGraph(pipeline)

    try {
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
            const output = await this.executeNode(node, input, res, jobId)
            const state = executionGraph.get(node.id)
            if (state) {
              state.output = output
            }
            this.updateExecutionState(node.id, executionGraph, pipeline)
          }),
        )
      }

      // 마지막 노드의 출력을 최종 결과로 저장
      const record = this.executionRecords.get(jobId)!
      const lastNodeResult = record.nodeResults.slice(-1)[0]
      if (lastNodeResult) {
        record.finalOutput = lastNodeResult.output
      }
      record.status = 'completed'
      record.endTime = new Date()
    } catch (error) {
      // 실행 실패 기록
      const record = this.executionRecords.get(jobId)!
      record.status = 'failed'
      record.endTime = new Date()
      record.error = error instanceof Error ? error.message : '알 수 없는 오류'
      throw error
    }
  }

  async streamPipelineExecution(
    pipeline: Pipeline,
    input: string,
    res: Response,
  ) {
    const jobId = uuidv4()
    const startTime = new Date()

    // 실행 기록 생성
    this.executionRecords.set(jobId, {
      jobId,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      input,
      status: 'running',
      startTime,
      nodeResults: [],
    })

    res.write(
      `data: ${JSON.stringify({
        type: 'start',
        message: '파이프라인 실행을 시작합니다.',
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
        jobId,
      })}\n\n`,
    )

    try {
      await this.executePipeline(pipeline, input, jobId, res)

      // 실행 완료 기록
      const record = this.executionRecords.get(jobId)!
      record.status = 'completed'
      record.endTime = new Date()

      res.write(
        `data: ${JSON.stringify({
          type: 'complete',
          message: '파이프라인 실행이 완료되었습니다.',
          pipelineId: pipeline.id,
          jobId,
          finalOutput: record.finalOutput,
        })}\n\n`,
      )
    } catch (error) {
      // 실행 실패 기록
      const record = this.executionRecords.get(jobId)!
      record.status = 'failed'
      record.endTime = new Date()
      record.error = error instanceof Error ? error.message : '알 수 없는 오류'

      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : '파이프라인 실행 중 오류가 발생했습니다.',
          pipelineId: pipeline.id,
          jobId,
        })}\n\n`,
      )
    }

    return jobId
  }
}

export const pipelineExecutionService = new PipelineExecutionService()
