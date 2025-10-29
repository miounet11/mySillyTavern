/**
 * Creative intent state for storyline and POV directives
 */

'use client'

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

export type PovMode = 'first' | 'third' | null

interface CreativeIntentState {
  // States
  storyAdvance: boolean
  povMode: PovMode
  sceneTransitionOnce: boolean

  // Actions
  setStoryAdvance: (v: boolean) => void
  setPovMode: (v: PovMode) => void
  setSceneTransitionOnce: (v: boolean) => void
  clearAll: () => void
  consumeOneShots: () => void
  hydrateFromLocalStorage: () => void
}

const STORAGE_KEY = 'creative_intent_v1'

function safeLoad(): Partial<CreativeIntentState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return {
      storyAdvance: Boolean(parsed.storyAdvance),
      povMode: (parsed.povMode === 'first' || parsed.povMode === 'third') ? parsed.povMode : null,
      sceneTransitionOnce: false, // 一次性指令不从本地恢复
    }
  } catch {
    return {}
  }
}

function safeSave(state: Pick<CreativeIntentState, 'storyAdvance' | 'povMode'>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      storyAdvance: state.storyAdvance,
      povMode: state.povMode,
    }))
  } catch {}
}

export const useCreativeStore = create<CreativeIntentState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Defaults (will hydrate on mount)
      storyAdvance: false,
      povMode: null,
      sceneTransitionOnce: false,

      setStoryAdvance: (v) => {
        set({ storyAdvance: v })
        safeSave({ storyAdvance: v, povMode: get().povMode })
      },
      setPovMode: (v) => {
        set({ povMode: v })
        safeSave({ storyAdvance: get().storyAdvance, povMode: v })
      },
      setSceneTransitionOnce: (v) => {
        set({ sceneTransitionOnce: v })
        // 一次性状态不持久化
      },
      clearAll: () => {
        set({ storyAdvance: false, povMode: null, sceneTransitionOnce: false })
        safeSave({ storyAdvance: false, povMode: null })
      },
      consumeOneShots: () => {
        const { sceneTransitionOnce } = get()
        if (sceneTransitionOnce) set({ sceneTransitionOnce: false })
      },
      hydrateFromLocalStorage: () => {
        const loaded = safeLoad()
        if (Object.keys(loaded).length > 0) {
          set((state) => ({
            ...state,
            ...loaded,
            sceneTransitionOnce: false,
          }))
        }
      },
    })),
    { name: 'creative-intent-store' }
  )
)


