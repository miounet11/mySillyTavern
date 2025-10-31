/**
 * Settings UI State Management
 * Manages the global settings drawer state
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SettingsUIState {
  // State
  isOpen: boolean
  defaultTab: string

  // Actions
  openSettings: (tab?: string) => void
  closeSettings: () => void
  toggleSettings: (tab?: string) => void
  setDefaultTab: (tab: string) => void
}

export const useSettingsUIStore = create<SettingsUIState>()(
  devtools(
    (set) => ({
      // Initial state
      isOpen: false,
      defaultTab: 'general',

      /**
       * Open settings drawer with optional default tab
       */
      openSettings: (tab?: string) => {
        set({
          isOpen: true,
          defaultTab: tab || 'general',
        })
      },

      /**
       * Close settings drawer
       */
      closeSettings: () => {
        set({ isOpen: false })
      },

      /**
       * Toggle settings drawer (open/close)
       */
      toggleSettings: (tab?: string) => {
        set((state) => ({
          isOpen: !state.isOpen,
          defaultTab: tab || state.defaultTab,
        }))
      },

      /**
       * Set default tab without opening
       */
      setDefaultTab: (tab: string) => {
        set({ defaultTab: tab })
      },
    }),
    { name: 'SettingsUIStore' }
  )
)

