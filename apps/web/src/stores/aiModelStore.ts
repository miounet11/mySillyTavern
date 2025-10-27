/**
 * AI Model state management using Zustand
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AIModelConfig } from '@sillytavern-clone/shared'

interface AIModelState {
  // State
  models: AIModelConfig[]
  activeModel: AIModelConfig | null
  isLoading: boolean
  error: string | null

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
  hasActiveModel: boolean
  getActiveModelSettings: () => any
}

export const useAIModelStore = create<AIModelState>()(
  devtools(
    (set, get) => ({
      // Initial state
      models: [],
      activeModel: null,
      isLoading: false,
      error: null,

      // Actions
      setModels: (models) => set({ models }),
      setActiveModel: (model) => set({ activeModel: model }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // CRUD operations
      fetchModels: async () => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch('/api/ai-models')
          if (!response.ok) {
            throw new Error('Failed to fetch AI models')
          }

          const { models } = await response.json()
          set({ models })

          // Set active model if none is selected
          const active = models.find((model: any) => model.isActive)
          if (active && !get().activeModel) {
            set({ activeModel: active })
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

          const response = await fetch('/api/ai-models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          })

          if (!response.ok) {
            throw new Error('Failed to create AI model')
          }

          const model = await response.json()
          set((state) => ({
            models: [...state.models, model]
          }))

          // If this model is created as active, update activeModel immediately
          if ((model as any).isActive) {
            set({ activeModel: model })
          }

          return model
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

          const response = await fetch(`/api/ai-models/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          })

          if (!response.ok) {
            throw new Error('Failed to update AI model')
          }

          const model = await response.json()
          set((state) => ({
            models: state.models.map(m => m.id === id ? model : m),
            activeModel: state.activeModel?.id === id ? model : state.activeModel
          }))

          return model
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

          const response = await fetch(`/api/ai-models/${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('Failed to delete AI model')
          }

          set((state) => ({
            models: state.models.filter(m => m.id !== id),
            activeModel: state.activeModel?.id === id ? null : state.activeModel
          }))

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

      get hasActiveModel() {
        return get().activeModel !== null
      },

      getActiveModelSettings() {
        const { activeModel } = get()
        return activeModel ? activeModel.settings : {}
      },
    }),
    {
      name: 'ai-model-store',
    }
  )
)