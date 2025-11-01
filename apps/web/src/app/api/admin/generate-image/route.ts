import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'
import { cookies } from 'next/headers'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const CHARACTERS_UPLOAD_DIR = path.join(UPLOAD_DIR, 'characters')

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

// 确保角色图片目录存在
async function ensureCharactersUploadDir() {
  if (!existsSync(CHARACTERS_UPLOAD_DIR)) {
    await mkdir(CHARACTERS_UPLOAD_DIR, { recursive: true })
  }
}

// 加载LLM配置
async function loadLLMConfig() {
  try {
    const configPath = path.join(process.cwd(), 'llm-config.json')
    if (existsSync(configPath)) {
      const fs = require('fs')
      const configData = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(configData)
    }
    return null
  } catch (error) {
    console.error('Load LLM config error:', error)
    return null
  }
}

/**
 * POST /api/admin/generate-image
 * 使用AI生成角色封面图
 */
export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    await ensureCharactersUploadDir()

    const { prompt, characterName, style } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供图片描述', code: 'MISSING_PROMPT' },
        { status: 400 }
      )
    }

    // 加载LLM配置
    const config = await loadLLMConfig()

    if (!config || !config.imageApiUrl || !config.imageApiKey) {
      return NextResponse.json(
        {
          error: '未配置图像生成服务。请在LLM配置中设置图像API地址和密钥。',
          code: 'NO_IMAGE_CONFIG'
        },
        { status: 400 }
      )
    }

    console.log('Generating image with prompt:', prompt)

    // 构建完整的提示词
    const fullPrompt = style ? `${prompt}, ${style}` : prompt

    // 调用图像生成API
    // 支持OpenAI DALL-E、Stable Diffusion等
    let imageUrl: string

    try {
      const imageProvider = config.imageProvider || 'openai'

      if (imageProvider === 'openai') {
        // OpenAI DALL-E API
        const response = await fetch(config.imageApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.imageApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.imageModel || 'dall-e-3',
            prompt: fullPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Image generation API error:', errorData)
          throw new Error(`API返回错误: ${response.status}`)
        }

        const data = await response.json()
        imageUrl = data.data?.[0]?.url

        if (!imageUrl) {
          throw new Error('API未返回图片URL')
        }
      } else {
        // 其他图像生成服务（可以扩展）
        return NextResponse.json(
          {
            error: `不支持的图像提供商: ${imageProvider}`,
            code: 'UNSUPPORTED_PROVIDER'
          },
          { status: 400 }
        )
      }

      console.log('Image generated, downloading from:', imageUrl)

      // 下载生成的图片
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error('下载生成的图片失败')
      }

      const imageBuffer = await imageResponse.arrayBuffer()

      // 生成文件名
      const safeCharacterName = (characterName || 'character')
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
        .substring(0, 50)
      const filename = `${nanoid()}-${safeCharacterName}.png`
      const filepath = path.join(CHARACTERS_UPLOAD_DIR, filename)

      // 保存到本地
      await writeFile(filepath, Buffer.from(imageBuffer))

      console.log('Image saved to:', filepath)

      // 返回本地访问路径
      return NextResponse.json({
        success: true,
        url: `/uploads/characters/${filename}`,
        filename
      })
    } catch (apiError: any) {
      console.error('Image generation API error:', apiError)
      return NextResponse.json(
        {
          error: `图像生成失败: ${apiError.message || '未知错误'}`,
          code: 'GENERATION_FAILED'
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Generate image error:', error)
    return NextResponse.json(
      {
        error: `图像生成失败: ${error.message || '服务器错误'}`,
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}

