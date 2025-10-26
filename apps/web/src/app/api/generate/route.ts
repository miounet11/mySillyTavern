import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { AIProviderFactory } from '@sillytavern-clone/ai-providers'
import type { AIMessage, AIModelConfig } from '@sillytavern-clone/ai-providers'
import { nanoid } from 'nanoid'

const generateSchema = z.object({
  chatId: z.string(),
  message: z.string().min(1).max(50000),
  stream: z.boolean().default(false),
  modelId: z.string().optional(),
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

    // Get AI model config
    let modelId = validatedData.modelId
    
    if (!modelId) {
      // Get active model
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

    const modelConfig = await db.findUnique('AIModelConfig', { id: modelId })
    
    if (!modelConfig) {
      return new Response(
        JSON.stringify({ error: 'AI model not found', code: 'MODEL_NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build conversation history
    const conversationMessages: AIMessage[] = []

    // Add system prompt
    const chatSettings = chat.settings ? JSON.parse(chat.settings) : {}
    const characterSettings = chat.character.settings ? JSON.parse(chat.character.settings) : {}
    const modelSettings = modelConfig.settings ? JSON.parse(modelConfig.settings) : {}
    
    const systemPrompt = chatSettings.systemPrompt || 
                        characterSettings.systemPrompt || 
                        modelSettings.systemPrompt

    if (systemPrompt) {
      conversationMessages.push({
        role: 'system',
        content: systemPrompt
      })
    }

    // Add character personality
    if (chat.character.personality) {
      conversationMessages.push({
        role: 'system',
        content: `Character Personality: ${chat.character.personality}`
      })
    }

    // Add scenario/background
    if (chat.character.background) {
      conversationMessages.push({
        role: 'system',
        content: `Scenario: ${chat.character.background}`
      })
    }

    // Add conversation history
    for (const msg of chat.messages || []) {
      conversationMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined
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

    // Prepare AI config
    const aiConfig: AIModelConfig = {
      provider: modelConfig.provider as any,
      model: modelConfig.model,
      apiKey: modelConfig.apiKey || undefined,
      baseUrl: modelConfig.baseUrl || undefined,
      settings: {
        ...modelSettings,
        ...chatSettings,
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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
            }

            // Save assistant message
            const assistantMessage = await db.create('Message', {
              id: nanoid(),
              chatId: chat.id,
              role: 'assistant',
              content: fullContent,
              metadata: JSON.stringify({ modelId: modelConfig.id })
            })

            // Send completion event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              done: true, 
              messageId: assistantMessage.id 
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
          modelId: modelConfig.id,
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

