/**
 * Chat state management using Zustand
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware'
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

  // Generation Settings
  isStreamingEnabled: boolean
  isFastModeEnabled: boolean
  streamingUnsupported: boolean

  // Generation Control
  generationProgress: number // 已等待秒数
  abortController: AbortController | null // 用于取消请求

  // Incomplete Interaction Detection
  incompleteInteractionDetected: boolean // 是否检测到中断
  dismissedIncompleteInteraction: boolean // 用户是否已忽略中断提示

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

  // Generation settings actions
  toggleStreaming: () => void
  setStreaming: (enabled: boolean) => void
  toggleFastMode: () => void
  setFastMode: (enabled: boolean) => void
  setStreamingUnsupported: (flag: boolean) => void

  // Generation control actions
  setGenerationProgress: (seconds: number) => void
  setAbortController: (controller: AbortController | null) => void
  cancelGeneration: () => void
  resetGenerationState: () => void

  // Incomplete interaction actions
  checkForIncompleteInteraction: () => boolean
  dismissIncompleteInteraction: () => void
  resetIncompleteInteraction: () => void

  // Reset
  reset: () => void
}

// Load settings from localStorage
const loadSettings = () => {
  if (typeof window === 'undefined') return { isStreamingEnabled: true, isFastModeEnabled: false }
  
  try {
    const streaming = localStorage.getItem('chat_streaming_enabled')
    const fastMode = localStorage.getItem('chat_fast_mode_enabled')
    
    return {
      isStreamingEnabled: streaming === null ? true : streaming === 'true',
      isFastModeEnabled: fastMode === 'true'
    }
  } catch (error) {
    console.error('Error loading chat settings:', error)
    return { isStreamingEnabled: true, isFastModeEnabled: false }
  }
}

export const useChatStore = create<ChatState>()(
  devtools(
    subscribeWithSelector((set, get) => {
      const settings = loadSettings()
      
      return {
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
        isStreamingEnabled: settings.isStreamingEnabled,
        isFastModeEnabled: settings.isFastModeEnabled,
        streamingUnsupported: false,
        generationProgress: 0,
        abortController: null,
        incompleteInteractionDetected: false,
        dismissedIncompleteInteraction: false,

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
        console.log('[chatStore] addMessage called:', message.id, 'role:', message.role, 'content length:', message.content.length)
        set((state) => ({
          messages: [...state.messages, message]
        }))
      },

      updateMessage: (messageId, updates) => {
        console.log('[chatStore] updateMessage called:', messageId, 'updates:', updates)
        set((state) => {
          const newMessages = state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
          console.log('[chatStore] messages updated, count:', newMessages.length)
          return { messages: newMessages }
        })
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

      // Generation settings actions
      toggleStreaming: () => {
        set((state) => {
          const newValue = !state.isStreamingEnabled
          if (typeof window !== 'undefined') {
            localStorage.setItem('chat_streaming_enabled', String(newValue))
          }
          return { isStreamingEnabled: newValue }
        })
      },

      setStreaming: (enabled) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_streaming_enabled', String(enabled))
        }
        set({ isStreamingEnabled: enabled })
      },

      toggleFastMode: () => {
        set((state) => {
          const newValue = !state.isFastModeEnabled
          if (typeof window !== 'undefined') {
            localStorage.setItem('chat_fast_mode_enabled', String(newValue))
          }
          return { isFastModeEnabled: newValue }
        })
      },

      setFastMode: (enabled) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_fast_mode_enabled', String(enabled))
        }
        set({ isFastModeEnabled: enabled })
      },

      setStreamingUnsupported: (flag) => {
        set({ streamingUnsupported: flag })
      },

      // Generation control actions
      setGenerationProgress: (seconds) => {
        set({ generationProgress: seconds })
      },

      setAbortController: (controller) => {
        set({ abortController: controller })
      },

      cancelGeneration: () => {
        const { abortController } = get()
        if (abortController) {
          abortController.abort()
          set({ abortController: null, isGenerating: false, generationProgress: 0 })
          return
        }

        // Fallback: 如果没有 AbortController，但界面仍显示临时AI消息，直接标记为已取消
        set((state) => {
          const lastTempIndex = [...state.messages]
            .map((m, idx) => ({ m, idx }))
            .reverse()
            .find((x) => typeof x.m.id === 'string' && x.m.id.startsWith('temp-ai-'))?.idx

          if (lastTempIndex !== undefined) {
            const updated = state.messages.map((msg, idx) =>
              idx === lastTempIndex ? { ...msg, content: '[已取消生成]' } : msg
            )
            return {
              messages: updated,
              isGenerating: false,
              generationProgress: 0,
            }
          }

          return { isGenerating: false, generationProgress: 0 }
        })
      },

      resetGenerationState: () => {
        set({ generationProgress: 0, abortController: null })
      },

      // Incomplete interaction actions
      checkForIncompleteInteraction: () => {
        const { messages, isGenerating, currentChat } = get()
        
        // 如果没有对话或正在生成，不检测
        if (!currentChat || isGenerating || messages.length === 0) {
          set({ incompleteInteractionDetected: false })
          return false
        }

        const lastMessage = messages[messages.length - 1]
        
        // 场景A: 最后一条消息是用户消息，没有AI回复
        if (lastMessage.role === 'user') {
          set({ incompleteInteractionDetected: true })
          return true
        }
        
        // 场景B: 最后一条消息是AI消息但内容为空或是临时消息（未完成生成）
        if (lastMessage.role === 'assistant') {
          const isEmpty = !lastMessage.content || lastMessage.content.trim() === ''
          const isTempMessage = lastMessage.id.startsWith('temp-ai-')
          const isFailedMessage = lastMessage.content === '[生成失败]' || lastMessage.content === '[已取消生成]'
          
          if (isEmpty || isTempMessage || isFailedMessage) {
            set({ incompleteInteractionDetected: true })
            return true
          }
        }
        
        set({ incompleteInteractionDetected: false })
        return false
      },

      dismissIncompleteInteraction: () => {
        set({ 
          dismissedIncompleteInteraction: true,
          incompleteInteractionDetected: false
        })
      },

      resetIncompleteInteraction: () => {
        set({ 
          incompleteInteractionDetected: false,
          dismissedIncompleteInteraction: false
        })
      },

      // Reset
      reset: () => {
        const settings = loadSettings()
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
          isStreamingEnabled: settings.isStreamingEnabled,
          isFastModeEnabled: settings.isFastModeEnabled,
          streamingUnsupported: false,
          generationProgress: 0,
          abortController: null,
          incompleteInteractionDetected: false,
          dismissedIncompleteInteraction: false,
        })
      },
    }}),
    {
      name: 'chat-store',
    }
  )
)