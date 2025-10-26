/**
 * Chat state management using Zustand
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { Chat, Message, Character, ChatSettings, GenerationOptions } from '@sillytavern-clone/shared'

interface ChatState {
  // State
  currentChat: Chat | null
  chats: Chat[]
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
  setSelectedCharacter: (character: Character | null) => void
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
  deleteChat: (chatId: string) => Promise<boolean>
  exportChat: (chatId: string) => Promise<any>

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
      chats: [],
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

      setSelectedCharacter: (character) => {
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

      deleteChat: async (chatId: string) => {
        try {
          const response = await fetch(`/api/chats/${chatId}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('Failed to delete chat')
          }

          set((state) => ({
            chats: state.chats.filter((chat) => chat.id !== chatId),
            currentChat: state.currentChat?.id === chatId ? null : state.currentChat
          }))

          return true
        } catch (error) {
          console.error('Error deleting chat:', error)
          return false
        }
      },

      exportChat: async (chatId: string) => {
        try {
          // Get chat with all messages for export
          const response = await fetch(`/api/chats/${chatId}`)

          if (!response.ok) {
            throw new Error('Failed to fetch chat for export')
          }

          const chat = await response.json()
          
          // Format export data
          const exportData = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            chat: {
              id: chat.id,
              title: chat.title,
              characterId: chat.characterId,
              characterName: chat.characterName,
              createdAt: chat.createdAt,
              updatedAt: chat.updatedAt,
              settings: chat.settings,
              metadata: chat.metadata,
            },
            messages: chat.messages || [],
            branches: chat.branches || [],
          }

          return exportData
        } catch (error) {
          console.error('Error exporting chat:', error)
          throw error
        }
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