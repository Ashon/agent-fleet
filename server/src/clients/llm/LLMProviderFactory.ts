import { Config } from '../../config'
import { LLMProvider } from './LLMProvider'
import { NoopProvider } from './NoopProvider'
import { OllamaProvider } from './OllamaProvider'
import { OpenAIProvider } from './OpenAIProvider'

export class LLMProviderFactory {
  static create(config: Config['llm']): LLMProvider {
    switch (config.provider) {
      case 'openai':
        if (!config.openai?.apiKey) {
          throw new Error('OpenAI API 키가 설정되지 않았습니다.')
        }
        return new OpenAIProvider(config.openai.apiKey)

      case 'ollama':
        return new OllamaProvider(config.ollama?.baseUrl, config.ollama?.model)

      case 'noop':
        return new NoopProvider()

      default:
        throw new Error(
          `지원하지 않는 LLM 프로바이더입니다: ${config.provider}`,
        )
    }
  }
}
