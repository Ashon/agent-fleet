import {
  LLMCompletionResult,
  NodeExecutionResult,
  PipelineNode,
  PromptNodeConfig,
} from '@agentfleet/types'
import { LLMProvider } from '../../clients/llm/LLMProvider'
import { ConnectorFactory } from '../connectors/ConnectorFactory'
import { PromptService } from '../prompt.service'
import { NodeExecutionContext, NodeExecutor } from './NodeExecutor'

export class PromptNodeExecutor implements NodeExecutor {
  constructor(
    private readonly promptService: PromptService,
    private readonly llmProvider: LLMProvider,
    private readonly connectorFactory: ConnectorFactory,
  ) {}

  canExecute(node: PipelineNode): boolean {
    return node.type === 'prompt'
  }

  async execute(
    node: PipelineNode,
    args: { [key: string]: any },
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const startTime = new Date()
    const { jobId, response } = context

    // 입력 데이터에서 변수 추출
    const config = node.data.config as PromptNodeConfig
    if (!config) {
      throw new Error('Prompt node config not found')
    }

    try {
      // 노드 실행 시작을 클라이언트에 알림
      response.write(
        `data: ${JSON.stringify({
          type: 'node-start',
          nodeId: node.id,
          nodeName: node.data.name,
          nodeType: node.type,
          args,
          jobId,
        })}\n\n`,
      )

      // 컨텍스트 소스에서 추가 데이터 수집
      if (config.contextSources) {
        for (const source of config.contextSources) {
          const contextData = await this.fetchContextData(source)
          Object.assign(args, contextData)
        }
      }

      // 프롬프트 렌더링
      const renderedPrompt = await this.promptService.renderPrompt(
        config.promptId,
        args,
      )

      // LLM 호출
      const completion = await this.llmProvider.complete(renderedPrompt, {
        maxTokens: config.maxTokens ?? 1000,
        temperature: config.temperature ?? 0.1,
        stopSequences: config.stopSequences,
      })

      // 출력 데이터 구성
      const output = this.processOutput(completion, config)

      const endTime = new Date()
      const result: NodeExecutionResult = {
        nodeId: node.id,
        nodeName: node.data.name,
        nodeType: node.type,
        args,
        output,
        startTime,
        endTime,
        status: 'success',
        completion: completion,
        config: config,
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
        args,
        output: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        startTime,
        endTime,
        status: 'failed',
        completion: undefined,
        config: config,
      }

      // 노드 실행 실패를 클라이언트에 알림
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

  private async fetchContextData(
    source: NonNullable<PromptNodeConfig['contextSources']>[0],
  ): Promise<Record<string, string>> {
    if (!source.config) {
      throw new Error('Context source config not found')
    }

    // 컨텍스트 소스 타입을 커넥터 ID의 접두어로 사용
    const connectorId = source.connectorId || `${source.type}-default`
    return this.connectorFactory.fetchData(connectorId, source.config)
  }

  private processOutput(
    completion: LLMCompletionResult,
    config: PromptNodeConfig,
  ): Record<string, any> {
    const output: Record<string, any> = {
      __completion__: completion,
    }

    // 지정된 출력 필드만 선택
    if (config.contextMapping.output.length > 0) {
      try {
        const parsedCompletion = completion.json || JSON.parse(completion.text)
        config.contextMapping.output.forEach((field) => {
          if (field in parsedCompletion) {
            output[field] = parsedCompletion[field]
          }
        })
      } catch {
        // JSON 파싱 실패 시 전체 응답을 반환
        output.result = {
          __output__: completion.text,
          json: completion.json,
          thinking: completion.thinking,
        }
      }
    }

    return output
  }
}
