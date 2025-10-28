/**
 * Chat header component displaying character info and chat controls
 */

import { useState } from 'react'
import { MoreVertical, ArrowLeft, Settings, Share2, Download, Trash2, Users, Star, Edit } from 'lucide-react'
import { Chat, Character } from '@sillytavern-clone/shared'
import { useChatStore } from '@/stores/chatStore'
import { useCharacterStore } from '@/stores/characterStore'
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
import { Badge } from '@/components/ui/badge'

interface ChatHeaderProps {
  className?: string
  chat?: Chat | null
  character?: Character | null
  onBack?: () => void
  onEditCharacter?: () => void
  onNewChat?: () => void
}

export default function ChatHeader({
  className = '',
  chat,
  character,
  onBack,
  onEditCharacter,
  onNewChat
}: ChatHeaderProps) {
  const { deleteChat, exportChat } = useChatStore()
  const [isExporting, setIsExporting] = useState(false)

  const currentChat = chat || null
  const currentCharacter = character || null

  const handleDeleteChat = async () => {
    if (!currentChat) return

    const confirmMessage = `确定要删除与 "${currentCharacter?.name || 'AI'}" 的对话吗？此操作无法撤销。`

    if (confirm(confirmMessage)) {
      try {
        const success = await deleteChat(currentChat.id)
        if (success) {
          toast.success('对话已删除')
          onBack?.()
        }
      } catch (error) {
        toast.error('删除对话失败')
      }
    }
  }

  const handleExportChat = async () => {
    if (!currentChat) return

    try {
      setIsExporting(true)
      const exportData = await exportChat(currentChat.id)

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const exportFileDefaultName = `${currentCharacter?.name || 'chat'}_${new Date().toISOString().split('T')[0]}.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()

      toast.success('对话已导出')
    } catch (error) {
      toast.error('导出对话失败')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShareChat = async () => {
    if (!currentChat) return

    try {
      // Create shareable link (implement based on your sharing mechanism)
      const shareUrl = `${window.location.origin}/chat/${currentChat.id}`

      if (navigator.share) {
        await navigator.share({
          title: `与 ${currentCharacter?.name || 'AI'} 的对话`,
          text: '查看这个有趣的对话',
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('分享链接已复制到剪贴板')
      }
    } catch (error) {
      toast.error('分享失败')
    }
  }

  const handleToggleFavorite = async () => {
    if (!currentChat) return
    
    try {
      const response = await fetch(`/api/chats/${currentChat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentChat.isFavorite })
      })
      
      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }
      
      toast.success(currentChat.isFavorite ? '已取消收藏' : '已添加到收藏')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败')
    }
  }

  const getChatStats = () => {
    if (!currentChat) return null

    const messageCount = currentChat.messages.length
    const userMessages = currentChat.messages.filter((m: any) => m.role === 'user').length
    const aiMessages = currentChat.messages.filter((m: any) => m.role === 'assistant').length
    const lastMessage = currentChat.messages[currentChat.messages.length - 1]

    return {
      total: messageCount,
      user: userMessages,
      ai: aiMessages,
      lastActivity: lastMessage ? formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true }) : formatDistanceToNow(new Date(currentChat.updatedAt), { addSuffix: true })
    }
  }

  const stats = getChatStats()

  return (
    <div className={`border-b border-gray-800 bg-gray-900 ${className}`}>
      <div className="p-4">
        {/* Header Content */}
        <div className="flex items-center justify-between">
          {/* Left Section - Back Button and Character Info */}
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-400 hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Character Avatar */}
            <div className="relative">
              {currentCharacter?.avatar ? (
                <img
                  src={currentCharacter.avatar}
                  alt={currentCharacter.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-300" />
                </div>
              )}

              {/* Online Status Indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>

            {/* Character Name and Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-100 flex items-center space-x-2">
                <span>{currentCharacter?.name || 'AI Assistant'}</span>
                {currentChat?.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </h2>

              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>在线</span>
                </span>

                {stats && (
                  <>
                    <span>•</span>
                    <span>{stats.total} 条消息</span>
                    <span>•</span>
                    <span>{stats.lastActivity}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Edit Character Button */}
            {currentCharacter && onEditCharacter && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditCharacter}
                className="tavern-button-secondary"
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑角色
              </Button>
            )}

            {/* New Chat Button */}
            {onNewChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNewChat}
                className="tavern-button-secondary"
              >
                新对话
              </Button>
            )}

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-200"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Character Info */}
                {currentCharacter && (
                  <>
                    <div className="px-2 py-1.5 text-sm text-gray-400 border-b border-gray-800">
                      <div className="font-medium text-gray-300">{currentCharacter.name}</div>
                      <div className="truncate">{currentCharacter.description}</div>
                      {currentCharacter.tags && currentCharacter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentCharacter.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {currentCharacter.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{currentCharacter.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Chat Actions */}
                <DropdownMenuItem onClick={handleToggleFavorite}>
                  <Star className="w-4 h-4 mr-2" />
                  {currentChat?.isFavorite ? '取消收藏' : '收藏对话'}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleShareChat}>
                  <Share2 className="w-4 h-4 mr-2" />
                  分享对话
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleExportChat} disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? '导出中...' : '导出对话'}
                </DropdownMenuItem>

                {currentCharacter && onEditCharacter && (
                  <DropdownMenuItem onClick={onEditCharacter}>
                    <Edit className="w-4 h-4 mr-2" />
                    编辑角色
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Destructive Actions */}
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleDeleteChat} className="text-red-500 hover:text-red-400 focus:text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除对话
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chat Stats Bar */}
        {stats && stats.total > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>用户消息: {stats.user}</span>
                <span>AI回复: {stats.ai}</span>
                <span>总计: {stats.total}</span>
              </div>

              <div className="flex items-center space-x-2">
                {currentCharacter?.settings?.temperature && (
                  <span>创造性: {currentCharacter.settings.temperature.toFixed(1)}</span>
                )}
                {currentChat?.modelUsed && (
                  <span>•</span>
                )}
                {currentChat?.modelUsed && (
                  <span>模型: {currentChat.modelUsed}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}