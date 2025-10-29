/**
 * 向量嵌入服务
 * 支持 World Info 和聊天消息的自动向量化
 */

import { OpenAIEmbeddingProvider } from '@sillytavern-clone/ai-providers/src/embeddings'
import { db } from '@sillytavern-clone/database'
import { nanoid } from 'nanoid'
import type { Message } from '@prisma/client'

export class WorldInfoEmbeddingService {
  private provider: OpenAIEmbeddingProvider | null = null
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    const baseURL = process.env.OPENAI_API_BASE
    const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'
    
    if (apiKey) {
      this.provider = new OpenAIEmbeddingProvider(apiKey, model, baseURL)
      console.log(`[Embedding Service] Initialized with model: ${model}${baseURL ? `, baseURL: ${baseURL}` : ''}`)
    } else {
      console.warn('OPENAI_API_KEY not set, embedding features will be disabled')
    }
  }
  
  /**
   * 生成单个 embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.provider) {
      throw new Error('Embedding provider not initialized')
    }
    return this.provider.generateEmbedding(text)
  }
  
  /**
   * 更新 World Info embedding
   */
  async updateWorldInfoEmbedding(worldInfoId: string): Promise<void> {
    if (!this.provider) {
      console.warn('Embedding provider not available, skipping')
      return
    }
    
    const entry = await db.findUnique('WorldInfo', { 
      where: { id: worldInfoId }
    })
    
    if (!entry) {
      console.warn(`WorldInfo ${worldInfoId} not found`)
      return
    }
    
    const embedding = await this.generateEmbedding(entry.content)
    
    // 使用 raw query 更新 vector 类型
    await db.$executeRaw`
      UPDATE "WorldInfo"
      SET "embeddingVector" = ${embedding}::vector
      WHERE id = ${worldInfoId}
    `
  }
  
  /**
   * 批量生成 embeddings
   */
  async batchGenerateEmbeddings(worldInfoIds: string[]): Promise<void> {
    if (!this.provider) {
      console.warn('Embedding provider not available, skipping batch generation')
      return
    }
    
    for (const id of worldInfoIds) {
      try {
        await this.updateWorldInfoEmbedding(id)
        // 添加延迟避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to generate embedding for ${id}:`, error)
      }
    }
  }
  
  /**
   * 为聊天消息生成 embedding
   */
  async embedChatMessage(messageId: string): Promise<void> {
    if (!this.provider) {
      return
    }
    
    const message = await db.findUnique('Message', { 
      where: { id: messageId }
    })
    
    if (!message) return
    
    const embedding = await this.generateEmbedding(message.content)
    
    await db.$executeRaw`
      INSERT INTO "ChatMessageEmbedding" (id, "messageId", "chatId", embedding)
      VALUES (${nanoid()}, ${messageId}, ${message.chatId}, ${embedding}::vector)
      ON CONFLICT ("messageId") DO UPDATE SET embedding = EXCLUDED.embedding
    `
  }
  
  /**
   * 向量相似度搜索历史消息
   */
  async searchSimilarMessages(
    chatId: string,
    query: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<Message[]> {
    if (!this.provider) {
      return []
    }
    
    const queryEmbedding = await this.generateEmbedding(query)
    
    const results = await db.$queryRaw<Array<{ messageId: string; similarity: number }>>`
      SELECT cme."messageId", 
             1 - (cme.embedding <=> ${queryEmbedding}::vector) as similarity
      FROM "ChatMessageEmbedding" cme
      WHERE cme."chatId" = ${chatId}
        AND (1 - (cme.embedding <=> ${queryEmbedding}::vector)) >= ${threshold}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `
    
    if (results.length === 0) return []
    
    const messageIds = results.map(r => r.messageId)
    return db.findMany('Message', {
      where: { id: { in: messageIds } },
      orderBy: { timestamp: 'asc' }
    })
  }
  
  /**
   * 向量相似度匹配单个 WorldInfo
   */
  async matchVector(
    entry: any, // WorldInfo
    query: string,
    threshold: number
  ): Promise<boolean> {
    if (!this.provider || !entry.embeddingVector) return false
    
    const queryEmbedding = await this.generateEmbedding(query)
    
    // pgvector 余弦相似度
    const result = await db.$queryRaw<[{ similarity: number }]>`
      SELECT 1 - ("embeddingVector" <=> ${queryEmbedding}::vector) as similarity
      FROM "WorldInfo"
      WHERE id = ${entry.id}
    `
    
    return result[0]?.similarity >= threshold
  }
}

