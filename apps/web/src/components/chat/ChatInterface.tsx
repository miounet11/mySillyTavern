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
import { useAIModelStore } from '@/stores/aiModelStore'
import { Message, CreateMessageParams, Character } from '@sillytavern-clone/shared'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import CharacterModal from '../character/CharacterModal'
import toast from 'react-hot-toast'

interface ChatInterfaceProps {
  characterId?: string | null
}

export default function ChatInterface({ characterId }: ChatInterfaceProps) {
  const router = useRouter()
  const {
    currentChat,
    messages,
    character,
    isLoading,
    isGenerating,
    error,
    canGenerate,
    setCurrentChat,
    setCharacter,
    setLoading,
    setGenerating,
    setError,
    clearError,
    addMessage,
    updateMessage,
    clearMessages,
    reset
  } = useChatStore()

  const { characters, createCharacter } = useCharacterStore()
  const { activeModel, fetchModels, hydrated } = useAIModelStore()
  const hasActiveModel = activeModel !== null

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [modelsInitialized, setModelsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [appSettings, setAppSettings] = useState<{ userName?: string; autoSendGreeting?: boolean; openerTemplate?: string }>({})

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load AI models on mount to ensure we have the active model
  useEffect(() => {
    const loadModels = async () => {
      await fetchModels()
      setModelsInitialized(true)
    }
    loadModels()
  }, [])

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
      
      if (!characterId) {
        console.log('[ChatInterface] No characterId in URL')
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
        toast.error('请先配置 AI 模型')
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
        setCharacter(characterData)

        // Check if there's an existing chat for this character
        const chatsResponse = await fetch(`/api/chats?characterId=${characterId}&limit=1`)
        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json()
          if (chatsData.chats && chatsData.chats.length > 0) {
            // Load the most recent chat for this character
            const existingChat = chatsData.chats[0]
            setCurrentChat(existingChat)
            
            // Load messages for this chat
            const messagesResponse = await fetch(`/api/chats/${existingChat.id}/messages`)
            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json()
              // Clear existing messages and add new ones
              clearMessages()
              messagesData.messages.forEach((msg: Message) => addMessage(msg))
            }
            
            toast.success(`已加载与 ${characterData.name} 的对话`)
            // Clean up URL parameter
            router.replace('/chat')
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

        setCurrentChat(newChat)
        toast.success(`已创建与 ${characterData.name} 的新对话`)

        // Auto-send greeting if enabled
        const flagsEnabled = (process.env.NEXT_PUBLIC_ST_PARITY_GREETING_ENABLED ?? 'true') !== 'false'
        const shouldAutoSend = flagsEnabled && appSettings.autoSendGreeting !== false
        const greeting = characterData.firstMessage || ''
        if (shouldAutoSend && greeting.trim()) {
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

        // Clean up URL parameter
        router.replace('/chat')

      } catch (error) {
        console.error('Error loading character and creating chat:', error)
        toast.error('加载角色失败，请重试')
        router.replace('/characters')
      } finally {
        setLoading(false)
      }
    }

    loadCharacterAndCreateChat()
  }, [characterId, modelsInitialized, hydrated, hasActiveModel, activeModel, router, setCharacter, setCurrentChat, setLoading, addMessage, clearMessages, appSettings])

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChat || !character || isGenerating) {
      return
    }

    try {
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
    }
  }

  // Generate AI response
  const generateAIResponse = async () => {
    try {
      const response = await chatService.generateResponse(currentChat!.id, {
        modelId: activeModel?.id,
        clientModel: activeModel
          ? {
              provider: activeModel.provider,
              model: activeModel.model,
              apiKey: activeModel.apiKey,
              baseUrl: activeModel.baseUrl,
              settings: activeModel.settings || {},
            }
          : undefined,
      })

      // Add AI message to UI
      addMessage(response.message)

    } catch (error) {
      console.error('Error generating response:', error)
      setError('Failed to generate AI response')
      toast.error('Failed to generate AI response')
    }
  }

  // Handle regenerating the last response
  const handleRegenerate = async () => {
    if (!currentChat || !character || isGenerating) return

    try {
      clearError()
      setGenerating(true)

      // Remove last assistant message if exists
      const assistantMessages = messages.filter((msg) => msg.role === 'assistant')
      const lastMessage = assistantMessages[assistantMessages.length - 1]
      if (lastMessage) {
        updateMessage(lastMessage.id, {
          content: '',
          metadata: { ...lastMessage.metadata, isRegenerated: true }
        })
      }

      const response = await chatService.regenerateResponse(currentChat.id)

      // Update or add the regenerated message
      if (lastMessage) {
        updateMessage(lastMessage.id, response.message)
      } else {
        addMessage(response.message)
      }

    } catch (error) {
      console.error('Error regenerating response:', error)
      setError('Failed to regenerate response')
      toast.error('Failed to regenerate response')
    } finally {
      setGenerating(false)
    }
  }

  // Create new chat
  const handleNewChat = async () => {
    // Check if we have an active model configured (from localStorage)
    if (!hasActiveModel || !activeModel) {
      toast.error('请先配置 AI 模型')
      // 打开右侧设置抽屉，而不是跳转页面
      window.dispatchEvent(new CustomEvent('open-settings'))
      return
    }

    try {
      setLoading(true)

      // Get or create a default character
      let characterToUse = characters[0]
      
      if (!characterToUse) {
        // Create a default assistant character if none exists
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

      const newChat = await chatService.createChat({
        title: `与 ${characterToUse.name} 的对话 - ${new Date().toLocaleString('zh-CN', { 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
        characterId: characterToUse.id,
        settings: {
          modelId: activeModel.id
        }
      })

      setCurrentChat(newChat)
      setCharacter(characterToUse)
      toast.success('新对话已创建')

      // ST parity: auto-send greeting and prefill opener
      const flagsEnabled = (process.env.NEXT_PUBLIC_ST_PARITY_GREETING_ENABLED ?? 'true') !== 'false'
      const shouldAutoSend = flagsEnabled && appSettings.autoSendGreeting !== false
      const greeting = characterToUse.firstMessage || ''
      if (shouldAutoSend && greeting.trim()) {
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
      setError('创建对话失败')
      toast.error('创建对话失败，请重试')
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
              {hydrated && !hasActiveModel && (
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
                <h3 className="text-xl font-medium mb-2">选择或创建对话</h3>
                <p className="text-sm mb-4">
                  {!hasActiveModel 
                    ? '配置 AI 模型后即可开始新对话' 
                    : '选择已有对话或创建新对话开始聊天'}
                </p>
                <button
                  onClick={handleNewChat}
                  disabled={isLoading || !hasActiveModel}
                  className="tavern-button inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!hasActiveModel ? '请先配置 AI 模型' : ''}
                >
                  <Plus className="w-4 h-4" />
                  新对话
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto tavern-scrollbar p-4">
              <MessageList
                messages={messages}
                isLoading={isGenerating}
              />
              {isGenerating && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-800 rounded-lg p-3 max-w-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-800 p-4">
              <MessageInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendMessage}
                disabled={!canGenerate || isLoading}
                placeholder={
                  !character
                    ? 'Select a character to start chatting'
                    : !hasActiveModel
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
    </div>
  )
}