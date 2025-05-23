import dotenv from 'dotenv'

dotenv.config()

export interface Config {
  port: number
  env: string
  llm: {
    provider: 'openai' | 'ollama' | 'noop'
    openai?: {
      apiKey: string
    }
    ollama?: {
      baseUrl: string
      model: string
    }
  }
  storage: {
    type: 'minio'
    region: string
    endpoint: string
    useSSL: boolean
    accessKey: string
    secretKey: string
    bucket: string
  }
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  llm: {
    provider: (process.env.LLM_PROVIDER as Config['llm']['provider']) || 'noop',
    openai: process.env.OPENAI_API_KEY
      ? {
          apiKey: process.env.OPENAI_API_KEY,
        }
      : undefined,
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama2',
    },
  },
  storage: {
    type: 'minio',
    region: process.env.MINIO_REGION || 'us-east-1',
    endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'agent-fleet',
  },
}

export default config
