import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // 删除 session cookie
    cookieStore.delete('admin_session')

    return NextResponse.json({
      success: true,
      message: '登出成功'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    )
  }
}

