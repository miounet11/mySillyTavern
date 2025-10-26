import { db } from '@sillytavern-clone/database'
import { OpenAIEmbeddingProvider } from '@sillytavern-clone/ai-providers/dist/embeddings'
import { nanoid } from 'nanoid'

export class VectorSearch {
  private embeddingProvider: OpenAIEmbeddingProvider | null = null

  async initialize(apiKey: string): Promise<void> {
    this.embeddingProvider = new OpenAIEmbeddingProvider(apiKey)
  }

  /**
   * Generate embedding for world info entry
   */
  async generateEmbedding(worldInfoId: string, text: string): Promise<void> {
    if (!this.embeddingProvider) {
      throw new Error('Embedding provider not initialized')
    }

    const embedding = await this.embeddingProvider.generateEmbedding(text)

    // Store embedding in database
    await db.create('WorldInfoVector', {
      id: nanoid(),
      worldInfoId,
      embedding: JSON.stringify(embedding),
      text,
    })
  }

  /**
   * Search world info by semantic similarity
   */
  async search(
    query: string,
    characterId?: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<any[]> {
    if (!this.embeddingProvider) {
      throw new Error('Embedding provider not initialized')
    }

    // Generate query embedding
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query)

    // Get all world info vectors
    const where: any = {}
    
    if (characterId) {
      where.worldInfo = {
        characters: {
          some: { characterId }
        }
      }
    }

    const vectors = await db.findMany('WorldInfoVector', {
      where,
      include: {
        worldInfo: true
      }
    })

    // Calculate similarities
    const results = (vectors as any[])
      .map((vector: any) => {
        const embedding = JSON.parse(vector.embedding)
        const similarity = this.embeddingProvider!.similarity(queryEmbedding, embedding)
        
        return {
          worldInfo: vector.worldInfo,
          vector,
          similarity: Number(similarity),
        }
      })
      .filter((result: { similarity: number }) => result.similarity >= threshold)
      .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity)
      .slice(0, limit)

    return results
  }

  /**
   * Update embeddings for all world info entries
   */
  async updateAllEmbeddings(): Promise<number> {
    if (!this.embeddingProvider) {
      throw new Error('Embedding provider not initialized')
    }

    const worldInfos = await db.findMany('WorldInfo', {
      where: { enabled: true }
    })

    let updated = 0

    for (const info of worldInfos as any[]) {
      try {
        // Delete existing vectors
        await db.deleteMany('WorldInfoVector', {
          where: { worldInfoId: (info as any).id }
        })

        // Generate new embedding
        await this.generateEmbedding((info as any).id, (info as any).content)
        updated++
      } catch (error) {
        console.error(`Failed to generate embedding for world info ${(info as any).id}:`, error)
      }
    }

    return updated
  }
}

// Singleton instance
let vectorSearchInstance: VectorSearch | null = null

export function getVectorSearch(): VectorSearch {
  if (!vectorSearchInstance) {
    vectorSearchInstance = new VectorSearch()
  }
  return vectorSearchInstance
}

