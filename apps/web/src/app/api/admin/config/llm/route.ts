import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { nanoid } from 'nanoid'
import { cookies } from 'next/headers'

// 验证管理员权限
function checkAdminAuth() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('admin_session')
  
  if (!sessionToken) {
    return false
  }

  try {
    const decoded = Buffer.from(sessionToken.value, 'base64').toString()
    return decoded.startsWith('admin:')
  } catch {
    return false
  }
}

const llmConfigSchema = z.object({
  name: z.string().min(1),
  provider: z.string(),
  model: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  settings: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
  }).optional(),
})

/**
 * GET /api/admin/config/llm
 * 获取所有LLM配置
 */
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // 获取所有AI模型配置（用于角色生成）
    const configs = await db.findMany('AIModelConfig', {
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    // 解析 settings 字段
    const parsedConfigs = configs.map((config: any) => ({
      ...config,
      settings: config.settings ? JSON.parse(config.settings) : {}
    }))

    return NextResponse.json({
      configs: parsedConfigs
    })

  } catch (error) {
    console.error('Error fetching LLM configs:', error)
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/config/llm
 * 创建或更新LLM配置
 */
export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = llmConfigSchema.parse(body)

    // 创建新配置
    const config = await db.create('AIModelConfig', {
      id: nanoid(),
      name: validatedData.name,
      provider: validatedData.provider,
      model: validatedData.model,
      apiKey: validatedData.apiKey,
      baseUrl: validatedData.baseUrl,
      settings: JSON.stringify(validatedData.settings || {}),
      isActive: true,
      userId: 'admin', // 管理员创建的配置
    })

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        settings: config.settings ? JSON.parse(config.settings) : {}
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating LLM config:', error)
    return NextResponse.json(
      { error: '创建配置失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/config/llm
 * 更新LLM配置
 */
export async function PUT(request: NextRequest) {
  try {
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少配置ID' },
        { status: 400 }
      )
    }

    const validatedData = llmConfigSchema.partial().parse(updateData)

    const config = await db.update('AIModelConfig', { id }, {
      ...validatedData,
      settings: validatedData.settings ? JSON.stringify(validatedData.settings) : undefined
    })

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        settings: config.settings ? JSON.parse(config.settings) : {}
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating LLM config:', error)
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/config/llm
 * 删除LLM配置
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少配置ID' },
        { status: 400 }
      )
    }

    await db.delete('AIModelConfig', { id })

    return NextResponse.json({
      success: true,
      message: '配置已删除'
    })

  } catch (error) {
    console.error('Error deleting LLM config:', error)
    return NextResponse.json(
      { error: '删除配置失败' },
      { status: 500 }
    )
  }
}

