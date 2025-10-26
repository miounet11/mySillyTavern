export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  metadata?: Record<string, any>
}

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'custom'
  model: string
  apiKey?: string
  baseUrl?: string
  settings?: {
    temperature?: number
    maxTokens?: number
    topP?: number
    topK?: number
    frequencyPenalty?: number
    presencePenalty?: number
    stopSequences?: string[]
    systemPrompt?: string
  }
}

export interface AIGenerateOptions {
  messages: AIMessage[]
  config: AIModelConfig
  stream?: boolean
  onChunk?: (chunk: string) => void
  signal?: AbortSignal
}

export interface AIGenerateResponse {
  content: string
  finishReason: 'stop' | 'length' | 'content_filter' | 'error'
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  metadata?: Record<string, any>
}

export interface AIProvider {
  name: string
  generate(options: AIGenerateOptions): Promise<AIGenerateResponse>
  generateStream(options: AIGenerateOptions): AsyncGenerator<string, AIGenerateResponse>
  validateConfig(config: AIModelConfig): boolean
  testConnection(config: AIModelConfig): Promise<boolean>
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

