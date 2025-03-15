import { NodeExecutionResult, PipelineNode } from '@agentfleet/types'
import {
  NodeExecutionContext,
  NodeExecutor,
} from '../../nodeExecutors/NodeExecutor'

export class MockNodeExecutor implements NodeExecutor {
  private readonly nodeExecutionDelay = 100 // 테스트 환경에서는 짧은 지연 사용

  constructor(private readonly nodeType: string) {}

  canExecute(node: PipelineNode): boolean {
    return node.type === this.nodeType
  }

  async execute(
    node: PipelineNode,
    input: string,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const startTime = new Date()
    const { jobId, response } = context

    try {
      // 노드 실행 시작을 클라이언트에 알림
      response.write(
        `data: ${JSON.stringify({
          type: 'node-start',
          nodeId: node.id,
          nodeName: node.data.name,
          nodeType: node.type,
          jobId,
        })}\n\n`,
      )

      // 실제 실행을 시뮬레이션하기 위한 지연
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * this.nodeExecutionDelay),
      )

      // 노드 타입에 따른 출력 생성
      let output: Record<string, any>
      switch (node.type) {
        case 'input':
          output = { value: `입력 처리: "${input}"` }
          break
        case 'plan':
          output = { value: '계획 수립: ' + node.data.description }
          break
        case 'action':
          output = { value: '행동 실행: ' + node.data.description }
          break
        case 'decision':
          output = { value: '결정: ' + node.data.description }
          break
        case 'aggregator':
          output = { value: '결과 통합: ' + node.data.description }
          break
        case 'analysis':
          output = { value: '분석: ' + node.data.description }
          break
        default:
          output = { value: '처리: ' + node.data.description }
      }

      const endTime = new Date()
      const result: NodeExecutionResult = {
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        input: { value: input },
        output,
        startTime,
        endTime,
        status: 'success',
        metadata: {
          executionTime: endTime.getTime() - startTime.getTime(),
        },
      }

      // 노드 실행 완료를 클라이언트에 알림
      response.write(
        `data: ${JSON.stringify({
          type: 'node-complete',
          ...result,
          jobId,
        })}\n\n`,
      )

      return result
    } catch (error) {
      const endTime = new Date()
      const result: NodeExecutionResult = {
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        input: { value: input },
        output: {},
        startTime,
        endTime,
        status: 'failed',
        metadata: {
          executionTime: endTime.getTime() - startTime.getTime(),
          errorMessage:
            error instanceof Error ? error.message : '알 수 없는 오류',
        },
      }

      // 노드 실행 오류를 클라이언트에 알림
      response.write(
        `data: ${JSON.stringify({
          type: 'node-error',
          ...result,
          jobId,
        })}\n\n`,
      )

      return result
    }
  }
}
