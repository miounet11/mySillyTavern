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
    toast.success('消息已复制到剪贴板')
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
    if (confirm('确定要删除这条消息吗？')) {
      if (onDeleteMessage) {
        onDeleteMessage(messageId)
      } else {
        toast('删除消息功能开发中...')
      }
    }
  }

  const handleRegenerateMessage = async (messageId: string) => {
    if (onRegenerateMessage) {
      onRegenerateMessage(messageId)
    } else {
      toast('重新生成功能开发中...')
    }
  }

  const formatMessageContent = (content: string) => {
    // Basic markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br />')
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-gray-500 ${className}`}>
        <Bot className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">开始新的对话</h3>
        <p className="text-sm text-center max-w-md">
          {character
            ? `与 ${character.name} 开始你的第一次对话吧！`
            : '请先选择一个角色开始对话'
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
                        {isUser ? '你' : character?.name || 'AI'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`relative group ${
                    isUser ? 'order-1' : 'order-2'
                  }`}>
                    <div
                      className={`rounded-lg px-4 py-3 relative ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="tavern-input min-h-[100px] resize-none"
                            placeholder="编辑消息内容..."
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="tavern-button"
                            >
                              保存
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="tavern-button-secondary"
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="whitespace-pre-wrap break-words"
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
                                复制
                              </DropdownMenuItem>

                              {isUser && (
                                <DropdownMenuItem onClick={() => handleStartEdit(message)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                              )}

                              {!isUser && (
                                <DropdownMenuItem onClick={() => handleRegenerateMessage(message.id)}>
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  重新生成
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>

                    {/* Message Status */}
                    {message.metadata?.isRegenerated && (
                      <div className={`flex items-center space-x-2 mt-1 text-xs text-blue-400 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>正在重新生成...</span>
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
          <div className="flex justify-start">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-300" />
              </div>
              <div className="bg-gray-800 rounded-lg rounded-bl-sm border border-gray-700 px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-400">AI正在思考...</span>
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