/**
 * 账号找回 API
 * POST - 通过邮箱找回账号
 */

import { NextRequest, NextResponse } from 'next/server'
import { updateUserIdCookie } from '@/lib/auth/cookies'
import { getUserByEmail } from '@/lib/auth/userManager'
import { z } from 'zod'

// 找回账号的验证 schema
const recoverAccountSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
})

/**
 * POST /api/users/recover
 * 通过邮箱找回账号并更新 Cookie
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json()
    const validation = recoverAccountSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { email } = validation.data
    
    // 通过邮箱查找用户
    const user = await getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未找到与该邮箱关联的账号' },
        { status: 404 }
      )
    }
    
    // 更新 Cookie
    await updateUserIdCookie(user.id)
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      message: '账号找回成功',
    })
  } catch (error) {
    console.error('Error recovering account:', error)
    return NextResponse.json(
      { success: false, error: '账号找回失败' },
      { status: 500 }
    )
  }
}

