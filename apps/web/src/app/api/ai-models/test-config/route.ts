import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIProviderFactory } from '@sillytavern-clone/ai-providers'
import type { AIModelConfig, AIMessage } from '@sillytavern-clone/ai-providers'

const testConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google']),
  model: z.string().min(1),
  apiKey: z.string().min(1).optional(),
  baseUrl: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
  testMessage: z.string().min(1).max(500).default('Hello! Please respond with a simple greeting.'),
})

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const body = await request.json()
    const validated = testConfigSchema.parse(body)

    const config: AIModelConfig = {
      provider: validated.provider as any,
      model: validated.model,
      apiKey: validated.apiKey,
      baseUrl: validated.baseUrl,
      settings: validated.settings || {},
    }

    const provider = AIProviderFactory.getProvider(config)

    const messages: AIMessage[] = [
      { role: 'user', content: validated.testMessage }
    ]

    const response = await provider.generate({ messages, config })

    const latency = Date.now() - startedAt
    return NextResponse.json({
      success: true,
      response: response.content,
      usage: response.usage || null,
      latency,
    })

  } catch (error) {
    const latency = Date.now() - startedAt
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors, latency },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error', latency },
      { status: 500 }
    )
  }
}


