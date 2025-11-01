import { NextRequest, NextResponse } from 'next/server'
import { db } from '@sillytavern-clone/database'
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

/**
 * GET /api/admin/users
 * 获取所有拥有角色的用户ID列表
 */
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // 查询所有有角色的唯一用户ID
    const characters = await db.findMany('Character', {
      where: { userId: { not: null } },
      select: { userId: true }
    })

    // 去重并过滤null值
    const userIdSet = new Set<string>()
    characters.forEach((char: any) => {
      if (char.userId) {
        userIdSet.add(char.userId)
      }
    })

    const userIds = Array.from(userIdSet).sort()

    return NextResponse.json({
      userIds,
      count: userIds.length
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}

