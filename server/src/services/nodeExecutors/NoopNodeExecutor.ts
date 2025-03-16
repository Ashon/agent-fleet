import { NodeExecutionResult, PipelineNode } from '@agentfleet/types'
import { NodeExecutionContext, NodeExecutor } from './NodeExecutor'

export class MockNodeExecutor implements NodeExecutor {
  private readonly nodeExecutionDelay =
    process.env.NODE_ENV === 'test' ? 100 : 2000

  constructor(private readonly nodeType: string) {}

  canExecute(node: PipelineNode): boolean {
    return node.type === 'prompt'
  }

  async execute(
    node: PipelineNode,
    input: string,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const startTime = new Date()

    try {
      // 실제 실행을 시뮬레이션하기 위한 지연
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * this.nodeExecutionDelay),
      )

      // 출력 생성
      const output = { value: `프롬프트 처리: "${input}"` }

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
