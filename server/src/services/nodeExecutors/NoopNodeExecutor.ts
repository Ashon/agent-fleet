import { NodeExecutionResult, PipelineNode } from '@agentfleet/types'
import { NodeExecutionContext, NodeExecutor } from './NodeExecutor'

export class MockNodeExecutor implements NodeExecutor {
  constructor(private readonly nodeType: string) {}

  canExecute(node: PipelineNode): boolean {
    return node.type === this.nodeType
  }

  async execute(
    node: PipelineNode,
    args: { [key: string]: any },
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const startTime = new Date()

    try {
      // 실제 실행을 시뮬레이션하기 위한 지연
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * this.nodeExecutionDelay),
      )

      // 글로벌 값들 (__로 시작하는 키들) 유지
      const globalValues: { [key: string]: any } = {}
      Object.entries(args).forEach(([key, value]) => {
        if (key.startsWith('__')) {
          globalValues[key] = value
        }
      })

      // 이전 노드의 결과 처리
      const prevNodeResults: { [key: string]: any } = {}
      Object.entries(args).forEach(([key, value]) => {
        if (!key.startsWith('__')) {
          if (typeof value === 'object' && value.value !== undefined) {
            prevNodeResults[key] = value.value
          } else {
            prevNodeResults[key] = value
          }
        }
      })

      // 현재 노드의 출력 생성
      const output = {
        value: `프롬프트 처리: "${args.__input__ || ''}"`,
        prevResults: prevNodeResults,
      }

      const endTime = new Date()
      return {
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        args: {
          ...globalValues,
          [node.data.name]: output,
        },
        output,
        startTime,
        endTime,
        status: 'success',
      }
    } catch (error) {
      const endTime = new Date()
      return {
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        args,
        output: {},
        startTime,
        endTime,
        status: 'failed',
      }
    }
  }

  private readonly nodeExecutionDelay = 1000
}
