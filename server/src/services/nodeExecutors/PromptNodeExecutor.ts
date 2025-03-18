import {
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
      throw new Error('프롬프트 노드 설정이 없습니다.')
    }

    // 기본 변수 추출
    const variables = this.extractVariables(args, config)

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
          Object.assign(variables, contextData)
        }
      }

      // 프롬프트 렌더링
      const renderedPrompt = await this.promptService.renderPrompt(
        config.templateId,
        variables,
      )

      // LLM 호출
      const completion = await this.llmProvider.complete(renderedPrompt, {
        maxTokens: config.maxTokens ?? 1000,
        temperature: config.temperature ?? 0.7,
        stopSequences: config.stopSequences,
      })

      // 출력 데이터 구성
      const output = this.processOutput(completion.text, config)

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
        metadata: {
          model: completion.model,
          tokenUsage: completion.tokenUsage,
          contextSources: config.contextSources?.map((source) => source.type),
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
        args,
        output: {
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        },
        startTime,
        endTime,
        status: 'failed',
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
      throw new Error('컨텍스트 소스 설정이 없습니다.')
    }

    // 컨텍스트 소스 타입을 커넥터 ID의 접두어로 사용
    const connectorId = source.connectorId || `${source.type}-default`
    return this.connectorFactory.fetchData(connectorId, source.config)
  }

  private extractVariables(
    args: { [key: string]: any },
    config: PromptNodeConfig,
  ): Record<string, string> {
    const variables: Record<string, string> = {}
    const __input__ = args.__input__ || ''

    try {
      // args 객체 전체를 파싱 대상으로 사용
      config.contextMapping.input.forEach((field) => {
        if (field in args) {
          variables[field] = args[field] || '__undefined__'
        }
      })

      // __input__이 JSON 형태인 경우 추가 파싱
      try {
        const inputData = JSON.parse(__input__)
        config.contextMapping.input.forEach((field) => {
          if (field in inputData && !(field in variables)) {
            variables[field] = inputData[field]
          }
        })
      } catch {
        // JSON 파싱 실패 시 전체 입력을 '__input__' 변수로 사용
        if (!('__input__' in variables)) {
          variables['__input__'] = __input__
        }
      }
    } catch (error) {
      // 예외 발생 시 기본적으로 __input__ 값은 보존
      variables['__input__'] = __input__
    }

    // 추가 변수 병합
    return { ...variables, ...config.variables }
  }

  private processOutput(
    completionText: string,
    config: PromptNodeConfig,
  ): Record<string, any> {
    const output: Record<string, any> = {
      completion: completionText,
    }

    // 지정된 출력 필드만 선택
    if (config.contextMapping.output.length > 0) {
      try {
        const parsedCompletion = JSON.parse(completionText)
        config.contextMapping.output.forEach((field) => {
          if (field in parsedCompletion) {
            output[field] = parsedCompletion[field]
          }
        })
      } catch {
        // JSON 파싱 실패 시 전체 응답을 반환
        output.result = completionText
      }
    }

    return output
  }
}
