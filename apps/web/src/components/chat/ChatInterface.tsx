/**
 * Main chat interface component
 */

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Settings, User, Plus } from 'lucide-react'
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

export default function ChatInterface() {
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
    reset
  } = useChatStore()

  const { characters, createCharacter } = useCharacterStore()
  const { activeModel, hasActiveModel } = useAIModelStore()

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        modelId: activeModel?.id
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
      const lastMessage = messages.findLast((msg) => msg.role === 'assistant')
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
    if (!hasActiveModel) {
      toast.error('Please select an AI model first')
      return
    }

    try {
      setLoading(true)

      // For now, create chat with a default character
      const defaultCharacter = characters[0]
      if (!defaultCharacter) {
        // Create a default assistant character if none exists
        const newCharacter = await createCharacter({
          name: 'Assistant',
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
          setCharacter(newCharacter)
        }
      }

      const characterToUse = defaultCharacter || characters[0]
      if (!characterToUse) {
        throw new Error('No character available')
      }

      const newChat = await chatService.createChat({
        title: `${characterToUse.name} - ${new Date().toLocaleString()}`,
        characterId: characterToUse.id,
        settings: {
          modelId: activeModel?.id
        }
      })

      setCurrentChat(newChat)
      setCharacter(characterToUse)
      toast.success('New chat created')

    } catch (error) {
      console.error('Error creating chat:', error)
      setError('Failed to create new chat')
      toast.error('Failed to create new chat')
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
        onCharacterSelect={handleCharacterSelect}
        onRegenerate={handleRegenerate}
        canRegenerate={messages.some(msg => msg.role === 'assistant')}
        isGenerating={isGenerating}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Select or create a chat</h3>
              <p className="text-sm mb-4">Choose an existing chat or create a new one to start chatting</p>
              <button
                onClick={handleNewChat}
                disabled={isLoading || !hasActiveModel}
                className="tavern-button inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto tavern-scrollbar p-4">
              <MessageList
                messages={messages}
                character={character}
                isLoading={isGenerating}
              />
              {isGenerating && (
                <div className="flex justify-start mb-4">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-800 p-4">
              <MessageInput
                ref={inputRef}
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