import OpenAI from 'openai'
import type { AIProvider, AIGenerateOptions, AIGenerateResponse, AIModelConfig, AIProviderError } from '../types'

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI'

  validateConfig(config: AIModelConfig): boolean {
    return !!(config.apiKey && config.model)
  }

  async testConnection(config: AIModelConfig): Promise<boolean> {
    try {
      const client = this.createClient(config)
      await client.models.retrieve(config.model)
      return true
    } catch (error) {
      console.error('OpenAI connection test failed:', error)
      return false
    }
  }

  private createClient(config: AIModelConfig): OpenAI {
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    })
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResponse> {
    const { messages, config, signal } = options

    try {
      const client = this.createClient(config)

      const response = await client.chat.completions.create(
        {
          model: config.model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: config.settings?.temperature ?? 0.7,
          max_tokens: config.settings?.maxTokens ?? 2000,
          top_p: config.settings?.topP ?? 1,
          frequency_penalty: config.settings?.frequencyPenalty ?? 0,
          presence_penalty: config.settings?.presencePenalty ?? 0,
          stop: config.settings?.stopSequences,
        },
        { signal }
      )

      const choice = response.choices[0]
      
      return {
        content: choice.message.content || '',
        finishReason: this.mapFinishReason(choice.finish_reason),
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
        metadata: {
          id: response.id,
          created: response.created,
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

      const stream = await client.chat.completions.create(
        {
          model: config.model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: config.settings?.temperature ?? 0.7,
          max_tokens: config.settings?.maxTokens ?? 2000,
          top_p: config.settings?.topP ?? 1,
          frequency_penalty: config.settings?.frequencyPenalty ?? 0,
          presence_penalty: config.settings?.presencePenalty ?? 0,
          stop: config.settings?.stopSequences,
          stream: true,
        },
        { signal }
      )

      let fullContent = ''
      let finishReason: any = 'stop'
      let modelName = config.model

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta
        const content = delta?.content || ''
        
        if (content) {
          fullContent += content
          yield content
        }

        if (chunk.choices[0]?.finish_reason) {
          finishReason = chunk.choices[0].finish_reason
        }

        if (chunk.model) {
          modelName = chunk.model
        }
      }

      return {
        content: fullContent,
        finishReason: this.mapFinishReason(finishReason),
        model: modelName,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private mapFinishReason(reason: string | null): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop'
      case 'length':
        return 'length'
      case 'content_filter':
        return 'content_filter'
      default:
        return 'error'
    }
  }

  private handleError(error: any): Error {
    const message = error?.message || 'Unknown OpenAI error'
    const code = error?.code || 'UNKNOWN_ERROR'
    
    return new Error(`OpenAI Error [${code}]: ${message}`)
  }
}

