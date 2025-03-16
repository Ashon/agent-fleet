import {
  NodeExecutionResult,
  PipelineNode,
  PromptNodeConfig,
} from '@agentfleet/types'
import { LLMProvider } from '../../clients/llm/LLMProvider'
import { PromptService } from '../prompt.service'
import { NodeExecutionContext, NodeExecutor } from './NodeExecutor'

export class PromptNodeExecutor implements NodeExecutor {
  constructor(
    private readonly promptService: PromptService,
    private readonly llmProvider: LLMProvider,
  ) {}

  canExecute(node: PipelineNode): boolean {
    return node.type === 'prompt'
  }

  async execute(
    node: PipelineNode,
    input: string,
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
    const variables = this.extractVariables(input, config)

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
        input: variables,
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
        input: variables,
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

    switch (source.type) {
      case 'connector':
        if (!source.connectorId) {
          throw new Error('커넥터 ID가 지정되지 않았습니다.')
        }
        // TODO: 커넥터 서비스를 통해 외부 시스템과 연동
        return {
          result: `커넥터 ${source.connectorId}를 통해 데이터를 가져옵니다.
            쿼리: ${source.config.query}
            필터: ${JSON.stringify(source.config.filters)}
            옵션: ${JSON.stringify(source.config.options)}`,
        }

      case 'memory':
        // TODO: 메모리 스토어 서비스를 통해 데이터 조회
        return {
          result: `메모리에서 데이터를 조회합니다.
            쿼리: ${source.config.query}`,
        }

      case 'knowledge-base':
        // TODO: 지식 베이스 서비스를 통해 데이터 조회
        return {
          result: `지식 베이스에서 데이터를 조회합니다.
            쿼리: ${source.config.query}
            필터: ${JSON.stringify(source.config.filters)}
            옵션: ${JSON.stringify(source.config.options)}`,
        }

      default:
        throw new Error(
          `지원하지 않는 컨텍스트 소스 타입입니다: ${source.type}`,
        )
    }
  }

  private extractVariables(
    input: string,
    config: PromptNodeConfig,
  ): Record<string, string> {
    const variables: Record<string, string> = {}

    try {
      const inputData = JSON.parse(input)
      config.contextMapping.input.forEach((field) => {
        if (field in inputData) {
          variables[field] = inputData[field]
        }
      })
    } catch {
      // JSON 파싱 실패 시 전체 입력을 'input' 변수로 사용
      variables['input'] = input
    }

    // 추가 변수 병합
    return { ...variables, ...config.variables }
  }

  private processOutput(
    completionText: string,
    config: PromptNodeConfig,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
