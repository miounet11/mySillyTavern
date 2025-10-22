import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { AIModelConfig } from '@sillytavern-clone/shared'
import { nanoid } from 'nanoid'

const createModelSchema = z.object({
  name: z.string().min(1).max(50),
  provider: z.enum(['openai', 'anthropic', 'google', 'local', 'custom']),
  model: z.string().min(1).max(100),
  apiKey: z.string().min(1).max(500),
  baseUrl: z.string().url().optional(),
  settings: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(32000).optional(),
    topP: z.number().min(0).max(1).optional(),
    topK: z.number().min(1).max(100).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
    stopSequences: z.array(z.string()).optional(),
    systemPrompt: z.string().optional(),
    contextWindow: z.number().min(1).max(200000).optional(),
  }).optional(),
  isActive: z.boolean().default(false),
})

const querySchema = z.object({
  provider: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const offset = (query.page - 1) * query.limit

    // Build where clause
    const where: any = {}

    if (query.provider) {
      where.provider = query.provider
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive
    }

    // Get models with pagination
    const [models, total] = await Promise.all([
      db.findMany('AIModelConfig', {
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: query.limit,
      }),
      db.count('AIModelConfig', { where })
    ])

    // Parse JSON fields
    const parsedModels = models.map(model => ({
      ...model,
      settings: model.settings ? JSON.parse(model.settings as string) : {},
      isActive: model.isActive || false,
    }))

    const totalPages = Math.ceil(total / query.limit)

    return NextResponse.json({
      models: parsedModels,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      }
    })

  } catch (error) {
    console.error('Error fetching AI models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI models', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createModelSchema.parse(body)

    // If this model is set as active, deactivate all other models
    if (validatedData.isActive) {
      await db.updateMany('AIModelConfig', {
        data: { isActive: false },
        where: {}
      })
    }

    // Create AI model configuration
    const model = await db.create('AIModelConfig', {
      id: nanoid(),
      name: validatedData.name,
      provider: validatedData.provider,
      model: validatedData.model,
      apiKey: validatedData.apiKey,
      baseUrl: validatedData.baseUrl,
      settings: JSON.stringify(validatedData.settings || {}),
      isActive: validatedData.isActive,
    })

    // Return created model with parsed fields
    const parsedModel = {
      ...model,
      settings: model.settings ? JSON.parse(model.settings as string) : {},
      isActive: model.isActive || false,
    }

    return NextResponse.json(parsedModel, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error creating AI model:', error)
    return NextResponse.json(
      { error: 'Failed to create AI model', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}