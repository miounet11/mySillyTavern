/**
 * 用户状态管理
 * 使用 Zustand
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from 'axios'

interface User {
  id: string
  username: string
  email: string | null
  settings: {
    theme: string
    language: string
    [key: string]: any
  } | null
  createdAt: string
  updatedAt: string
}

interface UserState {
  // State
  user: User | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean

  // Actions
  fetchCurrentUser: () => Promise<void>
  updateUsername: (username: string) => Promise<boolean>
  updateSettings: (settings: any) => Promise<boolean>
  bindEmail: (email: string) => Promise<boolean>
  recoverAccount: (email: string) => Promise<boolean>
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      user: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      /**
       * 获取当前用户信息
       */
      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.get('/api/users/current')
          
          if (response.data.success) {
            set({
              user: response.data.data,
              isLoading: false,
              isInitialized: true,
            })
          } else {
            throw new Error(response.data.error || '获取用户信息失败')
          }
        } catch (error: any) {
          console.error('Error fetching current user:', error)
          set({
            error: error.response?.data?.error || error.message || '获取用户信息失败',
            isLoading: false,
            isInitialized: true,
          })
        }
      },

      /**
       * 更新用户名
       */
      updateUsername: async (username: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.patch('/api/users/current', { username })
          
          if (response.data.success) {
            set({
              user: response.data.data,
              isLoading: false,
            })
            return true
          } else {
            throw new Error(response.data.error || '更新用户名失败')
          }
        } catch (error: any) {
          console.error('Error updating username:', error)
          set({
            error: error.response?.data?.error || error.message || '更新用户名失败',
            isLoading: false,
          })
          return false
        }
      },

      /**
       * 更新用户设置
       */
      updateSettings: async (settings: any) => {
        set({ isLoading: true, error: null })
        
        try {
          const currentUser = get().user
          if (!currentUser) {
            throw new Error('用户未登录')
          }

          const updatedSettings = {
            ...currentUser.settings,
            ...settings,
          }

          const response = await axios.patch('/api/users/current', {
            settings: JSON.stringify(updatedSettings),
          })
          
          if (response.data.success) {
            set({
              user: response.data.data,
              isLoading: false,
            })
            return true
          } else {
            throw new Error(response.data.error || '更新设置失败')
          }
        } catch (error: any) {
          console.error('Error updating settings:', error)
          set({
            error: error.response?.data?.error || error.message || '更新设置失败',
            isLoading: false,
          })
          return false
        }
      },

      /**
       * 绑定邮箱
       */
      bindEmail: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/users/bind-email', { email })
          
          if (response.data.success) {
            set({
              user: response.data.data,
              isLoading: false,
            })
            return true
          } else {
            throw new Error(response.data.error || '绑定邮箱失败')
          }
        } catch (error: any) {
          console.error('Error binding email:', error)
          set({
            error: error.response?.data?.error || error.message || '绑定邮箱失败',
            isLoading: false,
          })
          return false
        }
      },

      /**
       * 通过邮箱找回账号
       */
      recoverAccount: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/users/recover', { email })
          
          if (response.data.success) {
            set({
              user: response.data.data,
              isLoading: false,
            })
            
            // 刷新页面以应用新的 Cookie
            window.location.reload()
            return true
          } else {
            throw new Error(response.data.error || '账号找回失败')
          }
        } catch (error: any) {
          console.error('Error recovering account:', error)
          set({
            error: error.response?.data?.error || error.message || '账号找回失败',
            isLoading: false,
          })
          return false
        }
      },

      /**
       * 设置错误信息
       */
      setError: (error: string | null) => {
        set({ error })
      },

      /**
       * 清除错误信息
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * 重置状态
       */
      reset: () => {
        set({
          user: null,
          isLoading: false,
          error: null,
          isInitialized: false,
        })
      },
    }),
    { name: 'UserStore' }
  )
)

