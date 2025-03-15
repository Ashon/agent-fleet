import { PipelineNode } from '@agentfleet/types'
import { NodeExecutor } from './NodeExecutor'

export class NodeExecutorFactory {
  private executors: NodeExecutor[] = []

  registerExecutor(executor: NodeExecutor): void {
    this.executors.push(executor)
  }

  getExecutor(node: PipelineNode): NodeExecutor {
    const executor = this.executors.find((e) => e.canExecute(node))
    if (!executor) {
      throw new Error(
        `${node.type} 타입의 노드를 실행할 수 있는 실행기가 없습니다.`,
      )
    }
    return executor
  }
}
