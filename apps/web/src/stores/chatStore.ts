/**
 * Chat state management using Zustand
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { Chat, Message, Character, ChatSettings, GenerationOptions } from '@sillytavern-clone/shared'

interface ChatState {
  // State
  currentChat: Chat | null
  messages: Message[]
  character: Character | null
  isLoading: boolean
  isGenerating: boolean
  error: string | null

  // UI State
  sidebarOpen: boolean
  showCharacterInfo: boolean
  showWorldInfo: boolean

  // Computed
  hasMessages: boolean
  messageCount: number
  canGenerate: boolean

  // Actions
  setCurrentChat: (chat: Chat | null) => void
  setCharacter: (character: Character | null) => void
  setLoading: (loading: boolean) => void
  setGenerating: (generating: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Message actions
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  deleteMessage: (messageId: string) => void
  clearMessages: () => void

  // Chat actions
  updateChatSettings: (settings: Partial<ChatSettings>) => void
  updateChatTitle: (title: string) => void

  // UI actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleCharacterInfo: () => void
  toggleWorldInfo: () => void

  // Reset
  reset: () => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentChat: null,
      messages: [],
      character: null,
      isLoading: false,
      isGenerating: false,
      error: null,
      sidebarOpen: true,
      showCharacterInfo: false,
      showWorldInfo: false,

      // Computed getters
      get hasMessages() {
        return get().messages.length > 0
      },

      get messageCount() {
        return get().messages.length
      },

      get canGenerate() {
        const { isGenerating, currentChat, character } = get()
        return !isGenerating && currentChat !== null && character !== null
      },

      // Actions
      setCurrentChat: (chat) => {
        set((state) => ({
          currentChat: chat,
          messages: [], // Clear messages when switching chats
          character: null,
          error: null
        }))
      },

      setCharacter: (character) => {
        set({ character })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setGenerating: (generating) => {
        set({ isGenerating: generating })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Message actions
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }))
      },

      updateMessage: (messageId, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        }))
      },

      deleteMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId)
        }))
      },

      clearMessages: () => {
        set({ messages: [] })
      },

      // Chat actions
      updateChatSettings: (settings) => {
        set((state) => {
          if (!state.currentChat) return state

          const updatedChat = {
            ...state.currentChat,
            settings: {
              ...state.currentChat.settings,
              ...settings
            }
          }

          return { currentChat: updatedChat }
        })
      },

      updateChatTitle: (title) => {
        set((state) => {
          if (!state.currentChat) return state

          const updatedChat = {
            ...state.currentChat,
            title
          }

          return { currentChat: updatedChat }
        })
      },

      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      toggleCharacterInfo: () => {
        set((state) => ({ showCharacterInfo: !state.showCharacterInfo }))
      },

      toggleWorldInfo: () => {
        set((state) => ({ showWorldInfo: !state.showWorldInfo }))
      },

      // Reset
      reset: () => {
        set({
          currentChat: null,
          messages: [],
          character: null,
          isLoading: false,
          isGenerating: false,
          error: null,
          sidebarOpen: true,
          showCharacterInfo: false,
          showWorldInfo: false,
        })
      },
    })),
    {
      name: 'chat-store',
    }
  )
)