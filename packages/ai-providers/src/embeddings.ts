import OpenAI from 'openai'

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>
  generateEmbeddings(texts: string[]): Promise<number[][]>
  similarity(embedding1: number[], embedding2: number[]): number
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model: string = 'text-embedding-3-small', baseURL?: string) {
    this.client = new OpenAI({ 
      apiKey,
      baseURL: baseURL || undefined
    })
    this.model = model
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text,
    })

    return response.data[0].embedding
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts,
    })

    return response.data.map(item => item.embedding)
  }

  // Cosine similarity
  similarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length')
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }
}

export class LocalEmbeddingProvider implements EmbeddingProvider {
  private apiUrl: string

  constructor(apiUrl: string = process.env.EMBEDDINGS_API_URL || 'http://localhost:5000/embeddings') {
    this.apiUrl = apiUrl
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    const data = await response.json()
    return data.embedding
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts }),
    })

    const data = await response.json()
    return data.embeddings
  }

  similarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length')
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }
}

