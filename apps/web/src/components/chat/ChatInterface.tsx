/**
 * Main chat interface component
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Settings, User, Plus, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/stores/chatStore'
import { chatService } from '@/services/chatService'
import { useCharacterStore } from '@/stores/characterStore'
import { useCreativeStore } from '@/stores/creativeStore'
import { useAIModelStore } from '@/stores/aiModelStore'
import { Message, CreateMessageParams, Character } from '@sillytavern-clone/shared'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import ChatControlBar from './ChatControlBar'
import CharacterModal from '../character/CharacterModal'
import RetryDialog from './RetryDialog'
import toast from 'react-hot-toast'
import { useTranslation } from '@/lib/i18n'

interface ChatInterfaceProps {
  characterId?: string | null
}

export default function ChatInterface({ characterId }: ChatInterfaceProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const {
    currentChat,
    messages,
    character,
    isLoading,
    isGenerating,
    error,
    isStreamingEnabled,
    isFastModeEnabled,
    generationProgress,
    streamingUnsupported,
    incompleteInteractionDetected,
    dismissedIncompleteInteraction,
    setCurrentChat,
    setCharacter,
    setLoading,
    setGenerating,
    setError,
    clearError,
    addMessage,
    updateMessage,
    clearMessages,
    setGenerationProgress,
    setAbortController,
    resetGenerationState,
    setStreamingUnsupported,
    checkForIncompleteInteraction,
    dismissIncompleteInteraction,
    resetIncompleteInteraction,
    reset
  } = useChatStore()

  // Calculate canGenerate directly in component to ensure proper reactivity
  const canGenerate = !isGenerating && currentChat !== null && character !== null

  const { characters, createCharacter } = useCharacterStore()
  const {
    storyAdvance,
    povMode,
    sceneTransitionOnce,
    consumeOneShots,
    hydrateFromLocalStorage: hydrateCreativeIntent,
  } = useCreativeStore()
  const { activeModel, fetchModels, hydrated } = useAIModelStore()
  const hasActiveModel = activeModel !== null
  const isModelConfigured = Boolean(
    hydrated &&
    activeModel &&
    (activeModel as any).provider &&
    (activeModel as any).model &&
    (((activeModel as any).provider === 'local') || Boolean((activeModel as any).apiKey))
  )

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [modelsInitialized, setModelsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sendingRef = useRef(false)
  const autoOpenModelDrawerRef = useRef(false)
  const [appSettings, setAppSettings] = useState<{ userName?: string; autoSendGreeting?: boolean; openerTemplate?: string }>({})
  
  // Retry dialog state
  const [showRetryDialog, setShowRetryDialog] = useState(false)
  const [retryError, setRetryError] = useState<{ message: string; type: 'timeout' | 'network' | 'server' | 'cancelled' }>({ message: '', type: 'timeout' })
  const [retryCount, setRetryCount] = useState(0)
  const [pendingRetryAction, setPendingRetryAction] = useState<(() => Promise<void>) | null>(null)
  const maxRetries = 3

  // Debug: log state changes
  useEffect(() => {
    console.log('[ChatInterface] State updated:', {
      hasCurrentChat: !!currentChat,
      hasCharacter: !!character,
      characterName: character?.name,
      messageCount: messages.length,
      canGenerate,
      isLoading,
      isGenerating
    })
  }, [currentChat, character, messages.length, canGenerate, isLoading, isGenerating])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  }

  // Manual scroll to bottom handler
  const handleScrollToBottom = () => {
    scrollToBottom(true)
    toast.success('已跳转到对话底部', { duration: 1000 })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load AI models on mount to ensure we have the active model
  useEffect(() => {
    // hydrate creative intent from localStorage once
    try { hydrateCreativeIntent() } catch {}
    const loadModels = async () => {
      await fetchModels()
      setModelsInitialized(true)
    }
    loadModels()
  }, [])

  // Auto-create chat if none exists and we have a model
  useEffect(() => {
    const autoCreateChat = async () => {
      // Only auto-create if:
      // 1. Models are initialized
      // 2. We have an active model
      // 3. We don't have a current chat
      // 4. Store is hydrated
      if (modelsInitialized && hydrated && isModelConfigured && !currentChat && !characterId) {
        console.log('[ChatInterface] Auto-creating initial chat...')
        await handleNewChat()
      }
    }

    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(autoCreateChat, 500)
    return () => clearTimeout(timer)
  }, [modelsInitialized, hydrated, isModelConfigured, currentChat, characterId])

  // 首次进入且未配置模型时，自动打开设置抽屉（仅一次）
  useEffect(() => {
    if (hydrated && !isModelConfigured && !autoOpenModelDrawerRef.current) {
      autoOpenModelDrawerRef.current = true
      window.dispatchEvent(new CustomEvent('open-settings'))
    }
  }, [hydrated, isModelConfigured])

  // Listen for new chat event from sidebar
  useEffect(() => {
    const handleCreateNewChat = () => {
      handleNewChat()
    }

    window.addEventListener('create-new-chat', handleCreateNewChat)
    return () => {
      window.removeEventListener('create-new-chat', handleCreateNewChat)
    }
  }, [hasActiveModel, characters, activeModel])

  // Load app settings from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('app_settings')
      if (raw) {
        setAppSettings(JSON.parse(raw))
      }
    } catch {}
  }, [])

  // Handle character selection from URL parameter
  useEffect(() => {
    // Skip if characterId is not present - prevent re-triggering after URL cleanup
    if (!characterId) {
      return
    }

    const loadCharacterAndCreateChat = async () => {
      console.log('[ChatInterface] Loading character - State:', {
        characterId,
        modelsInitialized,
        hydrated,
        hasActiveModel,
        activeModel: activeModel ? { id: activeModel.id, name: activeModel.name, provider: activeModel.provider } : null
      })
      
      // Wait for models to be initialized first
      if (!modelsInitialized) {
        console.log('[ChatInterface] Waiting for models to initialize...')
        return
      }
      
      // Wait for store hydration to avoid false negatives
      if (!hydrated) {
        console.log('[ChatInterface] Waiting for store hydration...')
        return
      }
      // Check if we have an active model (from localStorage)
      if (!hasActiveModel || !activeModel) {
        console.error('[ChatInterface] No active model configured!', { hasActiveModel, activeModel })
        toast.error(t('chat.chatInterface.noModel'))
        // 打开右侧设置抽屉，而不是跳转页面
        window.dispatchEvent(new CustomEvent('open-settings'))
        return
      }
      
      console.log('[ChatInterface] All checks passed, loading character...')

      try {
        setLoading(true)

        // Fetch character data from API
        const response = await fetch(`/api/characters/${characterId}`)
        if (!response.ok) {
          throw new Error('Failed to load character')
        }
        
        const characterData = await response.json()
        console.log('[ChatInterface] Character data loaded:', characterData.name)

        // Check if there's an existing chat for this character
        const chatsResponse = await fetch(`/api/chats?characterId=${characterId}&limit=1`)
        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json()
          if (chatsData.chats && Array.isArray(chatsData.chats) && chatsData.chats.length > 0) {
            // Load the most recent chat for this character
            const existingChat = chatsData.chats[0]
            
            // Load messages for this chat
            const messagesResponse = await fetch(`/api/chats/${existingChat.id}/messages`)
            let loadedMessages: Message[] = []
            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json()
              if (messagesData.messages && Array.isArray(messagesData.messages)) {
                loadedMessages = messagesData.messages
              }
            }
            
            // Update state in correct order: setCurrentChat clears messages and character
            // So we must call it first, then set character and messages
            setCurrentChat(existingChat)
            setCharacter(characterData)
            loadedMessages.forEach((msg: Message) => addMessage(msg))
            
            console.log('[ChatInterface] Loaded existing chat with', loadedMessages.length, 'messages')
            console.log('[ChatInterface] State after loading:', {
              hasChat: !!existingChat,
              hasCharacter: !!characterData,
              characterName: characterData.name,
              messageCount: loadedMessages.length
            })
            toast.success(t('chat.chatInterface.chatLoaded', { name: characterData.name }))
            return
          }
        }

        // Create new chat if no existing chat found
        const newChat = await chatService.createChat({
          title: `与 ${characterData.name} 的对话 - ${new Date().toLocaleString('zh-CN', { 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}`,
          characterId: characterData.id,
          settings: {
            modelId: activeModel.id
          }
        })

        console.log('[ChatInterface] Created new chat:', newChat.id)
        
        // Set chat first (which clears character and messages), then set character
        setCurrentChat(newChat)
        setCharacter(characterData)

        // Auto-send greeting if enabled
        const flagsEnabled = (process.env.NEXT_PUBLIC_ST_PARITY_GREETING_ENABLED ?? 'true') !== 'false'
        const shouldAutoSend = flagsEnabled && appSettings.autoSendGreeting !== false
        const greeting = characterData.firstMessage || ''
        if (shouldAutoSend && greeting && typeof greeting === 'string' && greeting.trim()) {
          const greetMsg = await chatService.addMessage(newChat.id, {
            role: 'assistant',
            content: greeting.trim(),
          })
          addMessage(greetMsg)
        }

        const template = (appSettings.openerTemplate || '').trim()
        if (template) {
          const substituted = template
            .replace(/\{\{user\}\}/g, appSettings.userName || 'User')
            .replace(/\{\{char\}\}/g, characterData.name)
            .replace(/\{\{scenario\}\}/g, characterData.background || characterData.scenario || '')
          setInputValue(substituted)
          inputRef.current?.focus()
        }

        console.log('[ChatInterface] State after creating new chat:', {
          hasChat: !!newChat,
          hasCharacter: !!characterData,
          characterName: characterData.name
        })
        toast.success(t('chat.chatInterface.chatCreated', { name: characterData.name }))

      } catch (error) {
        console.error('Error loading character and creating chat:', error)
        toast.error(t('chat.chatInterface.loadCharacterFailed'))
        setTimeout(() => router.replace('/characters'), 100)
      } finally {
        setLoading(false)
      }
    }

    loadCharacterAndCreateChat()
  }, [characterId, modelsInitialized, hydrated, hasActiveModel, activeModel, router, setCharacter, setCurrentChat, setLoading, addMessage, clearMessages, appSettings])

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!isModelConfigured) {
      toast.error(t('chat.chatInterface.noModel'))
      window.dispatchEvent(new CustomEvent('open-settings'))
      return
    }
    if (sendingRef.current) {
      return
    }
    if (!content.trim() || !currentChat || !character || isGenerating) {
      return
    }

    try {
      sendingRef.current = true
      clearError()
      setInputValue('')
      setIsTyping(true)
      setGenerating(true)

      // Create user message
      const userMessage: CreateMessageParams = {
        content: content.trim(),
        role: 'user'
      }

      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId: currentChat.id,
        role: 'user',
        content: content.trim(),
        timestamp: new Date()
      }
      addMessage(tempUserMessage)

      // Send message to API
      const createdMessage = await chatService.addMessage(currentChat.id, userMessage)

      // Replace temp message with real one
      updateMessage(tempUserMessage.id, createdMessage)

      // Generate AI response
      await generateAIResponse()

    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
      toast.error('Failed to send message')
    } finally {
      setIsTyping(false)
      setGenerating(false)
      sendingRef.current = false
    }
  }

  // Generate AI response with retry support
  const generateAIResponse = async (currentRetryCount: number = 0) => {
    try {
      const clientModel = activeModel
        ? {
            provider: activeModel.provider,
            model: activeModel.model,
            apiKey: activeModel.apiKey,
            baseUrl: activeModel.baseUrl,
            settings: activeModel.settings || {},
          }
        : undefined

      // 关键修复：添加配置验证
      if (!clientModel?.model) {
        console.error('[ChatInterface] Invalid model config - missing model:', clientModel)
        toast.error('模型配置不完整：缺少模型名称')
        resetGenerationState()
        return
      }
      
      if (!clientModel?.apiKey && clientModel?.provider !== 'local') {
        console.error('[ChatInterface] Invalid model config - missing API key:', clientModel)
        toast.error('模型配置不完整：缺少 API 密钥，请重新配置')
        resetGenerationState()
        // 尝试重新加载模型
        try {
          await fetchModels()
        } catch (e) {
          console.error('[ChatInterface] Failed to refresh models:', e)
        }
        return
      }

      // Decide streaming based on user setting and capability detection
      const shouldStream = isStreamingEnabled && !streamingUnsupported
      const creativeDirectives = {
        storyAdvance: Boolean(storyAdvance),
        povMode: povMode || null,
        sceneTransitionOnce: Boolean(sceneTransitionOnce),
      }
      if (shouldStream) {
        // Create a temporary message for streaming updates
        const tempMessageId = `temp-ai-${Date.now()}`
        const tempMessage: Message = {
          id: tempMessageId,
          chatId: currentChat!.id,
          role: 'assistant',
          content: '',
          timestamp: new Date()
        }
        addMessage(tempMessage)

        // Create abort controller (keep it in store so cancel button can abort)
        const abortController = new AbortController()
        setAbortController(abortController)

        // Reset only progress at start; do NOT clear abortController here
        setGenerationProgress(0)

        await chatService.generateResponseStreaming(currentChat!.id, {
          modelId: activeModel?.id,
          clientModel,
          fastMode: isFastModeEnabled,
          creativeDirectives,
          timeout: 120000, // 120秒超时
          abortSignal: abortController.signal,
          onProgress: (elapsedSeconds: number) => {
            setGenerationProgress(elapsedSeconds)
            
            // 30秒后显示提醒
            if (elapsedSeconds === 30) {
              toast('正在处理中，请稍候...', { 
                duration: 3000,
                icon: '⏳'
              })
            }
            
            // 60秒后再次提醒
            if (elapsedSeconds === 60) {
              toast('模型响应时间较长，正在努力生成中...', { 
                duration: 3000,
                icon: '🤖'
              })
            }
          },
          onChunk: (chunk: string, fullContent: string) => {
            // Update the temporary message with new content
            console.log('[ChatInterface] onChunk called, fullContent length:', fullContent.length)
            updateMessage(tempMessageId, { content: fullContent })
          },
          onComplete: (message: Message) => {
            // Replace temporary message with final one
            updateMessage(tempMessageId, message)
            resetGenerationState()
            setRetryCount(0) // Reset retry count on success
            // 消费一次性指令
            try { consumeOneShots() } catch {}
          },
          onError: (error: string, errorType?: 'timeout' | 'cancelled' | 'network' | 'server') => {
            resetGenerationState()
            
            // 处理取消操作
            if (errorType === 'cancelled') {
              updateMessage(tempMessageId, { content: '[已取消生成]' })
              toast('已取消生成', { icon: '⏹️' })
              return
            }
            
            // 处理其他错误 - 默认为 server 错误
            const finalErrorType = errorType as 'timeout' | 'network' | 'server' | 'cancelled' || 'server'
            setRetryError({ message: error, type: finalErrorType })
            
            // 如果还能重试，显示重试对话框（cancelled 已在上面return了）
            if (currentRetryCount < maxRetries) {
              setRetryCount(currentRetryCount)
              setShowRetryDialog(true)
              setPendingRetryAction(() => async () => {
                setShowRetryDialog(false)
                // 移除失败的临时消息
                updateMessage(tempMessageId, { content: '' })
                await generateAIResponse(currentRetryCount + 1)
              })
            } else {
              // 已达到最大重试次数
              setError(error)
              toast.error(currentRetryCount >= maxRetries ? '已达到最大重试次数' : error)
              updateMessage(tempMessageId, { content: '[生成失败]' })
            }
          },
          onFallback: () => {
            // 一次会话内记住不支持流式
            setStreamingUnsupported(true)
          }
        })
      } else {
        // Non-streaming with unified UI and cancel support
        const tempMessageId = `temp-ai-${Date.now()}`
        const tempMessage: Message = {
          id: tempMessageId,
          chatId: currentChat!.id,
          role: 'assistant',
          content: '',
          timestamp: new Date()
        }
        addMessage(tempMessage)

        const abortController = new AbortController()
        setAbortController(abortController)
        // Reset only progress at start; do NOT clear abortController here
        setGenerationProgress(0)

        const startedAt = Date.now()
        const progressInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startedAt) / 1000)
          setGenerationProgress(elapsed)
        }, 1000)

        try {
          const response = await chatService.generateResponse(currentChat!.id, {
            modelId: activeModel?.id,
            clientModel,
            fastMode: isFastModeEnabled,
          creativeDirectives,
            abortSignal: abortController.signal,
          })

          updateMessage(tempMessageId, response.message)
          resetGenerationState()
          setRetryCount(0)
        // 消费一次性指令
        try { consumeOneShots() } catch {}
        } catch (e: any) {
          resetGenerationState()
          if (e?.message === 'CANCELLED_GENERATION') {
            updateMessage(tempMessageId, { content: '[已取消生成]' })
            toast('已取消生成', { icon: '⏹️' })
          } else {
            setError(e?.message || '生成失败')
            toast.error(e?.message || '生成失败')
            updateMessage(tempMessageId, { content: '[生成失败]' })
          }
        } finally {
          clearInterval(progressInterval)
        }
      }

    } catch (error) {
      console.error('Error generating response:', error)
      resetGenerationState()
      
      // 不自动重试 catch 的错误，因为通常是代码层面的问题
      setError('Failed to generate AI response')
      toast.error('Failed to generate AI response')
    }
  }

  // Handle retry action
  const handleRetry = async () => {
    if (pendingRetryAction) {
      setShowRetryDialog(false)
      await pendingRetryAction()
      setPendingRetryAction(null)
    }
  }

  // Handle cancel retry
  const handleCancelRetry = () => {
    setShowRetryDialog(false)
    setPendingRetryAction(null)
    setRetryCount(0)
    setGenerating(false)
    toast('已取消重试', { icon: '❌' })
  }

  // Handle continuing incomplete interaction
  const handleContinueIncomplete = async () => {
    if (!currentChat || !character || isGenerating) {
      return
    }

    try {
      clearError()
      setGenerating(true)
      resetIncompleteInteraction()

      // 检查最后一条消息
      const lastMessage = messages[messages.length - 1]
      
      if (lastMessage?.role === 'user') {
        // 场景A: 最后一条是用户消息，直接生成AI回复
        await generateAIResponse()
      } else if (lastMessage?.role === 'assistant') {
        // 场景B: 最后一条是AI消息但未完成，先删除再重新生成
        const previousUserMessages = messages.filter(m => m.role === 'user')
        if (previousUserMessages.length > 0) {
          // 删除未完成的AI消息
          updateMessage(lastMessage.id, { content: '' })
          // 重新生成
          await generateAIResponse()
        }
      }

      toast.success('正在继续生成回复...')
    } catch (error) {
      console.error('Error continuing incomplete interaction:', error)
      setError('继续生成失败')
      toast.error('继续生成失败')
    } finally {
      // 确保结束继续生成流程时关闭 Loading 状态
      setGenerating(false)
    }
  }

  // Handle dismissing incomplete interaction prompt
  const handleDismissIncomplete = () => {
    dismissIncompleteInteraction()
    toast('已忽略中断提示', { icon: '👌' })
  }

  // Handle regenerating the last response
  const handleRegenerate = async () => {
    if (!isModelConfigured) {
      toast.error(t('chat.chatInterface.noModel'))
      window.dispatchEvent(new CustomEvent('open-settings'))
      return
    }
    if (!currentChat || !character || isGenerating) return

    try {
      clearError()
      setGenerating(true)

      // Prepare model options (keep parity with generate flow)
      const clientModel = activeModel
        ? {
            provider: activeModel.provider,
            model: activeModel.model,
            apiKey: activeModel.apiKey,
            baseUrl: activeModel.baseUrl,
            settings: activeModel.settings || {},
          }
        : undefined

      // Optimistically clear last assistant content while waiting
      const assistantMessages = messages.filter((msg) => msg.role === 'assistant')
      const lastMessage = assistantMessages[assistantMessages.length - 1]
      if (lastMessage) {
        updateMessage(lastMessage.id, {
          content: '',
          metadata: { ...lastMessage.metadata, isRegenerated: true }
        })
      }

      // Non-streaming regenerate with extended timeout (server also supports streaming if later needed)
      const response = await chatService.regenerateResponse(
        currentChat.id,
        {
          modelId: activeModel?.id,
          clientModel,
          fastMode: isFastModeEnabled,
          creativeDirectives: {
            storyAdvance: Boolean(storyAdvance),
            povMode: povMode || null,
            sceneTransitionOnce: Boolean(sceneTransitionOnce),
          },
        },
        300000 // 5min timeout for long generations
      )

      // Update or add the regenerated message
      if (lastMessage) {
        updateMessage(lastMessage.id, response.message)
      } else {
        addMessage(response.message)
      }

      // 消费一次性指令
      try { consumeOneShots() } catch {}

    } catch (error) {
      console.error('Error regenerating response:', error)
      setError('Failed to regenerate response')
      toast.error('Failed to regenerate response')
    } finally {
      setGenerating(false)
    }
  }

  // Regenerate starting from a specific assistant message (branching fallback)
  const handleRegenerateFromMessage = async (messageId: string) => {
    if (!currentChat || !character || isGenerating) return

    try {
      const idx = messages.findIndex(m => m.id === messageId)
      if (idx === -1) return
      const target = messages[idx]
      if (target.role !== 'assistant') return

      // If it is the last assistant message, reuse existing handler
      const lastAssistant = [...messages].filter(m => m.role === 'assistant').pop()
      if (lastAssistant && lastAssistant.id === messageId) {
        await handleRegenerate()
        return
      }

      // Find the nearest previous user message to preserve context up to it
      let prevUserIndex = -1
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i].role === 'user') { prevUserIndex = i; break }
      }
      if (prevUserIndex === -1) {
        // No previous user message; fallback to start
        prevUserIndex = -1
      }

      const preserved = prevUserIndex >= 0 ? messages.slice(0, prevUserIndex + 1) : []

      // Create a new chat as a branch
      const branchTitle = `${currentChat.title} · 分支 @ ${new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`
      const newChat = await chatService.createChat({
        title: branchTitle,
        characterId: character.id,
        settings: { modelId: activeModel?.id }
      })

      // Switch UI to new chat and character
      setCurrentChat(newChat)
      setCharacter(character)

      // Rebuild history up to the preserved boundary
      for (const msg of preserved) {
        const created = await chatService.addMessage(newChat.id, {
          content: msg.content,
          role: msg.role,
          metadata: msg.metadata || {}
        })
        addMessage(created)
      }

      toast.success('已创建分支，会在该处重新生成')
      // Generate fresh assistant reply on the branch using current directives
      await generateAIResponse()
    } catch (error) {
      console.error('Error branching regenerate:', error)
      toast.error('分支再生失败')
    }
  }

  // Create new chat
  const handleNewChat = async () => {
    // Check if we have an active model configured (from localStorage)
    if (!isModelConfigured) {
      toast.error(t('chat.chatInterface.noModel'))
      // 打开右侧设置抽屉，而不是跳转页面
      window.dispatchEvent(new CustomEvent('open-settings'))
      return
    }

    try {
      setLoading(true)

      // Get or create a default character
      let characterToUse = characters[0]
      
      if (!characterToUse) {
        // First, try to find existing AI Assistant character to avoid 409 conflict
        console.log('[ChatInterface] No characters found, searching for existing AI Assistant...')
        try {
          const response = await fetch('/api/characters?search=AI Assistant&limit=1')
          if (response.ok) {
            const data = await response.json()
            if (data.characters && data.characters.length > 0) {
              characterToUse = data.characters[0]
              console.log('[ChatInterface] Using existing AI Assistant character:', characterToUse.id)
            }
          }
        } catch (err) {
          console.error('[ChatInterface] Failed to fetch existing character:', err)
        }
        
        // Only create if not found
        if (!characterToUse) {
          console.log('[ChatInterface] Creating new AI Assistant character...')
          const newCharacter = await createCharacter({
            name: 'AI Assistant',
            description: 'A helpful AI assistant',
            personality: 'Helpful, friendly, and knowledgeable',
            firstMessage: 'Hello! How can I help you today?',
            background: 'An AI assistant designed to help with various tasks and questions.',
            exampleMessages: [
              "I can help you with a wide range of topics. What would you like to know?",
              "Feel free to ask me anything! I'm here to assist you.",
              "What's on your mind today? I'm ready to help!"
            ],
            tags: ['assistant', 'helpful', 'ai'],
          })

          if (newCharacter) {
            characterToUse = newCharacter
          } else {
            throw new Error('Failed to create default character')
          }
        }
      }

      const newChat = await chatService.createChat({
        title: `与 ${characterToUse.name} 的对话 - ${new Date().toLocaleString('zh-CN', { 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
        characterId: characterToUse.id,
        settings: {
          modelId: activeModel?.id || undefined
        }
      })

      setCurrentChat(newChat)
      setCharacter(characterToUse)
      toast.success(t('chat.chatInterface.newChatCreated'))

      // ST parity: auto-send greeting and prefill opener
      const flagsEnabled = (process.env.NEXT_PUBLIC_ST_PARITY_GREETING_ENABLED ?? 'true') !== 'false'
      const shouldAutoSend = flagsEnabled && appSettings.autoSendGreeting !== false
      const greeting = characterToUse.firstMessage || ''
      if (shouldAutoSend && greeting && typeof greeting === 'string' && greeting.trim()) {
        const greetMsg = await chatService.addMessage(newChat.id, {
          role: 'assistant',
          content: greeting.trim(),
        })
        addMessage(greetMsg)
      }

      const template = (appSettings.openerTemplate || '').trim()
      if (template) {
        const substituted = template
          .replace(/\{\{user\}\}/g, appSettings.userName || 'User')
          .replace(/\{\{char\}\}/g, characterToUse.name)
          .replace(/\{\{scenario\}\}/g, characterToUse.background || characterToUse.scenario || '')
        setInputValue(substituted)
        inputRef.current?.focus()
      }

    } catch (error) {
      console.error('Error creating chat:', error)
      setError(t('chat.chatInterface.createChatFailed'))
      toast.error(t('chat.chatInterface.createChatFailedRetry'))
    } finally {
      setLoading(false)
    }
  }

  // Handle character selection
  const handleCharacterSelect = (character: any) => {
    setCharacter(character)
    toast.success(`Switched to ${character.name}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader
        chat={currentChat}
        character={character}
        onNewChat={handleNewChat}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
            <div className="max-w-md w-full">
              {/* 首次使用引导 - 未配置 AI 模型（等到 store hydration 完成再判断） */}
              {hydrated && !isModelConfigured && (
                <div className="mb-6 bg-amber-900/20 border-2 border-amber-600/50 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-amber-400 mb-2">欢迎使用 SillyTavern！</h3>
                      <p className="text-gray-300 text-sm mb-4">
                        在开始对话前，您需要先配置一个 AI 模型。我们支持 OpenAI、Anthropic、Google 以及本地模型（如 Ollama）。
                      </p>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                        className="tavern-button inline-flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        前往配置 AI 模型
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 常规欢迎界面 */}
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">{t('chat.chatInterface.selectOrCreate')}</h3>
                <p className="text-sm mb-4">
                  {!hasActiveModel 
                    ? t('chat.chatInterface.configureModelFirst')
                    : t('chat.chatInterface.selectOrCreateChat')}
                </p>
                <button
                  onClick={handleNewChat}
                  disabled={isLoading || !isModelConfigured}
                  className="tavern-button inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!isModelConfigured ? t('chat.chatInterface.noModel') : ''}
                >
                  <Plus className="w-4 h-4" />
                  新对话
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 未配置提示（在已有对话时也进行提示） */}
            {hydrated && !isModelConfigured && (
              <div className="mx-4 mt-3 mb-0 bg-amber-900/20 border border-amber-700/60 text-amber-200 rounded px-3 py-2 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-amber-400" />
                <div className="flex-1">
                  <div className="font-medium mb-0.5">未检测到有效的 AI 模型配置</div>
                  <div className="opacity-90">请先完成 AI 模型配置（API 地址、Key、模型ID），完成后再开始对话。</div>
                </div>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                  className="tavern-button-secondary text-xs px-2 py-1"
                >
                  打开配置
                </button>
              </div>
            )}
            {/* Message List */}
            <div className="flex-1 overflow-y-auto tavern-scrollbar p-4">
              <MessageList
                messages={messages}
                isLoading={isGenerating}
                showIncompletePrompt={incompleteInteractionDetected && !dismissedIncompleteInteraction}
                onContinueIncomplete={handleContinueIncomplete}
                onDismissIncomplete={handleDismissIncomplete}
              onRegenerateMessage={handleRegenerateFromMessage}
              onScrollToBottom={handleScrollToBottom}
              />
              <div ref={messagesEndRef} />
            </div>

            {/* Control Bar */}
            <ChatControlBar
              onScrollToBottom={handleScrollToBottom}
              onRegenerate={handleRegenerate}
              showRegenerate={messages.length > 0 && messages.some(m => m.role === 'assistant')}
              disabled={!canGenerate || isLoading || !isModelConfigured}
              onCheckIncomplete={() => {
                // 检测后自动滚动到底部，以便看到提示
                setTimeout(handleScrollToBottom, 100)
              }}
            />

            {/* Message Input */}
            <div className="border-t border-gray-800 p-4">
              <MessageInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendMessage}
                disabled={!canGenerate || isLoading || !isModelConfigured}
                placeholder={
                  !character
                    ? 'Select a character to start chatting'
                    : !isModelConfigured
                    ? 'Select an AI model to start chatting'
                    : 'Type your message...'
                }
              />
            </div>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Retry Dialog */}
      <RetryDialog
        isOpen={showRetryDialog}
        errorType={retryError.type}
        errorMessage={retryError.message}
        retryCount={retryCount}
        maxRetries={maxRetries}
        onRetry={handleRetry}
        onCancel={handleCancelRetry}
      />
    </div>
  )
}