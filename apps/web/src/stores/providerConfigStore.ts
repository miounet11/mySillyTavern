/**
 * Provider Configuration Store
 * Manages API Key and Base URL for each provider globally
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AIProvider } from '@sillytavern-clone/shared'

interface ProviderConfig {
  apiKey: string
  baseUrl: string
}

interface ProviderConfigState {
  providerConfigs: Partial<Record<AIProvider, ProviderConfig>>
  
  // Actions
  setProviderConfig: (provider: AIProvider, config: ProviderConfig) => void
  getProviderConfig: (provider: AIProvider) => ProviderConfig | undefined
  updateProviderApiKey: (provider: AIProvider, apiKey: string) => void
  updateProviderBaseUrl: (provider: AIProvider, baseUrl: string) => void
  getConfiguredProviders: () => AIProvider[]
  isProviderConfigured: (provider: AIProvider) => boolean
  removeProviderConfig: (provider: AIProvider) => void
}

export const useProviderConfigStore = create<ProviderConfigState>()(
  persist(
    (set, get) => ({
      providerConfigs: {},

      setProviderConfig: (provider, config) => {
        set((state) => ({
          providerConfigs: {
            ...state.providerConfigs,
            [provider]: config,
          },
        }))
      },

      getProviderConfig: (provider) => {
        return get().providerConfigs[provider]
      },

      updateProviderApiKey: (provider, apiKey) => {
        set((state) => ({
          providerConfigs: {
            ...state.providerConfigs,
            [provider]: {
              ...state.providerConfigs[provider],
              apiKey,
              baseUrl: state.providerConfigs[provider]?.baseUrl || '',
            },
          },
        }))
      },

      updateProviderBaseUrl: (provider, baseUrl) => {
        set((state) => ({
          providerConfigs: {
            ...state.providerConfigs,
            [provider]: {
              ...state.providerConfigs[provider],
              apiKey: state.providerConfigs[provider]?.apiKey || '',
              baseUrl,
            },
          },
        }))
      },

      getConfiguredProviders: () => {
        const configs = get().providerConfigs
        return Object.keys(configs).filter(
          (provider) => configs[provider as AIProvider]?.apiKey
        ) as AIProvider[]
      },

      isProviderConfigured: (provider) => {
        return !!get().providerConfigs[provider]?.apiKey
      },

      removeProviderConfig: (provider) => {
        set((state) => {
          const newConfigs = { ...state.providerConfigs }
          delete newConfigs[provider]
          return { providerConfigs: newConfigs }
        })
      },
    }),
    {
      name: 'provider-configs-storage',
    }
  )
)

