/**
 * Main sidebar component with navigation and chat list
 */

'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Users,
  Settings,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  MoreVertical,
  Star,
  Archive,
  Clock,
  Hash,
  Globe
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SidebarProps {
  className?: string
  onNewChat?: () => void
  onCharacterSelect?: (character: Character) => void
  onChatSelect?: (chat: Chat) => void
  onSettings?: () => void
}

export default function Sidebar({
  className = '',
  onNewChat,
  onCharacterSelect,
  onChatSelect,
  onSettings
}: SidebarProps) {
  const { chats, currentChat, deleteChat, setCurrentChat } = useChatStore()
  const { characters, selectedCharacter, setSelectedCharacter } = useCharacterStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('chats')
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'archived'>('all')

  // Filter chats based on search and filter mode
  const filteredChats = chats.filter(chat => {
    const matchesSearch = searchQuery === '' ||
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.characterName && chat.characterName.toLowerCase().includes(searchQuery.toLowerCase()))

    switch (filterMode) {
      case 'favorites':
        return matchesSearch && chat.isFavorite
      case 'archived':
        return matchesSearch && chat.isArchived
      default:
        return matchesSearch && !chat.isArchived
    }
  })

  // Filter characters based on search
  const filteredCharacters = characters.filter(character =>
    searchQuery === '' ||
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const chat = chats.find(c => c.id === chatId)
    if (!chat) return

    if (confirm(`确定要删除与 "${chat.characterName}" 的对话吗？`)) {
      try {
        const success = await deleteChat(chatId)
        if (success) {
          toast.success('对话已删除')
          if (currentChat?.id === chatId) {
            setCurrentChat(null)
          }
        }
      } catch (error) {
        toast.error('删除对话失败')
      }
    }
  }

  const handleToggleFavorite = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return
    
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !chat.isFavorite })
      })
      
      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }
      
      // Update local state
      const updatedChat = await response.json()
      // Trigger re-fetch or update store
      toast.success(updatedChat.isFavorite ? '已添加到收藏' : '已取消收藏')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败')
    }
  }

  const handleArchiveChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return
    
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !chat.isArchived })
      })
      
      if (!response.ok) {
        throw new Error('Failed to toggle archive')
      }
      
      // Update local state
      const updatedChat = await response.json()
      toast.success(updatedChat.isArchived ? '已归档' : '已取消归档')
    } catch (error) {
      console.error('Error toggling archive:', error)
      toast.error('操作失败')
    }
  }

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character)
    onCharacterSelect?.(character)
  }

  const handleChatClick = (chat: Chat) => {
    setCurrentChat(chat)
    onChatSelect?.(chat)
  }

  const handleNewChatClick = () => {
    onNewChat?.()
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const getChatPreview = (chat: Chat) => {
    if (chat.messages.length === 0) return '暂无消息'

    const lastMessage = chat.messages[chat.messages.length - 1]
    const content = lastMessage.content.length > 50
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content

    return content
  }

  return (
    <div className={`w-80 bg-gray-900 border-r border-gray-800 flex flex-col ${className}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-100">SillyTavern</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="text-gray-400 hover:text-gray-200"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <Button
          onClick={handleNewChatClick}
          className="w-full tavern-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          新对话
        </Button>

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索对话或角色..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 tavern-input"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chats" className="text-sm">
              <MessageSquare className="w-4 h-4 mr-1" />
              对话
            </TabsTrigger>
            <TabsTrigger value="characters" className="text-sm">
              <Users className="w-4 h-4 mr-1" />
              角色
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-sm">
              <Hash className="w-4 h-4 mr-1" />
              工具
            </TabsTrigger>
          </TabsList>

          {/* Chats Tab */}
          <TabsContent value="chats" className="mt-4">
            {/* Filter Tabs */}
            <div className="flex space-x-1 mb-3 bg-gray-800 rounded-lg p-1">
              {[
                { key: 'all', label: '全部', icon: MessageSquare },
                { key: 'favorites', label: '收藏', icon: Star },
                { key: 'archived', label: '归档', icon: Archive },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterMode(key as any)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    filterMode === key
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Chat List */}
            <div className="space-y-1 max-h-[60vh] overflow-y-auto tavern-scrollbar">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? '没有找到匹配的对话' : '还没有对话记录'}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                      currentChat?.id === chat.id
                        ? 'bg-gray-700 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium truncate">{chat.title}</h3>
                          {chat.isFavorite && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {getChatPreview(chat)}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{chat.characterName}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}</span>
                          </span>
                        </div>
                      </div>

                      {/* Chat Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={(e) => handleToggleFavorite(chat.id, e)}>
                              <Star className="w-4 h-4 mr-2" />
                              {chat.isFavorite ? '取消收藏' : '收藏对话'}
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={(e) => handleArchiveChat(chat.id, e)}>
                              <Archive className="w-4 h-4 mr-2" />
                              {chat.isArchived ? '取消归档' : '归档对话'}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除对话
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Message Count Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {chat.messages.length}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="mt-4">
            <div className="space-y-1 max-h-[60vh] overflow-y-auto tavern-scrollbar">
              {filteredCharacters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? '没有找到匹配的角色' : '还没有创建角色'}
                  </p>
                </div>
              ) : (
                filteredCharacters.map((character) => (
                  <div
                    key={character.id}
                    onClick={() => handleCharacterClick(character)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCharacter?.id === character.id
                        ? 'bg-gray-700 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Character Avatar */}
                      <div className="flex-shrink-0">
                        {character.avatar ? (
                          <img
                            src={character.avatar}
                            alt={character.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Character Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1">{character.name}</h3>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {character.description}
                        </p>

                        {/* Tags */}
                        {character.tags && character.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {character.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {character.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{character.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>创建 {formatDistanceToNow(new Date(character.createdAt), { addSuffix: true })}</span>
                          {character.messageCount !== undefined && (
                            <span>{character.messageCount} 消息</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="mt-4">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => window.location.href = '/world-info'}
              >
                <Globe className="w-4 h-4 mr-2" />
                世界信息管理
              </Button>

              <div className="text-center py-8 text-gray-500">
                <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm mb-4">更多工具和插件功能</p>
                <p className="text-xs">即将推出...</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto p-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>共 {chats.length} 个对话</span>
          <span>共 {characters.length} 个角色</span>
        </div>
      </div>
    </div>
  )
}