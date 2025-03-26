import { LLMCompletionResult } from '@agentfleet/types'
import { LLMCompletionOptions, LLMProvider } from './LLMProvider'

interface OllamaCompletionResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_duration?: number
  eval_duration?: number
  prompt_tokens?: number
  eval_tokens?: number
}

export class OllamaProvider implements LLMProvider {
  constructor(
    private readonly baseUrl: string = 'http://localhost:11434',
    private readonly model: string = 'gemma3',
  ) {}

  async complete(
    prompt: string,
    options: LLMCompletionOptions,
  ): Promise<LLMCompletionResult> {
    try {
      console.log('OllamaProvider complete', prompt, options)
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            num_predict: options.maxTokens,
            temperature: options.temperature,
            stop: options.stopSequences,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API 호출 실패: ${response.statusText}`)
      }

      const result = (await response.json()) as OllamaCompletionResponse

      // think 블록과 응답 분리
      const thinkMatch = result.response.match(/<think>(.*?)<\/think>/s)
      const thinking = thinkMatch ? thinkMatch[1].trim() : ''
      const cleanResponse = result.response
        .replace(/<think>.*?<\/think>/s, '')
        .trim()

      // JSON 코드 블록 확인 및 파싱 (```json 또는 ``` 형식 모두 처리)
      const codeBlockMatch = cleanResponse.match(
        /```(?:json)?\s*([\s\S]*?)\s*```/,
      )
      let parsedResponse = cleanResponse
      let jsonData = null

      if (codeBlockMatch) {
        try {
          jsonData = JSON.parse(codeBlockMatch[1].trim())
          parsedResponse = cleanResponse
            .replace(/```(?:json)?\s*[\s\S]*?\s*```/, '')
            .trim()
        } catch (e) {
          console.warn('JSON 파싱 실패:', e)
        }
      }

      // Ollama는 정확한 토큰 수를 제공하지 않을 수 있으므로 근사값 사용
      const promptTokens = result.prompt_tokens ?? Math.ceil(prompt.length / 4)
      const completionTokens =
        result.eval_tokens ?? Math.ceil(result.response.length / 4)

      return {
        text: parsedResponse,
        json: jsonData,
        thinking,
        model: result.model,
        prompt,
        tokenUsage: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens,
        },
      }
    } catch (error) {
      throw new Error(
        `Ollama API 호출 실패: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
      )
    }
  }
}
