import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { AIProviderFactory } from '@sillytavern-clone/ai-providers'
import type { AIMessage, AIModelConfig } from '@sillytavern-clone/ai-providers'
import { nanoid } from 'nanoid'

const generateSchema = z.object({
  chatId: z.string(),
  message: z.string().min(1).max(50000),
  stream: z.boolean().default(true), // 默认启用流式
  modelId: z.string().optional(),
  clientModel: z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string().optional(),
    baseUrl: z.string().optional(),
    settings: z.any().optional(),
  }).optional(),
})

// Helper to inject world info into context
async function injectWorldInfo(
  messages: AIMessage[],
  characterId: string,
  currentMessage: string
): Promise<AIMessage[]> {
  // Get active world info for this character
  const worldInfos = await db.findMany('WorldInfo', {
    where: {
      enabled: true,
      characters: {
        some: { characterId }
      }
    },
    orderBy: { priority: 'desc' }
  })

  if (worldInfos.length === 0) {
    return messages
  }

  // Filter world info by keyword activation
  const activeWorldInfo = worldInfos.filter((info: any) => {
    if (info.activationType === 'always') return true
    
    if (info.activationType === 'keyword') {
      const keywords = info.keywords ? JSON.parse(info.keywords) : []
      return keywords.some((keyword: string) => 
        currentMessage.toLowerCase().includes(keyword.toLowerCase())
      )
    }
    
    return false
  })

  if (activeWorldInfo.length === 0) {
    return messages
  }

  // Inject world info into system message
  const worldInfoContent = activeWorldInfo
    .map((info: any) => `[${info.name}]\n${info.content}`)
    .join('\n\n')

  const systemMessage = messages.find(m => m.role === 'system')
  
  if (systemMessage) {
    systemMessage.content = `${systemMessage.content}\n\n=== World Information ===\n${worldInfoContent}`
  } else {
    messages.unshift({
      role: 'system',
      content: `=== World Information ===\n${worldInfoContent}`
    })
  }

  return messages
}

export async function POST(request: NextRequest) {
  try {
    const greetEnabled = process.env.ST_PARITY_GREETING_ENABLED !== 'false'
    const body = await request.json()
    const validatedData = generateSchema.parse(body)

    // Get chat and character
    const chat = await db.findUnique('Chat', {
      id: validatedData.chatId,
      include: {
        character: true,
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 50, // Last 50 messages for context
        }
      }
    })

    if (!chat) {
      return new Response(
        JSON.stringify({ error: 'Chat not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build conversation history
    const conversationMessages: AIMessage[] = []

    // Add system prompt (author's note)
    const chatSettings = chat.settings ? JSON.parse(chat.settings) : {}
    const characterSettings = chat.character.settings ? JSON.parse(chat.character.settings) : {}
    
    // 1. System prompt (if exists)
    const systemPrompt = chat.character.systemPrompt ||
                        chatSettings.systemPrompt || 
                        characterSettings.systemPrompt

    if (systemPrompt) {
      conversationMessages.push({
        role: 'system',
        content: systemPrompt
      })
    }

    // 2. Character description (CRITICAL - most important field)
    if (chat.character.description) {
      conversationMessages.push({
        role: 'system',
        content: `Character Description:\n${chat.character.description}`
      })
    }

    // 3. Creator notes (author's guidance)
    if (chat.character.creatorNotes) {
      conversationMessages.push({
        role: 'system',
        content: `Creator Notes:\n${chat.character.creatorNotes}`
      })
    }

    // 4. Scenario/Background
    if (chat.character.scenario || chat.character.background) {
      conversationMessages.push({
        role: 'system',
        content: `Scenario: ${chat.character.scenario || chat.character.background}`
      })
    }

    // 5. Character personality
    if (chat.character.personality) {
      conversationMessages.push({
        role: 'system',
        content: `Character Personality: ${chat.character.personality}`
      })
    }

    // Add example dialogues (few-shot) from mesExample or structured exampleMessages
    const exampleMessagesRaw = chat.character.mesExample || chat.character.exampleMessages
    let examples: Array<{ user: string; assistant: string }> = []
    try {
      if (typeof exampleMessagesRaw === 'string' && exampleMessagesRaw.trim()) {
        // mesExample stored string: keep as system examples
        const lines = exampleMessagesRaw.split('\n').filter((l: string) => l.trim())
        for (let i = 0; i < lines.length; i += 2) {
          const u = lines[i]
          const a = lines[i + 1]
          if (u && a) {
            examples.push({
              user: u.replace(/^<USER>:?\s*/i, '').trim(),
              assistant: a.replace(/^<BOT>:?\s*/i, '').trim(),
            })
          }
        }
      } else if (Array.isArray(exampleMessagesRaw)) {
        examples = exampleMessagesRaw.map((m: any) => ({ user: m.user, assistant: m.assistant }))
      } else if (typeof chat.character.exampleMessages === 'string') {
        examples = JSON.parse(chat.character.exampleMessages || '[]')
      }
    } catch {}

    if (examples.length > 0) {
      for (const ex of examples) {
        conversationMessages.push({ role: 'user', content: ex.user })
        conversationMessages.push({ role: 'assistant', content: ex.assistant })
      }
    }

    // Add conversation history
    for (const msg of chat.messages || []) {
      conversationMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined
      })
    }

    // Post-history instructions (added after conversation history)
    if (chat.character.postHistoryInstructions) {
      conversationMessages.push({
        role: 'system',
        content: chat.character.postHistoryInstructions
      })
    }

    // Add user message
    conversationMessages.push({
      role: 'user',
      content: validatedData.message
    })

    // Inject world info
    const messagesWithWorldInfo = await injectWorldInfo(
      conversationMessages,
      chat.characterId,
      validatedData.message
    )

    // Save user message
    const userMessage = await db.create('Message', {
      id: nanoid(),
      chatId: chat.id,
      role: 'user',
      content: validatedData.message,
      metadata: JSON.stringify({})
    })

    // Prepare AI config - 优先使用客户端传递的模型配置（本地存储）
    let aiConfig: AIModelConfig
    let modelConfig: any = null // 用于非流式响应的 metadata

    if (validatedData.clientModel) {
      // 使用客户端本地配置
      console.log('[Generate API] Using client-side model config:', {
        provider: validatedData.clientModel.provider,
        model: validatedData.clientModel.model
      })
      
      aiConfig = {
        provider: validatedData.clientModel.provider as any,
        model: validatedData.clientModel.model,
        apiKey: validatedData.clientModel.apiKey,
        baseUrl: validatedData.clientModel.baseUrl,
        settings: validatedData.clientModel.settings || {}
      }
    } else {
      // 降级：使用服务器端模型配置
      console.log('[Generate API] Falling back to server-side model config')
      
      let modelId = validatedData.modelId
      
      if (!modelId) {
        const activeModel = await db.findFirst('AIModelConfig', {
          where: { isActive: true }
        })
        
        if (!activeModel) {
          return new Response(
            JSON.stringify({ error: 'No active AI model configured', code: 'NO_MODEL' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        
        modelId = activeModel.id
      }

      modelConfig = await db.findUnique('AIModelConfig', { id: modelId })
      
      if (!modelConfig) {
        return new Response(
          JSON.stringify({ error: 'AI model not found', code: 'MODEL_NOT_FOUND' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const modelSettings = modelConfig.settings ? JSON.parse(modelConfig.settings) : {}
      
      aiConfig = {
        provider: modelConfig.provider as any,
        model: modelConfig.model,
        apiKey: modelConfig.apiKey || undefined,
        baseUrl: modelConfig.baseUrl || undefined,
        settings: {
          ...modelSettings,
          ...chatSettings,
        }
      }
    }

    // Get AI provider
    const provider = AIProviderFactory.getProvider(aiConfig)

    // Handle streaming vs non-streaming
    if (validatedData.stream) {
      // Streaming response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let fullContent = ''
            
            for await (const chunk of provider.generateStream({
              messages: messagesWithWorldInfo,
              config: aiConfig,
            })) {
              fullContent += chunk
              // 修正：发送 content 和 fullContent
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                content: chunk,
                fullContent: fullContent 
              })}\n\n`))
            }

            // Save assistant message
            const assistantMessage = await db.create('Message', {
              id: nanoid(),
              chatId: chat.id,
              role: 'assistant',
              content: fullContent,
              metadata: JSON.stringify({ 
                modelId: validatedData.clientModel ? 'client-local' : modelConfig?.id,
                model: aiConfig.model,
                provider: aiConfig.provider
              })
            })

            // 修正：发送完整的 message 对象
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              done: true, 
              message: assistantMessage
            })}\n\n`))
            
            controller.close()
          } catch (error) {
            console.error('Streaming generation error:', error)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Generation failed' 
            })}\n\n`))
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Non-streaming response
      const response = await provider.generate({
        messages: messagesWithWorldInfo,
        config: aiConfig,
      })

      // Save assistant message
      const assistantMessage = await db.create('Message', {
        id: nanoid(),
        chatId: chat.id,
        role: 'assistant',
        content: response.content,
        metadata: JSON.stringify({
          modelId: validatedData.clientModel ? 'client-local' : modelConfig?.id,
          model: aiConfig.model,
          provider: aiConfig.provider,
          usage: response.usage,
          finishReason: response.finishReason,
        })
      })

      // Update chat timestamp
      await db.update('Chat', { id: chat.id }, { updatedAt: new Date() })

      return new Response(
        JSON.stringify({
          messageId: assistantMessage.id,
          content: response.content,
          usage: response.usage,
          finishReason: response.finishReason,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.error('Error generating response:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

