export * from './types'
export * from './providers/openai'
export * from './providers/anthropic'
export * from './providers/google'

import type { AIProvider, AIModelConfig } from './types'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { GoogleProvider } from './providers/google'

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map<string, AIProvider>([
    ['openai', new OpenAIProvider() as AIProvider],
    ['anthropic', new AnthropicProvider() as AIProvider],
    ['google', new GoogleProvider() as AIProvider],
  ])

  static getProvider(config: AIModelConfig): AIProvider {
    const provider = this.providers.get(config.provider)
    
    if (!provider) {
      throw new Error(`Unsupported AI provider: ${config.provider}`)
    }

    if (!provider.validateConfig(config)) {
      throw new Error(`Invalid configuration for provider: ${config.provider}`)
    }

    return provider
  }

  static registerProvider(name: string, provider: AIProvider): void {
    this.providers.set(name, provider)
  }

  static listProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}

