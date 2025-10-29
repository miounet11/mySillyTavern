/**
 * 用户初始化组件
 * 在应用启动时自动加载用户信息
 */

'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export function UserInitializer() {
  const { fetchCurrentUser, isInitialized } = useUserStore()

  useEffect(() => {
    // 只在未初始化时加载用户信息
    if (!isInitialized) {
      fetchCurrentUser()
    }
  }, [isInitialized, fetchCurrentUser])

  // 这个组件不渲染任何内容
  return null
}

