import OpenAI from 'openai'
import {
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMProvider,
} from './LLMProvider'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async complete(
    prompt: string,
    options: LLMCompletionOptions,
  ): Promise<LLMCompletionResult> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        stop: options.stopSequences,
      })

      const result = completion.choices[0]

      return {
        text: result.message.content || '',
        model: completion.model,
        tokenUsage: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
        },
      }
    } catch (error) {
      throw new Error(
        `OpenAI API 호출 실패: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
      )
    }
  }
}
