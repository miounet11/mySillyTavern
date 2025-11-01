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

const categorySchema = z.object({
  name: z.string().min(1).max(20),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
})

/**
 * GET /api/admin/config/categories
 * 获取所有分类
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await db.findMany('CharacterCategory', {
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({
      categories
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/config/categories
 * 创建新分类
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
    const validatedData = categorySchema.parse(body)

    // 检查名称是否已存在
    const existing = await db.findFirst('CharacterCategory', {
      where: { name: validatedData.name }
    })

    if (existing) {
      return NextResponse.json(
        { error: '分类名称已存在' },
        { status: 409 }
      )
    }

    const category = await db.create('CharacterCategory', {
      id: nanoid(),
      name: validatedData.name,
      description: validatedData.description,
      icon: validatedData.icon,
      sortOrder: validatedData.sortOrder || 999,
    })

    return NextResponse.json({
      success: true,
      category
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/config/categories
 * 删除分类
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
        { error: '缺少分类ID' },
        { status: 400 }
      )
    }

    await db.delete('CharacterCategory', { id })

    return NextResponse.json({
      success: true,
      message: '分类已删除'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: '删除分类失败' },
      { status: 500 }
    )
  }
}

