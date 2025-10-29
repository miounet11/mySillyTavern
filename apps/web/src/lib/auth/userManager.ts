/**
 * 用户管理工具
 * 负责用户创建、验证和管理
 */

import { nanoid } from 'nanoid'
import { PrismaClient } from '@sillytavern-clone/database'

const prisma = new PrismaClient()

/**
 * 生成随机用户名
 * 格式：访客_xxxxx
 */
export function generateUsername(): string {
  const randomId = nanoid(8).toLowerCase()
  return `访客_${randomId}`
}

/**
 * 根据 userId 获取用户信息
 */
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return user
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

/**
 * 创建新用户
 */
export async function createUser(username?: string) {
  try {
    const user = await prisma.user.create({
      data: {
        username: username || generateUsername(),
        settings: JSON.stringify({
          theme: 'dark',
          language: 'zh-CN',
        }),
      },
    })
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, data: { username?: string; email?: string; settings?: string }) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    })
    return user
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * 通过邮箱查找用户
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

/**
 * 验证用户是否存在，如不存在则创建
 */
export async function ensureUser(userId: string | null) {
  // 如果有 userId，验证用户是否存在
  if (userId) {
    const user = await getUserById(userId)
    if (user) {
      return user
    }
  }

  // 创建新用户
  const newUser = await createUser()
  return newUser
}

/**
 * 检查用户名是否可用
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    })
    return !user
  } catch (error) {
    console.error('Error checking username availability:', error)
    return false
  }
}

/**
 * 绑定邮箱到用户
 */
export async function bindEmail(userId: string, email: string) {
  try {
    // 检查邮箱是否已被使用
    const existingUser = await getUserByEmail(email)
    if (existingUser && existingUser.id !== userId) {
      throw new Error('该邮箱已被其他用户使用')
    }

    const user = await updateUser(userId, { email })
    return user
  } catch (error) {
    console.error('Error binding email:', error)
    throw error
  }
}
