/**
 * AI Model state management using Zustand with localStorage persistence
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { AIModelConfig } from '@sillytavern-clone/shared'

interface AIModelState {
  // State
  models: AIModelConfig[]
  activeModel: AIModelConfig | null
  isLoading: boolean
  error: string | null
  hydrated: boolean

  // Actions
  setModels: (models: AIModelConfig[]) => void
  setActiveModel: (model: AIModelConfig | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // CRUD operations
  fetchModels: () => Promise<void>
  createModel: (params: any) => Promise<AIModelConfig | null>
  updateModel: (id: string, updates: any) => Promise<AIModelConfig | null>
  deleteModel: (id: string) => Promise<boolean>
  testModel: (id: string) => Promise<boolean>

  // Utility
  getModelsByProvider: (provider: string) => AIModelConfig[]
  getActiveModelSettings: () => any
}

export const useAIModelStore = create<AIModelState>()(
  persist(
    devtools(
      (set, get) => ({
      // Initial state
      models: [],
      activeModel: null,
      isLoading: false,
      error: null,
      hydrated: false,

      // Actions
      setModels: (models) => set({ models }),
      setActiveModel: (model) => set({ activeModel: model }),
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
              const { models } = await response.json()
              // Merge server models with local models
              const currentModels = get().models
              const mergedModels = [...currentModels]
              
              models.forEach((serverModel: AIModelConfig) => {
                const existingIndex = mergedModels.findIndex(m => m.id === serverModel.id)
                if (existingIndex >= 0) {
                  mergedModels[existingIndex] = serverModel
                } else {
                  mergedModels.push(serverModel)
                }
              })
              
              set({ models: mergedModels })
              
              // Sync active model
              const active = mergedModels.find((model: any) => model.isActive)
              if (active) {
                set({ activeModel: active })
              }
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

          // Create model locally first
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

          // If this model is set as active, deactivate all other models
          if (newModel.isActive) {
            set((state) => ({
              models: state.models.map(m => ({ ...m, isActive: false }))
            }))
          }

          // Add to local state (will be persisted to localStorage automatically)
          set((state) => ({
            models: [...state.models, newModel],
            activeModel: newModel.isActive ? newModel : state.activeModel
          }))

          // Try to sync with server in background (optional)
          try {
            await fetch('/api/ai-models', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(params)
            })
          } catch (apiError) {
            // Server sync failed, but local model is saved
            console.log('Server sync failed, model saved locally only')
          }

          return newModel
        } catch (error) {
          console.error('Error creating AI model:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to create AI model' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      updateModel: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          // Update model locally first
          const currentModels = get().models
          const modelIndex = currentModels.findIndex(m => m.id === id)
          
          if (modelIndex === -1) {
            throw new Error('Model not found')
          }

          const updatedModel: AIModelConfig = {
            ...currentModels[modelIndex],
            ...updates,
            updatedAt: new Date(),
          }

          // If this model is being set as active, deactivate all others
          if (updates.isActive) {
            set((state) => ({
              models: state.models.map((m, idx) => 
                idx === modelIndex 
                  ? updatedModel 
                  : { ...m, isActive: false }
              ),
              activeModel: updatedModel
            }))
          } else {
            set((state) => {
              const updatedModels = state.models.map((m, idx) => 
                idx === modelIndex ? updatedModel : m
              )
              // If we just deactivated the active model, clear it
              const newActiveModel = state.activeModel?.id === id && !updates.isActive
                ? updatedModels.find((m: any) => m.isActive) || null
                : state.activeModel
              
              return { 
                models: updatedModels,
                activeModel: newActiveModel
              }
            })
          }

          // Try to sync with server in background (optional)
          try {
            await fetch(`/api/ai-models/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
            })
          } catch (apiError) {
            console.log('Server sync failed, model updated locally only')
          }

          return updatedModel
        } catch (error) {
          console.error('Error updating AI model:', error)
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

      // Utility
      getModelsByProvider: (provider) => {
        return get().models.filter(model => model.provider === provider)
      },

      getActiveModelSettings() {
        const { activeModel } = get()
        return activeModel ? activeModel.settings : {}
      },
      }),
      {
        name: 'ai-model-store',
      }
    ),
    {
      name: 'ai-models-storage',
      // Only persist models and activeModel to localStorage
      partialize: (state) => ({
        models: state.models,
        activeModel: state.activeModel,
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