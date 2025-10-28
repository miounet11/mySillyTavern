/**
 * Message list component for displaying chat messages
 */

import { useState, useEffect, useRef } from 'react'
import { Copy, RotateCcw, Trash2, User, Bot, Edit, MoreVertical } from 'lucide-react'
import { Message } from '@sillytavern-clone/shared'
import { useChatStore } from '@/stores/chatStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from '@/lib/i18n'

interface MessageListProps {
  className?: string
  messages?: Message[]
  isLoading?: boolean
  onEditMessage?: (messageId: string, newContent: string) => void
  onDeleteMessage?: (messageId: string) => void
  onRegenerateMessage?: (messageId: string) => void
}

export default function MessageList({
  className = '',
  messages: propMessages,
  isLoading = false,
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage
}: MessageListProps) {
  const { currentChat, character } = useChatStore()
  const { t } = useTranslation()
  const messages = propMessages || currentChat?.messages || []
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success(t('chat.message.copied'))
  }

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const handleSaveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      if (onEditMessage) {
        onEditMessage(editingMessageId, editContent)
      }
      setEditingMessageId(null)
      setEditContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleDeleteMessage = (messageId: string) => {
    if (confirm(t('chat.message.deleteConfirm'))) {
      if (onDeleteMessage) {
        onDeleteMessage(messageId)
      } else {
        toast(t('chat.message.deleteInDev'))
      }
    }
  }

  const handleRegenerateMessage = async (messageId: string) => {
    if (onRegenerateMessage) {
      onRegenerateMessage(messageId)
    } else {
      toast(t('chat.message.regenerateInDev'))
    }
  }

  const formatMessageContent = (content: string) => {
    // Enhanced markdown-like formatting with better styling
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-300">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800/60 text-teal-300 px-2 py-0.5 rounded text-sm font-mono border border-gray-700">$1</code>')
      .replace(/\n/g, '<br />')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-blue-300 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-purple-300 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-purple-400 mt-4 mb-2">$1</h1>')
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-gray-500 ${className}`}>
        <Bot className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">{t('chat.startNewConversation')}</h3>
        <p className="text-sm text-center max-w-md">
          {character
            ? t('chat.startChatWith', { name: character.name })
            : t('chat.selectCharacterFirst')
          }
        </p>
      </div>
    )
  }

  return (
    <div className={`flex-1 overflow-y-auto tavern-scrollbar ${className}`}>
      <div className="space-y-4 p-4">
        {messages.map((message: Message, index: number) => {
          const isUser = message.role === 'user'
          const isEditing = editingMessageId === message.id
          const previousMessage = messages[index - 1]
          const showAvatar = index === 0 || previousMessage?.role !== message.role

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                {/* Avatar */}
                {showAvatar && (
                  <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {isUser ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <>
                          {character?.avatar ? (
                            <img
                              src={character.avatar}
                              alt={character.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1`}>
                  {/* Message Header */}
                  {showAvatar && (
                    <div className={`flex items-center space-x-2 mb-1 text-sm ${
                      isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}>
                      <span className={`font-medium ${
                        isUser ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {isUser ? t('chat.you') || '你' : character?.name || t('chat.status.character')}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`relative group message-appear message-hover ${
                    isUser ? 'order-1' : 'order-2'
                  }`}>
                    <div
                      className={`relative rounded-2xl px-5 py-4 shadow-2xl transition-all duration-300 hover:shadow-3xl ${
                        isUser
                          ? 'bg-gradient-to-br from-blue-600/90 to-blue-700/90 text-white rounded-br-md border border-blue-500/30 backdrop-blur-sm hover:from-blue-500/90 hover:to-blue-600/90'
                          : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-gray-100 rounded-bl-md border border-gray-700/50 backdrop-blur-sm hover:from-gray-700/90 hover:to-gray-800/90'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[100px] resize-none bg-gray-800/60 border-gray-700/50 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500/50"
                            placeholder={t('chat.message.editPlaceholder')}
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200"
                            >
                              {t('chat.message.save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border-gray-600 rounded-lg transition-all duration-200"
                            >
                              {t('chat.message.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="whitespace-pre-wrap break-words text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: formatMessageContent(message.content)
                          }}
                        />
                      )}

                      {/* Message Actions */}
                      {!isEditing && (
                        <div className={`absolute top-0 ${
                          isUser ? '-left-20' : '-right-20'
                        } opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isUser ? 'end' : 'start'} className="w-48">
                              <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                                <Copy className="w-4 h-4 mr-2" />
                                {t('chat.message.copy')}
                              </DropdownMenuItem>

                              {isUser && (
                                <DropdownMenuItem onClick={() => handleStartEdit(message)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  {t('chat.message.edit')}
                                </DropdownMenuItem>
                              )}

                              {!isUser && (
                                <DropdownMenuItem onClick={() => handleRegenerateMessage(message.id)}>
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  {t('chat.message.regenerate')}
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('chat.message.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>

                    {/* Message Status */}
                    {message.metadata?.isRegenerated && (
                      <div className={`flex items-center space-x-2 mt-2 text-xs ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}>
                        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-300">{t('chat.message.isRegenerating')}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Streaming Indicator */}
                    {!isUser && message.content && message.id.startsWith('temp-ai-') && (
                      <div className={`flex items-center space-x-2 mt-2 text-xs ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}>
                        <div className="flex items-center space-x-1 px-2 py-1 bg-teal-500/20 rounded-full border border-teal-500/30">
                          <div className="flex space-x-0.5">
                            <div className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-teal-300">正在生成中...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl rounded-bl-md border border-gray-700/50 backdrop-blur-sm px-5 py-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  {/* 显示角色名称，不显示"AI" */}
                  {character?.name && (
                    <span className="text-sm text-gray-400">{character.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}