import {
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMProvider,
} from './LLMProvider'

export class NoopProvider implements LLMProvider {
  private readonly nodeExecutionDelay =
    process.env.NODE_ENV === 'test' ? 100 : 5000

  async complete(
    prompt: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: LLMCompletionOptions,
  ): Promise<LLMCompletionResult> {
    // 실제 실행을 시뮬레이션하기 위한 지연
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * this.nodeExecutionDelay),
    )

    // 프롬프트 내용을 기반으로 간단한 응답 생성
    const response = `NOOP 응답: "${prompt.slice(0, 50)}..."`

    return {
      text: response,
      model: 'noop',
      tokenUsage: {
        prompt: Math.ceil(prompt.length / 4),
        completion: Math.ceil(response.length / 4),
        total: Math.ceil((prompt.length + response.length) / 4),
      },
    }
  }
}
