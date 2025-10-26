import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '../route'
import { db } from '@sillytavern-clone/database'
import { AIProviderFactory } from '@sillytavern-clone/ai-providers'

vi.mock('@sillytavern-clone/database')
vi.mock('@sillytavern-clone/ai-providers')
vi.mock('nanoid', () => ({
  nanoid: () => 'test-id'
}))

describe('Generate API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate AI response', async () => {
    const mockChat = {
      id: 'chat-1',
      characterId: 'char-1',
      character: {
        personality: 'Friendly',
        background: 'Test background',
        settings: '{}',
      },
      messages: [],
      settings: '{}',
    }

    const mockModel = {
      id: 'model-1',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: 'test-key',
      settings: '{}',
    }

    const mockProvider = {
      generate: vi.fn().mockResolvedValue({
        content: 'Test response',
        finishReason: 'stop',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      }),
    }

    vi.mocked(db.findUnique).mockImplementation(async (model: string, query: any) => {
      if (model === 'Chat') return mockChat
      if (model === 'AIModelConfig') return mockModel
      return null
    })

    vi.mocked(db.findFirst).mockResolvedValue(mockModel)
    vi.mocked(db.create).mockResolvedValue({ id: 'test-id' })
    vi.mocked(db.findMany).mockResolvedValue([])
    vi.mocked(AIProviderFactory.getProvider).mockReturnValue(mockProvider as any)

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        chatId: 'chat-1',
        message: 'Hello',
        stream: false,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.content).toBe('Test response')
    expect(mockProvider.generate).toHaveBeenCalled()
  })

  it('should return error if chat not found', async () => {
    vi.mocked(db.findUnique).mockResolvedValue(null)

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        chatId: 'nonexistent',
        message: 'Hello',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.code).toBe('NOT_FOUND')
  })
})

