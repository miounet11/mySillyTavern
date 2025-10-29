/**
 * Next.js 中间件
 * 自动识别用户或创建新用户
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME } from './lib/auth/cookies'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 检查是否已有用户 Cookie
  const userId = request.cookies.get(COOKIE_NAME)?.value

  // 如果没有用户 Cookie，在响应头中标记需要创建用户
  // 实际的用户创建会在 API 路由中完成
  if (!userId) {
    response.headers.set('x-create-user', 'true')
  } else {
    response.headers.set('x-user-id', userId)
  }

  return response
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - public 文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

