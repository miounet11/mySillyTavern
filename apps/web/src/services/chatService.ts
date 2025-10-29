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
        options || {},
        options?.abortSignal ? { signal: options.abortSignal as AbortSignal } : undefined
      )
      return response.data
    } catch (error) {
      console.error('Error generating response:', error)
      // 标准化取消错误
      const err: any = error
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.message === 'canceled') {
        throw new Error('CANCELLED_GENERATION')
      }
      throw this.handleError(error)
    }
  }

  /**
   * Generate AI response with streaming
   */
  async generateResponseStreaming(
    chatId: string,
    options: {
      modelId?: string
      clientModel?: any
      fastMode?: boolean
      creativeDirectives?: any
      timeout?: number // 超时时间（毫秒），默认180秒
      abortSignal?: AbortSignal // 外部取消信号
      onChunk?: (chunk: string, fullContent: string) => void
      onComplete?: (message: Message) => void
      onError?: (error: string, errorType?: 'timeout' | 'cancelled' | 'network' | 'server') => void
      onProgress?: (elapsedSeconds: number) => void // 进度回调
      onFallback?: () => void // 当检测到不支持SSE时回退的通知
    }
  ): Promise<void> {
    const timeoutMs = options.timeout || 180000 // 默认180秒（3分钟），适配 grok-3 复杂场景
    const controller = new AbortController()
    let timeoutId: NodeJS.Timeout | null = null
    let progressInterval: NodeJS.Timeout | null = null
    const startTime = Date.now()

    try {
      // 合并外部取消信号
      if (options.abortSignal) {
        options.abortSignal.addEventListener('abort', () => {
          controller.abort()
        })
      }

      // 设置超时
      timeoutId = setTimeout(() => {
        controller.abort()
      }, timeoutMs)

      // 进度报告（每秒更新）
      if (options.onProgress) {
        progressInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          options.onProgress?.(elapsed)
        }, 1000)
      }

      const sanitizedOptions = {
        modelId: options.modelId,
        fastMode: options.fastMode,
        creativeDirectives: options.creativeDirectives || null,
        timeoutMs,
        hasAbortSignal: !!options.abortSignal,
        clientModel: options.clientModel
          ? {
              provider: options.clientModel.provider,
              model: options.clientModel.model,
              baseUrl: options.clientModel.baseUrl,
              hasApiKey: Boolean(options.clientModel.apiKey),
            }
          : null,
      }
      console.log('[chatService] generateResponseStreaming payload:', sanitizedOptions)

      const response = await fetch(API_ENDPOINTS.CHAT_GENERATE(chatId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          streaming: true, // 确保启用流式（API 期望 "streaming" 参数）
          creativeDirectives: options.creativeDirectives || null,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 检测 Content-Type 是否为 SSE
      const contentType = response.headers.get('content-type')?.toLowerCase() || ''
      const isSSE = contentType.includes('text/event-stream')
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      // 若不是 SSE 或无法读取 body，则回退为非流
      if (!isSSE || !reader) {
        try {
          options.onFallback?.()
          const nonStream = await this.generateResponse(chatId, {
            modelId: options.modelId,
            clientModel: options.clientModel,
            fastMode: options.fastMode,
            abortSignal: controller.signal,
          })
          if ((nonStream as any)?.message) {
            options.onComplete?.((nonStream as any).message)
            return
          }
          // 如果服务端返回结构异常，走错误分支
          options.onError?.('服务器未返回有效消息', 'server')
          return
        } catch (e: any) {
          if (e?.message === 'CANCELLED_GENERATION') {
            options.onError?.('已取消生成', 'cancelled')
          } else {
            options.onError?.(e?.message || '服务器错误', 'server')
          }
          throw e
        }
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.error) {
                options.onError?.(data.error, 'server')
                return
              }

              if (data.done) {
                if (data.message) {
                  options.onComplete?.(data.message)
                }
                return
              }

              if (data.content) {
                options.onChunk?.(data.content, data.fullContent)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streaming generation:', error)
      
      // 判断错误类型
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // 检查是超时还是手动取消
          const elapsed = Date.now() - startTime
          if (elapsed >= timeoutMs - 100) { // 容忍100ms误差
            const errorMsg = `请求超时 (${Math.floor(timeoutMs / 1000)}秒)，模型响应时间较长`
            options.onError?.(errorMsg, 'timeout')
          } else {
            options.onError?.('已取消生成', 'cancelled')
          }
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          options.onError?.('网络连接失败，请检查网络后重试', 'network')
        } else {
          options.onError?.(error.message, 'server')
        }
      } else {
        options.onError?.('Unknown error', 'server')
      }
      
      throw this.handleError(error)
    } finally {
      // 清理定时器
      if (timeoutId) clearTimeout(timeoutId)
      if (progressInterval) clearInterval(progressInterval)
    }
  }

  /**
   * Regenerate last AI response
   */
  async regenerateResponse(
    chatId: string,
    options?: any,
    timeoutMs: number = 300000 // 默认 5 分钟，避免长回复超时
  ): Promise<ChatGenerationResponse> {
    try {
      const response = await apiClient.post<ChatGenerationResponse>(
        API_ENDPOINTS.CHAT_REGENERATE(chatId),
        options || {},
        { timeout: timeoutMs }
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