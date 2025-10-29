import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { AIProviderFactory } from '@sillytavern-clone/ai-providers'
import type { AIMessage, AIModelConfig } from '@sillytavern-clone/ai-providers'
import { nanoid } from 'nanoid'
import { getUserIdFromCookie } from '@/lib/auth/cookies'
import { ensureUser } from '@/lib/auth/userManager'
import { WorldInfoActivationEngine } from '@/lib/worldinfo/activationEngine'
import { ContextBuilder } from '@/lib/context/contextBuilder'
import { WorldInfoEmbeddingService } from '@/lib/worldinfo/embeddingService'
import { ChatSummaryService } from '@/lib/chat/summaryService'

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

// 上下文持久化系统配置（从环境变量读取）
const CONTEXT_CONFIG = {
  maxRecursiveDepth: parseInt(process.env.WORLDINFO_MAX_RECURSIVE_DEPTH || '2'),
  vectorThreshold: parseFloat(process.env.WORLDINFO_DEFAULT_VECTOR_THRESHOLD || '0.7'),
  maxContextTokens: parseInt(process.env.CONTEXT_MAX_TOKENS || '8000'),
  reserveTokens: parseInt(process.env.CONTEXT_RESERVE_TOKENS || '1000'),
  enableAutoSummary: process.env.CONTEXT_ENABLE_AUTO_SUMMARY === 'true',
  summaryInterval: parseInt(process.env.CONTEXT_SUMMARY_INTERVAL || '50')
}

export async function POST(request: NextRequest) {
  try {
    const greetEnabled = process.env.ST_PARITY_GREETING_ENABLED !== 'false'
    const body = await request.json()
    const validatedData = generateSchema.parse(body)
    // Ensure current user for scoping model ownership
    const userId = await getUserIdFromCookie()
    const user = await ensureUser(userId)

    // Get chat and character
    // 使用滑动窗口机制：只加载最近 N 条消息（从环境变量配置）
    const slidingWindowSize = parseInt(process.env.MESSAGE_SLIDING_WINDOW || '100')
    
    const chat = await db.findUnique('Chat', {
      id: validatedData.chatId,
      include: {
        character: true,
        messages: {
          orderBy: { timestamp: 'asc' },
          take: slidingWindowSize, // 滑动窗口：最近 N 条消息
        }
      }
    })
    
    console.log(`[Generate API] Loading ${slidingWindowSize} messages from sliding window`)

    if (!chat) {
      return new Response(
        JSON.stringify({ error: 'Chat not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ====================================
    // 第 1 步：准备 AI 配置
    // ====================================
    
    const chatSettings = chat.settings ? JSON.parse(chat.settings) : {}
    let aiConfig: AIModelConfig
    let modelConfig: any = null

    if (validatedData.clientModel) {
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
      const modelId = validatedData.modelId
      if (!modelId) {
        return new Response(
          JSON.stringify({ error: 'No model provided. Provide clientModel or modelId.', code: 'NO_MODEL' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      modelConfig = await db.findFirst('AIModelConfig', { where: { id: modelId, userId: user.id } })
      
      if (!modelConfig) {
        return new Response(
          JSON.stringify({ error: 'AI model not found or access denied', code: 'MODEL_NOT_FOUND' }),
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

    // ====================================
    // 第 2 步：智能上下文持久化系统
    // ====================================
    
    console.log('[Context System] Starting intelligent context building...')
    
    // 2.1 World Info 智能激活（替换简单匹配，带限流）
    const activationEngine = new WorldInfoActivationEngine()
    const activatedEntries = await activationEngine.activateEntries(
      chat.id,
      chat.characterId,
      validatedData.message,
      chat.messages,
      {
        enableRecursive: true,
        enableVector: true,
        maxRecursionDepth: CONTEXT_CONFIG.maxRecursiveDepth,
        vectorThreshold: CONTEXT_CONFIG.vectorThreshold,
        maxActivatedEntries: parseInt(process.env.WORLDINFO_MAX_ACTIVATED_ENTRIES || '15'),
        maxTotalTokens: parseInt(process.env.WORLDINFO_MAX_TOTAL_TOKENS || '20000'),
        model: aiConfig.model
      }
    )
    
    console.log(`[Context System] Activated ${activatedEntries.length} World Info entries`)
    
    // 2.2 智能上下文构建（替换手动拼接）
    const contextBuilder = new ContextBuilder()
    const messagesWithWorldInfo = await contextBuilder.buildContext(
      chat.character,
      chat.messages,
      activatedEntries,
      validatedData.message,
      {
        maxContextTokens: CONTEXT_CONFIG.maxContextTokens,
        reserveTokens: CONTEXT_CONFIG.reserveTokens,
        model: aiConfig.model,
        enableSummary: CONTEXT_CONFIG.enableAutoSummary
      }
    )
    
    console.log('[Context System] Context built successfully')

    // 2.3 保存用户消息
    const userMessage = await db.create('Message', {
      id: nanoid(),
      chatId: chat.id,
      role: 'user',
      content: validatedData.message,
      metadata: JSON.stringify({})
    })

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
                provider: aiConfig.provider,
                contextInfo: {
                  activatedWorldInfo: activatedEntries.length,
                  // 可添加更多上下文信息
                }
              })
            })

            // 后台任务：生成 embedding（不阻塞响应）
            if (process.env.WORLDINFO_AUTO_EMBEDDING === 'true') {
              const embeddingService = new WorldInfoEmbeddingService()
              embeddingService.embedChatMessage(assistantMessage.id)
                .catch(err => console.error('[Context System] Failed to generate message embedding:', err))
            }
            
            // 后台任务：检查是否需要自动总结
            if (CONTEXT_CONFIG.enableAutoSummary) {
              const summaryService = new ChatSummaryService()
              summaryService.autoSummarize(chat.id, CONTEXT_CONFIG.summaryInterval)
                .catch(err => console.error('[Context System] Failed to generate auto summary:', err))
            }

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
          contextInfo: {
            activatedWorldInfo: activatedEntries.length,
          }
        })
      })

      // 后台任务：生成 embedding（不阻塞响应）
      if (process.env.WORLDINFO_AUTO_EMBEDDING === 'true') {
        const embeddingService = new WorldInfoEmbeddingService()
        embeddingService.embedChatMessage(assistantMessage.id)
          .catch(err => console.error('[Context System] Failed to generate message embedding:', err))
      }
      
      // 后台任务：检查是否需要自动总结
      if (CONTEXT_CONFIG.enableAutoSummary) {
        const summaryService = new ChatSummaryService()
        summaryService.autoSummarize(chat.id, CONTEXT_CONFIG.summaryInterval)
          .catch(err => console.error('[Context System] Failed to generate auto summary:', err))
      }

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

