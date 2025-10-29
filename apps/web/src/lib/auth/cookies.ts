/**
 * Cookie 管理工具
 * 用于处理用户识别的 Cookie
 */

import { cookies } from 'next/headers'

// Cookie 配置
export const COOKIE_NAME = 'st_user_id'
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1年（秒）

/**
 * 获取用户 ID 从 Cookie
 */
export async function getUserIdFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get(COOKIE_NAME)
    return userIdCookie?.value || null
  } catch (error) {
    console.error('Error reading user ID from cookie:', error)
    return null
  }
}

/**
 * 设置用户 ID 到 Cookie
 */
export async function setUserIdCookie(userId: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })
  } catch (error) {
    console.error('Error setting user ID cookie:', error)
    throw error
  }
}

/**
 * 删除用户 ID Cookie
 */
export async function deleteUserIdCookie(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
  } catch (error) {
    console.error('Error deleting user ID cookie:', error)
    throw error
  }
}

/**
 * 更新用户 ID Cookie（用于账号找回）
 */
export async function updateUserIdCookie(newUserId: string): Promise<void> {
  try {
    await deleteUserIdCookie()
    await setUserIdCookie(newUserId)
  } catch (error) {
    console.error('Error updating user ID cookie:', error)
    throw error
  }
}

