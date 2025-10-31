/**
 * AI Model state management using Zustand with localStorage persistence
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { AIModelConfig, AIProvider } from '@sillytavern-clone/shared'

interface AIModelState {
  // State
  models: AIModelConfig[]
  activeModel: AIModelConfig | null
  selectedProvider: AIProvider
  isLoading: boolean
  error: string | null
  hydrated: boolean

  // Actions
  setModels: (models: AIModelConfig[]) => void
  setActiveModel: (model: AIModelConfig | null) => void
  setSelectedProvider: (provider: AIProvider) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // CRUD operations
  fetchModels: () => Promise<void>
  createModel: (params: any) => Promise<AIModelConfig | null>
  updateModel: (id: string, updates: any) => Promise<AIModelConfig | null>
  deleteModel: (id: string) => Promise<boolean>
  testModel: (id: string) => Promise<boolean>
  testModelConfig: (params: {
    provider: 'openai' | 'anthropic' | 'google'
    model: string
    apiKey?: string
    baseUrl?: string
    settings?: any
    testMessage?: string
  }) => Promise<{ success: boolean; response?: string; latency?: number; usage?: any; error?: string }>

  // Utility
  getModelsByProvider: (provider: string) => AIModelConfig[]
  getActiveModelSettings: () => any
  refreshActiveModel: () => Promise<void>
}

export const useAIModelStore = create<AIModelState>()(
  persist(
    devtools(
      (set, get) => ({
      // Initial state
      models: [],
      activeModel: null,
      selectedProvider: 'openai', // Default to OpenAI
      isLoading: false,
      error: null,
      hydrated: false,

      // Actions
      setModels: (models) => set({ models }),
      setActiveModel: (model) => set({ activeModel: model }),
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      // Mark store hydrated once state is rehydrated from localStorage (handled in persist.onRehydrateStorage)

      // CRUD operations
      fetchModels: async () => {
        try {
          set({ isLoading: true, error: null })

          // Try to fetch from API, but don't fail if it doesn't work
          // The localStorage persistence will handle local models
          try {
            const response = await fetch('/api/ai-models')
            if (response.ok) {
              const { models: serverModels } = await response.json()

              const currentModels = get().models

              // Build map of server models by (provider+model)
              const serverKey = (m: any) => `${m.provider}::${m.model}`
              const serverMap = new Map<string, AIModelConfig>()
              for (const sm of serverModels) {
                serverMap.set(serverKey(sm), sm)
              }

              // Start with server models
              const deduped: AIModelConfig[] = [...serverModels]

              // Append local models that don't conflict (by provider+model)
              for (const lm of currentModels) {
                const key = serverKey(lm as any)
                if (!serverMap.has(key)) {
                  deduped.push(lm)
                }
              }

              // Decide active model: 优先使用服务器的最新数据更新 activeModel
              const prevActive = get().activeModel
              let nextActive: AIModelConfig | null = null
              if (prevActive) {
                // 关键修复：优先从服务器数据中查找匹配的模型（使用 ID 匹配）
                const serverMatch = deduped.find(m => m.id === prevActive.id)
                // 如果找到服务器版本，使用服务器版本；否则回退到本地缓存
                nextActive = serverMatch || prevActive
              }
              if (!nextActive) {
                // 如果没有之前的激活模型，查找服务器标记为激活的模型
                nextActive = deduped.find((m: any) => (m as any).isActive) || null
              }

              set({ models: deduped, activeModel: nextActive || null })
            }
          } catch (apiError) {
            // API failed, but we still have localStorage data
            console.log('API unavailable, using local models only')
          }

        } catch (error) {
          console.error('Error fetching AI models:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to fetch AI models' })
        } finally {
          set({ isLoading: false })
        }
      },

      createModel: async (params) => {
        try {
          set({ isLoading: true, error: null })
          console.log('[AIModelStore] 开始创建模型:', params)
          
          // 智能激活逻辑：如果这是第一个模型，自动设为活跃
          const currentModels = get().models
          const isFirstModel = currentModels.length === 0
          const shouldAutoActivate = isFirstModel && params.isActive === undefined
          
          if (shouldAutoActivate) {
            console.log('[AIModelStore] 🎉 这是第一个模型，自动设为活跃')
            params = { ...params, isActive: true }
          }
          
          // API-first creation
          try {
            const resp = await fetch('/api/ai-models', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(params)
            })
            if (!resp.ok) {
              throw new Error(`HTTP ${resp.status}`)
            }
            const created: AIModelConfig = await resp.json()
            console.log('[AIModelStore] 服务器创建成功:', created)
            
            if (shouldAutoActivate) {
              console.log('[AIModelStore] ✅ 第一个模型已自动激活:', created.name)
            }

            set((state) => {
              const nextModels = params.isActive
                ? state.models.map(m => ({ ...m, isActive: false }))
                : state.models
              const merged = [...nextModels, created]
              console.log('[AIModelStore] 更新状态 - 模型总数:', merged.length)
              return {
                models: merged,
                activeModel: created.isActive ? created : state.activeModel
              }
            })
            
            // 验证状态已更新
            console.log('[AIModelStore] 创建后模型总数:', get().models.length)
            console.log('[AIModelStore] 活跃模型:', get().activeModel?.name)
            
            return created
          } catch (apiErr) {
            console.log('[AIModelStore] 服务器创建失败，使用本地存储', apiErr)
            const newModel: AIModelConfig = {
              id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: params.name,
              provider: params.provider,
              model: params.model,
              apiKey: params.apiKey,
              baseUrl: params.baseUrl,
              settings: params.settings || {},
              isActive: params.isActive !== undefined ? params.isActive : false,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            console.log('[AIModelStore] 本地创建模型:', newModel)
            
            if (shouldAutoActivate) {
              console.log('[AIModelStore] ✅ 第一个模型已自动激活（本地）:', newModel.name)
            }
            
            if (newModel.isActive) {
              set((state) => ({ models: state.models.map(m => ({ ...m, isActive: false })) }))
            }
            set((state) => ({
              models: [...state.models, newModel],
              activeModel: newModel.isActive ? newModel : state.activeModel
            }))
            
            // 验证状态已更新
            console.log('[AIModelStore] 本地创建后模型总数:', get().models.length)
            console.log('[AIModelStore] 活跃模型:', get().activeModel?.name)
            
            return newModel
          }
        } catch (error) {
          console.error('[AIModelStore] 创建模型错误:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to create AI model' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      updateModel: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })
          console.log('[AIModelStore] 开始更新模型:', id, updates)
          
          // API-first update
          try {
            const resp = await fetch(`/api/ai-models/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
            })
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
            const serverUpdated: AIModelConfig = await resp.json()
            console.log('[AIModelStore] 服务器更新成功:', serverUpdated)

            set((state) => {
              const replaced = state.models.map(m => m.id === id ? serverUpdated : (serverUpdated.isActive ? { ...m, isActive: false } : m))
              console.log('[AIModelStore] 更新状态 - 模型总数:', replaced.length)
              return {
                models: replaced,
                // 关键修复：如果更新的是当前激活模型，使用服务器返回的最新数据
                activeModel: state.activeModel?.id === id ? serverUpdated :
                            serverUpdated.isActive ? serverUpdated : state.activeModel
              }
            })
            
            // 验证状态已更新
            console.log('[AIModelStore] 更新后模型总数:', get().models.length)
            console.log('[AIModelStore] 活跃模型:', get().activeModel?.name)
            
            return serverUpdated
          } catch (apiErr) {
            console.log('[AIModelStore] 服务器更新失败，使用本地存储', apiErr)
            const currentModels = get().models
            const modelIndex = currentModels.findIndex(m => m.id === id)
            if (modelIndex === -1) throw new Error('Model not found')

            const updatedModel: AIModelConfig = {
              ...currentModels[modelIndex],
              ...updates,
              updatedAt: new Date(),
            }
            
            console.log('[AIModelStore] 本地更新模型:', updatedModel)
            
            if (updates.isActive) {
              set((state) => ({
                models: state.models.map(m => m.id === id ? updatedModel : { ...m, isActive: false }),
                activeModel: updatedModel
              }))
            } else {
              set((state) => ({
                models: state.models.map(m => m.id === id ? updatedModel : m),
                // 关键修复：如果更新的是当前激活模型，使用更新后的数据
                activeModel: state.activeModel?.id === id ? updatedModel :
                            (state.activeModel?.id === id && !updates.isActive
                              ? state.models.find((m: any) => (m as any).isActive) || null
                              : state.activeModel)
              }))
            }
            
            // 验证状态已更新
            console.log('[AIModelStore] 本地更新后模型总数:', get().models.length)
            console.log('[AIModelStore] 活跃模型:', get().activeModel?.name)
            
            return updatedModel
          }
        } catch (error) {
          console.error('[AIModelStore] 更新模型错误:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to update AI model' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      deleteModel: async (id) => {
        try {
          set({ isLoading: true, error: null })

          // Delete from local state first
          set((state) => {
            const remaining = state.models.filter(m => m.id !== id)
            let nextActive = state.activeModel
            if (state.activeModel?.id === id) {
              nextActive = remaining.find((m: any) => m.isActive) || null
            }
            return { models: remaining, activeModel: nextActive }
          })

          // Try to delete from server in background (optional)
          try {
            await fetch(`/api/ai-models/${id}`, {
              method: 'DELETE'
            })
          } catch (apiError) {
            console.log('Server sync failed, model deleted locally only')
          }

          return true
        } catch (error) {
          console.error('Error deleting AI model:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to delete AI model' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      testModel: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch(`/api/ai-models/${id}/test`, {
            method: 'POST'
          })

          if (!response.ok) {
            throw new Error('Failed to test AI model')
          }

          const result = await response.json()
          return result.success
        } catch (error) {
          console.error('Error testing AI model:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to test AI model' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      testModelConfig: async (params) => {
        try {
          set({ isLoading: true, error: null })
          const resp = await fetch('/api/ai-models/test-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          })
          const data = await resp.json()
          return data
        } catch (error) {
          console.error('Error testing model config:', error)
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        } finally {
          set({ isLoading: false })
        }
      },

      // Utility
      getModelsByProvider: (provider) => {
        return get().models.filter(model => model.provider === provider)
      },

      getActiveModelSettings() {
        const { activeModel } = get()
        return activeModel ? activeModel.settings : {}
      },

      refreshActiveModel: async () => {
        const { activeModel } = get()
        if (!activeModel?.id) {
          console.log('[AIModelStore] No active model to refresh')
          return
        }
        
        try {
          console.log('[AIModelStore] Refreshing active model:', activeModel.id)
          const response = await fetch(`/api/ai-models/${activeModel.id}`)
          if (response.ok) {
            const refreshedModel: AIModelConfig = await response.json()
            set((state) => ({
              models: state.models.map(m => m.id === activeModel.id ? refreshedModel : m),
              activeModel: refreshedModel
            }))
            console.log('[AIModelStore] Active model refreshed successfully')
          } else {
            console.warn('[AIModelStore] Failed to refresh active model, keeping current')
          }
        } catch (error) {
          console.error('[AIModelStore] Error refreshing active model:', error)
        }
      },
      }),
      {
        name: 'ai-model-store',
      }
    ),
    {
      name: 'ai-models-storage',
      // Only persist models, activeModel and selectedProvider to localStorage
      partialize: (state) => ({
        models: state.models,
        activeModel: state.activeModel,
        selectedProvider: state.selectedProvider,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[AIModelStore] Rehydration error:', error)
          return
        }
        console.log('[AIModelStore] Rehydrating from localStorage...', {
          models: state?.models?.length || 0,
          activeModel: state?.activeModel ? { id: state.activeModel.id, name: state.activeModel.name } : null
        })
        // Delay setting hydrated to next tick to ensure subscribers update
        setTimeout(() => {
          try {
            // set hydrated true without overwriting other state
            ;(useAIModelStore as any).setState({ hydrated: true }, false)
            console.log('[AIModelStore] Hydration complete ✓')
          } catch (err) {
            console.error('[AIModelStore] Failed to set hydrated flag:', err)
          }
        }, 0)
      },
    }
  )
)