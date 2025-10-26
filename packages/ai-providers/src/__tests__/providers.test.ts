import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpenAIProvider } from '../providers/openai'
import { AnthropicProvider } from '../providers/anthropic'
import { AIProviderFactory } from '../index'
import type { AIModelConfig } from '../types'

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider

  beforeEach(() => {
    provider = new OpenAIProvider()
  })

  it('should validate config correctly', () => {
    const validConfig: AIModelConfig = {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: 'test-key',
    }

    const invalidConfig: AIModelConfig = {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      // Missing apiKey
    }

    expect(provider.validateConfig(validConfig)).toBe(true)
    expect(provider.validateConfig(invalidConfig)).toBe(false)
  })
})

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider

  beforeEach(() => {
    provider = new AnthropicProvider()
  })

  it('should validate config correctly', () => {
    const validConfig: AIModelConfig = {
      provider: 'anthropic',
      model: 'claude-3-opus',
      apiKey: 'test-key',
    }

    expect(provider.validateConfig(validConfig)).toBe(true)
  })
})

describe('AIProviderFactory', () => {
  it('should get correct provider', () => {
    const openaiConfig: AIModelConfig = {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: 'test-key',
    }

    const provider = AIProviderFactory.getProvider(openaiConfig)
    expect(provider.name).toBe('OpenAI')
  })

  it('should throw error for unsupported provider', () => {
    const invalidConfig: AIModelConfig = {
      provider: 'unsupported' as any,
      model: 'test',
      apiKey: 'test',
    }

    expect(() => AIProviderFactory.getProvider(invalidConfig)).toThrow()
  })

  it('should list available providers', () => {
    const providers = AIProviderFactory.listProviders()
    expect(providers).toContain('openai')
    expect(providers).toContain('anthropic')
    expect(providers).toContain('google')
  })
})

