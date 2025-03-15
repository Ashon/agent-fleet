import { NodeExecutionResult, PipelineNode } from '@agentfleet/types'
import { NodeExecutionContext, NodeExecutor } from './NodeExecutor'

export class MockNodeExecutor implements NodeExecutor {
  private readonly nodeExecutionDelay =
    process.env.NODE_ENV === 'test' ? 100 : 2000

  constructor(private readonly nodeType: string) {}

  canExecute(node: PipelineNode): boolean {
    return node.type === this.nodeType
  }

  async execute(
    node: PipelineNode,
    input: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const startTime = new Date()

    try {
      // 실제 실행을 시뮬레이션하기 위한 지연
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * this.nodeExecutionDelay),
      )

      // 노드 타입에 따른 출력 생성
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      return result
    }
  }
}
