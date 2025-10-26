import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, AIGenerateOptions, AIGenerateResponse, AIModelConfig } from '../types'

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic'

  validateConfig(config: AIModelConfig): boolean {
    return !!(config.apiKey && config.model)
  }

  async testConnection(config: AIModelConfig): Promise<boolean> {
    try {
      const client = this.createClient(config)
      // Try a minimal request to test connection
      await client.messages.create({
        model: config.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      })
      return true
    } catch (error) {
      console.error('Anthropic connection test failed:', error)
      return false
    }
  }

  private createClient(config: AIModelConfig): Anthropic {
    return new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    })
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResponse> {
    const { messages, config, signal } = options

    try {
      const client = this.createClient(config)

      // Extract system message if present
      const systemMessage = messages.find(m => m.role === 'system')?.content || 
                           config.settings?.systemPrompt
      const conversationMessages = messages
        .filter(m => m.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      const response = await client.messages.create(
        {
          model: config.model,
          messages: conversationMessages,
          system: systemMessage,
          max_tokens: config.settings?.maxTokens ?? 4096,
          temperature: config.settings?.temperature ?? 0.7,
          top_p: config.settings?.topP ?? 1,
          top_k: config.settings?.topK,
          stop_sequences: config.settings?.stopSequences,
        },
        { signal }
      )

      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n')

      return {
        content,
        finishReason: this.mapFinishReason(response.stop_reason),
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        model: response.model,
        metadata: {
          id: response.id,
          role: response.role,
        }
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async *generateStream(options: AIGenerateOptions): AsyncGenerator<string, AIGenerateResponse> {
    const { messages, config, signal } = options

    try {
      const client = this.createClient(config)

      const systemMessage = messages.find(m => m.role === 'system')?.content || 
                           config.settings?.systemPrompt
      const conversationMessages = messages
        .filter(m => m.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      const stream = await client.messages.create(
        {
          model: config.model,
          messages: conversationMessages,
          system: systemMessage,
          max_tokens: config.settings?.maxTokens ?? 4096,
          temperature: config.settings?.temperature ?? 0.7,
          top_p: config.settings?.topP ?? 1,
          top_k: config.settings?.topK,
          stop_sequences: config.settings?.stopSequences,
          stream: true,
        },
        { signal }
      )

      let fullContent = ''
      let finishReason: string | null = 'end_turn'
      let modelName = config.model
      let usage: any = {}

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            const text = event.delta.text
            fullContent += text
            yield text
          }
        } else if (event.type === 'message_delta') {
          finishReason = event.delta.stop_reason || finishReason
          if (event.usage) {
            usage = event.usage
          }
        } else if (event.type === 'message_start') {
          modelName = event.message.model
        }
      }

      return {
        content: fullContent,
        finishReason: this.mapFinishReason(finishReason),
        usage: usage.output_tokens ? {
          promptTokens: usage.input_tokens || 0,
          completionTokens: usage.output_tokens || 0,
          totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
        } : undefined,
        model: modelName,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private mapFinishReason(reason: string | null): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'end_turn':
      case 'stop_sequence':
        return 'stop'
      case 'max_tokens':
        return 'length'
      default:
        return 'error'
    }
  }

  private handleError(error: any): Error {
    const message = error?.message || 'Unknown Anthropic error'
    const code = error?.status || 'UNKNOWN_ERROR'
    
    return new Error(`Anthropic Error [${code}]: ${message}`)
  }
}

