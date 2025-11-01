import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { z } from 'zod'

// 验证管理员权限
function checkAdminAuth(): boolean {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('admin_session')
    return !!session?.value
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

const imageConfigSchema = z.object({
  imageApiUrl: z.string().url().optional(),
  imageApiKey: z.string().optional(),
  imageModel: z.string().optional(),
  imageProvider: z.enum(['openai', 'stability', 'other']).optional(),
})

const CONFIG_PATH = path.join(process.cwd(), 'llm-config.json')

/**
 * GET /api/admin/config/image
 * 获取图像生成配置
 */
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    if (existsSync(CONFIG_PATH)) {
      const configData = await readFile(CONFIG_PATH, 'utf-8')
      const config = JSON.parse(configData)
      
      // 只返回图像相关配置，不返回敏感信息
      return NextResponse.json({
        imageApiUrl: config.imageApiUrl || '',
        imageApiKey: config.imageApiKey ? '********' : '', // 隐藏实际密钥
        imageModel: config.imageModel || 'dall-e-3',
        imageProvider: config.imageProvider || 'openai',
        hasImageConfig: !!(config.imageApiUrl && config.imageApiKey)
      })
    }

    return NextResponse.json({
      imageApiUrl: '',
      imageApiKey: '',
      imageModel: 'dall-e-3',
      imageProvider: 'openai',
      hasImageConfig: false
    })
  } catch (error) {
    console.error('Error fetching image config:', error)
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/config/image
 * 更新图像生成配置
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
    const validatedData = imageConfigSchema.parse(body)

    // 读取现有配置
    let existingConfig = {}
    if (existsSync(CONFIG_PATH)) {
      const configData = await readFile(CONFIG_PATH, 'utf-8')
      existingConfig = JSON.parse(configData)
    }

    // 合并配置（只更新提供的字段）
    const updatedConfig = {
      ...existingConfig,
      ...(validatedData.imageApiUrl !== undefined && { imageApiUrl: validatedData.imageApiUrl }),
      ...(validatedData.imageApiKey !== undefined && validatedData.imageApiKey !== '********' && { imageApiKey: validatedData.imageApiKey }),
      ...(validatedData.imageModel !== undefined && { imageModel: validatedData.imageModel }),
      ...(validatedData.imageProvider !== undefined && { imageProvider: validatedData.imageProvider }),
    }

    // 保存配置
    await writeFile(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2), 'utf-8')

    console.log('Image generation config updated successfully')

    return NextResponse.json({
      success: true,
      message: '配置已更新',
      hasImageConfig: !!(updatedConfig.imageApiUrl && updatedConfig.imageApiKey)
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating image config:', error)
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    )
  }
}

