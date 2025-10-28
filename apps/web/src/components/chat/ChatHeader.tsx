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
    
    // Safely handle messages array - it might be undefined
    const messages = currentChat.messages || []
    const messageCount = messages.length
    const userMessages = messages.filter((m: any) => m.role === 'user').length
    const aiMessages = messages.filter((m: any) => m.role === 'assistant').length
    const lastMessage = messages[messages.length - 1]

    return {
      total: messageCount,
      user: userMessages,
      ai: aiMessages,
      lastActivity: lastMessage ? formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true }) : formatDistanceToNow(new Date(currentChat.updatedAt), { addSuffix: true })
    }
  }

  const stats = getChatStats()

  return (
    <div className={`border-b border-gray-800/50 glass-card backdrop-blur-lg ${className}`}>
      <div className="p-5">
        {/* Header Content */}
        <div className="flex items-center justify-between">
          {/* Left Section - Back Button and Character Info */}
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="glass-light hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Character Avatar */}
            <div className="relative group">
              {currentCharacter?.avatar ? (
                <img
                  src={currentCharacter.avatar}
                  alt={currentCharacter.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/50 shadow-lg transition-all group-hover:scale-105 group-hover:border-blue-400"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                  <Users className="w-7 h-7 text-white" />
                </div>
              )}

              {/* Online Status Indicator with Glow */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse-glow"></div>
            </div>

            {/* Character Name and Status */}
            <div>
              <h2 className="text-xl font-bold gradient-text flex items-center space-x-2">
                <span>{currentCharacter?.name || 'AI Assistant'}</span>
                {currentChat?.isFavorite && (
                  <Star className="w-5 h-5 text-yellow-400 fill-current animate-bounce-subtle" />
                )}
              </h2>

              <div className="flex items-center space-x-3 text-sm text-gray-300 mt-1">
                <span className="flex items-center space-x-1.5 glass-light px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">在线</span>
                </span>

                {stats && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="font-medium">{stats.total} 条消息</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{stats.lastActivity}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            {/* Edit Character Button */}
            {currentCharacter && onEditCharacter && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditCharacter}
                className="glass-light hover:bg-white/10 text-white border-white/20 hover-lift transition-all"
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
                className="gradient-btn-primary hover-lift transition-all"
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
                  className="glass-light hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
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
                      {currentCharacter.tags && Array.isArray(currentCharacter.tags) && currentCharacter.tags.length > 0 && (
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
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <span className="glass-light px-3 py-1.5 rounded-lg text-gray-300 font-medium">
                  <span className="text-blue-400">👤</span> {stats.user}
                </span>
                <span className="glass-light px-3 py-1.5 rounded-lg text-gray-300 font-medium">
                  <span className="text-purple-400">🤖</span> {stats.ai}
                </span>
                <span className="glass-light px-3 py-1.5 rounded-lg text-gray-300 font-medium">
                  <span className="text-teal-400">💬</span> {stats.total}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-gray-400">
                {currentCharacter?.settings?.temperature && (
                  <span className="glass-light px-3 py-1.5 rounded-lg">
                    🎨 {currentCharacter.settings.temperature.toFixed(1)}
                  </span>
                )}
                {currentChat?.modelUsed && (
                  <span className="glass-light px-3 py-1.5 rounded-lg">
                    ⚡ {currentChat.modelUsed}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}