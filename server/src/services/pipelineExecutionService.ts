import { Pipeline, PipelineNode } from '@agentfleet/types'
import { Response } from 'express'

interface NodeExecutionState {
  node: PipelineNode
  inDegree: number
  dependencies: Set<string>
  executed: boolean
  output?: string
}

export class PipelineExecutionService {
  // 테스트 환경에서 사용할 지연 시간 (ms)
  private nodeExecutionDelay = process.env.NODE_ENV === 'test' ? 100 : 5000
  private nodeCompletionDelay = process.env.NODE_ENV === 'test' ? 50 : 500

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
  ): Promise<string> {
    res.write(
      `data: ${JSON.stringify({
        type: 'node-start',
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
      })}\n\n`,
    )

    await new Promise((resolve) => setTimeout(resolve, this.nodeExecutionDelay))

    let output = ''
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

    res.write(
      `data: ${JSON.stringify({
        type: 'node-complete',
        nodeId: node.id,
        output,
        status: 'success',
      })}\n\n`,
    )

    await new Promise((resolve) =>
      setTimeout(resolve, this.nodeCompletionDelay),
    )
    return output
  }

  async executePipeline(pipeline: Pipeline, input: string, res: Response) {
    if (!pipeline.nodes.length) {
      throw new Error('파이프라인에 실행할 노드가 없습니다.')
    }

    const executionGraph = this.buildExecutionGraph(pipeline)

    while (true) {
      const executableNodes = this.findExecutableNodes(executionGraph)
      if (executableNodes.length === 0) {
        const allExecuted = Array.from(executionGraph.values()).every(
          (state) => state.executed,
        )
        if (allExecuted) break

        throw new Error('파이프라인 실행 오류: 실행할 수 없는 노드가 있습니다')
      }

      await Promise.all(
        executableNodes.map(async (node) => {
          const output = await this.executeNode(node, input, res)
          const state = executionGraph.get(node.id)
          if (state) {
            state.output = output
          }
          this.updateExecutionState(node.id, executionGraph, pipeline)
        }),
      )
    }
  }

  async streamPipelineExecution(
    pipeline: Pipeline,
    input: string,
    res: Response,
  ) {
    res.write(
      `data: ${JSON.stringify({
        type: 'start',
        message: '파이프라인 실행을 시작합니다.',
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
      })}\n\n`,
    )

    try {
      await this.executePipeline(pipeline, input, res)

      res.write(
        `data: ${JSON.stringify({
          type: 'complete',
          message: '파이프라인 실행이 완료되었습니다.',
          pipelineId: pipeline.id,
          finalOutput: '최종 응답이 생성되었습니다.',
        })}\n\n`,
      )
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : '파이프라인 실행 중 오류가 발생했습니다.',
          pipelineId: pipeline.id,
        })}\n\n`,
      )
    }
  }
}

export const pipelineExecutionService = new PipelineExecutionService()
