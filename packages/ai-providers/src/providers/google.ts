import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, AIGenerateOptions, AIGenerateResponse, AIModelConfig } from '../types'

export class GoogleProvider implements AIProvider {
  name = 'Google'

  validateConfig(config: AIModelConfig): boolean {
    return !!(config.apiKey && config.model)
  }

  async testConnection(config: AIModelConfig): Promise<boolean> {
    try {
      const client = this.createClient(config)
      const model = client.getGenerativeModel({ model: config.model })
      await model.generateContent('Hi')
      return true
    } catch (error) {
      console.error('Google AI connection test failed:', error)
      return false
    }
  }

  private createClient(config: AIModelConfig): GoogleGenerativeAI {
    return new GoogleGenerativeAI(config.apiKey!)
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResponse> {
    const { messages, config, signal } = options

    try {
      const client = this.createClient(config)
      const model = client.getGenerativeModel({ 
        model: config.model,
        generationConfig: {
          temperature: config.settings?.temperature ?? 0.7,
          maxOutputTokens: config.settings?.maxTokens ?? 2048,
          topP: config.settings?.topP ?? 1,
          topK: config.settings?.topK,
          stopSequences: config.settings?.stopSequences,
        },
      })

      // Convert messages to Google AI format
      const history = messages
        .slice(0, -1)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }))

      const lastMessage = messages[messages.length - 1]

      const chat = model.startChat({
        history,
        generationConfig: model.generationConfig,
      })

      const result = await chat.sendMessage(lastMessage.content)
      const response: any = result.response as any
      
      return {
        content: response.text(),
        finishReason: this.mapFinishReason(response.candidates?.[0]?.finishReason),
        usage: (response as any).usageMetadata ? {
          promptTokens: (response as any).usageMetadata.promptTokenCount || 0,
          completionTokens: (response as any).usageMetadata.candidatesTokenCount || 0,
          totalTokens: (response as any).usageMetadata.totalTokenCount || 0,
        } : undefined,
        model: config.model,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async *generateStream(options: AIGenerateOptions): AsyncGenerator<string, AIGenerateResponse> {
    const { messages, config, signal } = options

    try {
      const client = this.createClient(config)
      const model = client.getGenerativeModel({ 
        model: config.model,
        generationConfig: {
          temperature: config.settings?.temperature ?? 0.7,
          maxOutputTokens: config.settings?.maxTokens ?? 2048,
          topP: config.settings?.topP ?? 1,
          topK: config.settings?.topK,
          stopSequences: config.settings?.stopSequences,
        },
      })

      const history = messages
        .slice(0, -1)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }))

      const lastMessage = messages[messages.length - 1]

      const chat = model.startChat({
        history,
        generationConfig: model.generationConfig,
      })

      const result: any = await chat.sendMessageStream(lastMessage.content)

      let fullContent = ''
      let finishReason: any = 'STOP'
      let usage: any = undefined

      for await (const chunk of result.stream) {
        const text = chunk.text()
        fullContent += text
        yield text

        if (chunk.candidates?.[0]?.finishReason) {
          finishReason = chunk.candidates[0].finishReason
        }
      }

      const finalResponse: any = await result.response
      if ((finalResponse as any).usageMetadata) {
        usage = {
          promptTokens: (finalResponse as any).usageMetadata.promptTokenCount || 0,
          completionTokens: (finalResponse as any).usageMetadata.candidatesTokenCount || 0,
          totalTokens: (finalResponse as any).usageMetadata.totalTokenCount || 0,
        }
      }

      return {
        content: fullContent,
        finishReason: this.mapFinishReason(finishReason),
        usage,
        model: config.model,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private mapFinishReason(reason: any): 'stop' | 'length' | 'content_filter' | 'error' {
    const reasonStr = String(reason).toUpperCase()
    switch (reasonStr) {
      case 'STOP':
        return 'stop'
      case 'MAX_TOKENS':
        return 'length'
      case 'SAFETY':
      case 'RECITATION':
        return 'content_filter'
      default:
        return 'error'
    }
  }

  private handleError(error: any): Error {
    const message = error?.message || 'Unknown Google AI error'
    
    return new Error(`Google AI Error: ${message}`)
  }
}

