/**
 * Chat API service
 */

import axios from 'axios'
import { Chat, Message, CreateChatParams, CreateMessageParams, GenerationOptions, ChatGenerationResponse } from '@sillytavern-clone/shared'
import { API_ENDPOINTS, HTTP_METHODS, HTTP_STATUS } from '@sillytavern-clone/shared'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '', // API_ENDPOINTS already include /api prefix
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      localStorage.removeItem('auth-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface ChatListResponse {
  chats: Chat[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface MessageListResponse {
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class ChatService {
  /**
   * Get list of chats with pagination
   */
  async getChats(params?: {
    page?: number
    limit?: number
    characterId?: string
  }): Promise<ChatListResponse> {
    try {
      const response = await apiClient.get<ChatListResponse>(API_ENDPOINTS.CHATS, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching chats:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Get a specific chat by ID
   */
  async getChat(chatId: string): Promise<Chat> {
    try {
      const response = await apiClient.get<Chat>(API_ENDPOINTS.CHAT_BY_ID(chatId))
      return response.data
    } catch (error) {
      console.error('Error fetching chat:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Create a new chat
   */
  async createChat(params: CreateChatParams): Promise<Chat> {
    try {
      const response = await apiClient.post<Chat>(API_ENDPOINTS.CHATS, params)
      return response.data
    } catch (error) {
      console.error('Error creating chat:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Update an existing chat
   */
  async updateChat(chatId: string, updates: {
    title?: string
    settings?: any
  }): Promise<Chat> {
    try {
      const response = await apiClient.put<Chat>(API_ENDPOINTS.CHAT_BY_ID(chatId), updates)
      return response.data
    } catch (error) {
      console.error('Error updating chat:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Delete a chat
   */
  async deleteChat(chatId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CHAT_BY_ID(chatId))
    } catch (error) {
      console.error('Error deleting chat:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Get messages for a chat
   */
  async getMessages(
    chatId: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<MessageListResponse> {
    try {
      const response = await apiClient.get<MessageListResponse>(
        API_ENDPOINTS.CHAT_MESSAGES(chatId),
        { params }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Add a message to a chat
   */
  async addMessage(chatId: string, params: CreateMessageParams): Promise<Message> {
    try {
      const response = await apiClient.post<Message>(
        API_ENDPOINTS.CHAT_MESSAGES(chatId),
        params
      )
      return response.data
    } catch (error) {
      console.error('Error adding message:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Generate AI response
   */
  async generateResponse(
    chatId: string,
    options?: any // allow clientModel passthrough
  ): Promise<ChatGenerationResponse> {
    try {
      const response = await apiClient.post<ChatGenerationResponse>(
        API_ENDPOINTS.CHAT_GENERATE(chatId),
        options
      )
      return response.data
    } catch (error) {
      console.error('Error generating response:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Regenerate last AI response
   */
  async regenerateResponse(chatId: string): Promise<ChatGenerationResponse> {
    try {
      const response = await apiClient.post<ChatGenerationResponse>(
        API_ENDPOINTS.CHAT_REGENERATE(chatId)
      )
      return response.data
    } catch (error) {
      console.error('Error regenerating response:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Export chat data
   */
  async exportChat(chatId: string, format: 'json' | 'txt' | 'html' = 'json'): Promise<Blob> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CHAT_EXPORT(chatId),
        {
          params: { format },
          responseType: 'blob'
        }
      )
      return response.data
    } catch (error) {
      console.error('Error exporting chat:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Import chat data
   */
  async importChat(file: File, format: string = 'json'): Promise<Chat> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('format', format)

      const response = await apiClient.post<Chat>(
        API_ENDPOINTS.CHAT_IMPORT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error importing chat:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      const message = data?.error || data?.message || `HTTP ${status} error`
      return new Error(message)
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - no response received')
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred')
    }
  }
}

export const chatService = new ChatService()