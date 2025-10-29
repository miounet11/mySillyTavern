/**
 * 用户信息 API
 * GET - 获取当前用户信息
 * PATCH - 更新用户信息
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromCookie, setUserIdCookie } from '@/lib/auth/cookies'
import { ensureUser, updateUser, isUsernameAvailable } from '@/lib/auth/userManager'
import { z } from 'zod'

// 更新用户的验证 schema
const updateUserSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  settings: z.string().optional(),
})

/**
 * GET /api/users/current
 * 获取当前用户信息
 */
export async function GET(request: NextRequest) {
  try {
    // 从 Cookie 获取用户 ID
    let userId = await getUserIdFromCookie()
    
    // 确保用户存在（如不存在则创建）
    const user = await ensureUser(userId)
    
    // 如果是新创建的用户，设置 Cookie
    if (!userId) {
      await setUserIdCookie(user.id)
    }
    
    // 解析 settings JSON
    let settings = null
    try {
      settings = user.settings ? JSON.parse(user.settings) : null
    } catch (error) {
      console.error('Error parsing user settings:', error)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        settings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/current
 * 更新当前用户信息
 */
export async function PATCH(request: NextRequest) {
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
    const validation = updateUserSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '无效的请求数据', details: validation.error },
        { status: 400 }
      )
    }
    
    const { username, email, settings } = validation.data
    
    // 如果要更新用户名，检查是否可用
    if (username) {
      const available = await isUsernameAvailable(username, userId)
      if (!available) {
        return NextResponse.json(
          { success: false, error: '用户名已被使用' },
          { status: 400 }
        )
      }
    }
    
    // 更新用户
    const updatedUser = await updateUser(userId, {
      ...(username && { username }),
      ...(email !== undefined && { email: email || null }),
      ...(settings && { settings }),
    })
    
    // 解析 settings JSON
    let parsedSettings = null
    try {
      parsedSettings = updatedUser.settings ? JSON.parse(updatedUser.settings) : null
    } catch (error) {
      console.error('Error parsing user settings:', error)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        settings: parsedSettings,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: '更新用户信息失败' },
      { status: 500 }
    )
  }
}

