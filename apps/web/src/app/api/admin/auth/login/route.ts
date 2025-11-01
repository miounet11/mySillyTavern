import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'

const loginSchema = z.object({
  password: z.string().min(1)
})

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-key'

// 安全警告：使用默认密码
if (!process.env.ADMIN_PASSWORD) {
  console.warn('⚠️  警告：正在使用默认管理员密码！请在环境变量中设置 ADMIN_PASSWORD')
}
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  警告：正在使用默认 Session 密钥！请在环境变量中设置 SESSION_SECRET')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = loginSchema.parse(body)

    // 验证密码
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: '密码错误', code: 'INVALID_PASSWORD' },
        { status: 401 }
      )
    }

    // 设置 session cookie (24小时有效)
    const cookieStore = cookies()
    const sessionToken = Buffer.from(`admin:${Date.now()}`).toString('base64')
    
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return NextResponse.json({
      success: true,
      message: '登录成功'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求数据无效', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    )
  }
}

