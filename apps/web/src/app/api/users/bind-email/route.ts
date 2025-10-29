/**
 * 绑定邮箱 API
 * POST - 绑定邮箱到当前用户
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromCookie } from '@/lib/auth/cookies'
import { bindEmail } from '@/lib/auth/userManager'
import { z } from 'zod'

// 绑定邮箱的验证 schema
const bindEmailSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
})

/**
 * POST /api/users/bind-email
 * 绑定邮箱到当前用户
 */
export async function POST(request: NextRequest) {
  try {
    // 从 Cookie 获取用户 ID
    const userId = await getUserIdFromCookie()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未找到用户' },
        { status: 401 }
      )
    }
    
    // 解析请求体
    const body = await request.json()
    const validation = bindEmailSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { email } = validation.data
    
    // 绑定邮箱
    const user = await bindEmail(userId, email)
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      message: '邮箱绑定成功',
    })
  } catch (error: any) {
    console.error('Error binding email:', error)
    
    // 检查是否是邮箱已被使用的错误
    if (error.message && error.message.includes('已被使用')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: '绑定邮箱失败' },
      { status: 500 }
    )
  }
}

