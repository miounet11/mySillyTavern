/**
 * 聊天自动总结服务
 * 每 N 条消息自动生成摘要，用于长期上下文压缩
 */

import { db } from '@sillytavern-clone/database'
import { AIProviderFactory } from '@sillytavern-clone/ai-providers'
import { nanoid } from 'nanoid'
import type { Message } from '@prisma/client'

export class ChatSummaryService {
  /**
   * 每 N 条消息自动生成总结
   */
  async autoSummarize(
    chatId: string,
    summaryInterval: number = 50
  ): Promise<void> {
    const messageCount = await db.count('Message', { where: { chatId } })
    
    // 检查是否需要新总结
    const lastSummary = await db.findFirst('ChatSummary', {
      where: { chatId },
      orderBy: { toMessage: 'desc' }
    })
    
    const lastSummarizedMessage = lastSummary?.toMessage || 0
    
    if (messageCount - lastSummarizedMessage >= summaryInterval) {
      // 生成新总结
      const fromMessage = lastSummarizedMessage + 1
      const toMessage = messageCount
      
      const messages = await db.findMany('Message', {
        where: { chatId },
        skip: fromMessage - 1,
        take: summaryInterval,
        orderBy: { timestamp: 'asc' }
      })
      
      if (messages.length === 0) return
      
      try {
        const summary = await this.generateSummary(messages)
        
        await db.create('ChatSummary', {
          data: {
            id: nanoid(),
            chatId,
            fromMessage,
            toMessage,
            summary
          }
        })
        
        console.log(`Generated summary for chat ${chatId}: messages ${fromMessage}-${toMessage}`)
      } catch (error) {
        console.error('Failed to generate summary:', error)
      }
    }
  }
  
  /**
   * 使用 AI 生成对话总结
   */
  private async generateSummary(messages: Message[]): Promise<string> {
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')
    
    // 检查是否有可用的 API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // Fallback 到简单统计
      return this.generateSimpleSummary(messages)
    }
    
    try {
      const provider = AIProviderFactory.getProvider({
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: apiKey,
        settings: { temperature: 0.3, maxTokens: 200 }
      })
      
      const response = await provider.generate({
        messages: [
          {
            role: 'system',
            content: 'Summarize the following conversation in 2-3 sentences, capturing key events and character states.'
          },
          {
            role: 'user',
            content: conversationText
          }
        ],
        config: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          apiKey: apiKey
        }
      })
      
      return response.content
    } catch (error) {
      console.warn('AI summary generation failed, using simple summary:', error)
      return this.generateSimpleSummary(messages)
    }
  }
  
  /**
   * 简单统计型总结（fallback）
   */
  private generateSimpleSummary(messages: Message[]): string {
    const userCount = messages.filter(m => m.role === 'user').length
    const assistantCount = messages.filter(m => m.role === 'assistant').length
    const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0)
    const avgLength = Math.round(totalLength / messages.length)
    
    return `${messages.length} messages exchanged (${userCount} user, ${assistantCount} assistant), average length: ${avgLength} characters`
  }
  
  /**
   * 获取所有总结（用于上下文注入）
   */
  async getAllSummaries(chatId: string): Promise<string> {
    const summaries = await db.findMany('ChatSummary', {
      where: { chatId },
      orderBy: { fromMessage: 'asc' }
    })
    
    if (summaries.length === 0) return ''
    
    return summaries
      .map((s: any) => `[Messages ${s.fromMessage}-${s.toMessage}]: ${s.summary}`)
      .join('\n')
  }
  
  /**
   * 获取指定范围的总结
   */
  async getSummaryForRange(
    chatId: string,
    fromMessage: number,
    toMessage: number
  ): Promise<string | null> {
    const summaries = await db.findMany('ChatSummary', {
      where: {
        chatId,
        fromMessage: { gte: fromMessage },
        toMessage: { lte: toMessage }
      },
      orderBy: { fromMessage: 'asc' }
    })
    
    if (summaries.length === 0) return null
    
    return summaries.map((s: any) => s.summary).join(' ')
  }
}

