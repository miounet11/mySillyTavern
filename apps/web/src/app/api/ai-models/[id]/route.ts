import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { AIModelConfig } from '@sillytavern-clone/shared'
import { getUserIdFromCookie } from '@/lib/auth/cookies'
import { ensureUser } from '@/lib/auth/userManager'

const updateModelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  provider: z.enum(['openai', 'anthropic', 'google', 'local', 'custom', 'newapi']).optional(),
  model: z.string().min(1).max(100).optional(),
  apiKey: z.string().min(1).max(500).optional(),
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
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取或创建用户
    const userId = await getUserIdFromCookie()
    const user = await ensureUser(userId)

    const { id } = params

    const model = await db.findFirst('AIModelConfig', {
      where: { 
        id,
        userId: user.id
      }
    })

    if (!model) {
      return NextResponse.json(
        { error: 'AI model not found or access denied' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const parsedModel = {
      ...model,
      settings: model.settings ? JSON.parse(model.settings as string) : {},
      isActive: model.isActive || false,
    }

    return NextResponse.json(parsedModel)

  } catch (error) {
    console.error('Error fetching AI model:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI model', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function handleUpdate(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取或创建用户
    const userId = await getUserIdFromCookie()
    const user = await ensureUser(userId)

    const { id } = params
    const body = await request.json()
    const validatedData = updateModelSchema.parse(body)

    // Check if model exists and belongs to user
    const existingModel = await db.findFirst('AIModelConfig', {
      where: { 
        id,
        userId: user.id
      }
    })

    if (!existingModel) {
      return NextResponse.json(
        { error: 'AI model not found or access denied' },
        { status: 404 }
      )
    }

    // If this model is being set as active, deactivate all other models for this user
    if (validatedData.isActive === true) {
      await db.updateMany('AIModelConfig', { 
        userId: user.id,
        id: { not: id } 
      }, { isActive: false })
    }

    // Prepare update data
    const updateData: any = {}

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.provider !== undefined) updateData.provider = validatedData.provider
    if (validatedData.model !== undefined) updateData.model = validatedData.model
    if (validatedData.apiKey !== undefined) updateData.apiKey = validatedData.apiKey
    if (validatedData.baseUrl !== undefined) updateData.baseUrl = validatedData.baseUrl
    if (validatedData.settings !== undefined) {
      updateData.settings = JSON.stringify(validatedData.settings)
    }
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive

    updateData.updatedAt = new Date()

    // Update model
    const model = await db.update('AIModelConfig', id, updateData)

    // Return updated model with parsed fields
    const parsedModel = {
      ...model,
      settings: model.settings ? JSON.parse(model.settings as string) : {},
      isActive: model.isActive || false,
    }

    return NextResponse.json(parsedModel)

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

    console.error('Error updating AI model:', error)
    return NextResponse.json(
      { error: 'Failed to update AI model', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Support both PUT and PATCH for updates
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return handleUpdate(request, context)
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return handleUpdate(request, context)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取或创建用户
    const userId = await getUserIdFromCookie()
    const user = await ensureUser(userId)

    const { id } = params

    // Check if model exists and belongs to user
    const existingModel = await db.findFirst('AIModelConfig', {
      where: { 
        id,
        userId: user.id
      }
    })

    if (!existingModel) {
      return NextResponse.json(
        { error: 'AI model not found or access denied' },
        { status: 404 }
      )
    }

    // Delete model
    await db.delete('AIModelConfig', id)

    return NextResponse.json(
      { message: 'AI model deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting AI model:', error)
    return NextResponse.json(
      { error: 'Failed to delete AI model', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}