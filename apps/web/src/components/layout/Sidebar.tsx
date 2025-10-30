/**
 * Main sidebar component with navigation and chat list
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Chat, Character } from '@sillytavern-clone/shared'
import { useChatStore } from '@/stores/chatStore'
import { useCharacterStore } from '@/stores/characterStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import {
  Box,
  Button,
  TextInput,
  Badge,
  Tabs,
  ActionIcon,
  Menu,
  ScrollArea,
  Group,
  Text,
  Avatar,
  Stack,
  Title,
} from '@mantine/core'
import {
  IconMessageCircle,
  IconUsers,
  IconSettings,
  IconPlus,
  IconSearch,
  IconX,
  IconDotsVertical,
  IconStar,
  IconArchive,
  IconClock,
  IconWorld,
  IconHash,
  IconTrash,
  IconStarFilled,
} from '@tabler/icons-react'

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
  const router = useRouter()
  const pathname = usePathname()
  const { chats, currentChat, deleteChat, setCurrentChat } = useChatStore()
  const { characters, selectedCharacter, setSelectedCharacter, refreshCharacters } = useCharacterStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string | null>('chats')
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'archived'>('all')

  // Load characters on mount
  useEffect(() => {
    refreshCharacters()
  }, [refreshCharacters])

  // Keep sidebar tab selection in sync with the current route
  useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith('/characters')) {
      setActiveTab('characters')
      return
    }
    if (pathname.startsWith('/world-info')) {
      setActiveTab('tools')
      return
    }
    if (pathname.startsWith('/chat')) {
      setActiveTab('chats')
      return
    }
  }, [pathname])

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
      
      const updatedChat = await response.json()
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
    <Box
      className={className}
      style={{
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgb(17, 24, 39)',
        borderRight: '1px solid rgb(55, 65, 81)',
        height: '100%',
      }}
    >
      {/* Sidebar Header */}
      <Stack
        gap="md"
        p="md"
        style={{
          borderBottom: '1px solid rgb(55, 65, 81)',
        }}
      >
        <Group justify="space-between" align="center">
          <Title order={4} c="gray.1">
            SillyTavern
          </Title>
          <ActionIcon
            variant="subtle"
            onClick={onSettings}
            size="lg"
          >
            <IconSettings size={20} />
          </ActionIcon>
        </Group>

        {/* New Chat Button */}
        <Button
          fullWidth
          leftSection={<IconPlus size={16} />}
          onClick={handleNewChatClick}
          variant="gradient"
          gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
        >
          新对话
        </Button>

        {/* Search Bar */}
        <TextInput
          placeholder="搜索对话或角色..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchQuery && (
              <ActionIcon
                variant="subtle"
                onClick={clearSearch}
                size="sm"
              >
                <IconX size={14} />
              </ActionIcon>
            )
          }
        />
      </Stack>

      {/* Navigation Tabs */}
      <Box px="md" pt="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs value={activeTab} onChange={setActiveTab} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Tabs.List grow>
            <Tabs.Tab value="chats" leftSection={<IconMessageCircle size={16} />}>
              对话
            </Tabs.Tab>
            <Tabs.Tab value="characters" leftSection={<IconUsers size={16} />}>
              角色
            </Tabs.Tab>
            <Tabs.Tab value="tools" leftSection={<IconHash size={16} />}>
              工具
            </Tabs.Tab>
          </Tabs.List>

          {/* Chats Tab */}
          <Tabs.Panel value="chats" pt="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Filter Tabs */}
            <Group
              gap={4}
              mb="md"
              p={4}
              style={{
                backgroundColor: 'rgb(31, 41, 55)',
                borderRadius: '0.5rem',
              }}
            >
              {[
                { key: 'all', label: '全部', icon: IconMessageCircle },
                { key: 'favorites', label: '收藏', icon: IconStar },
                { key: 'archived', label: '归档', icon: IconArchive },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  onClick={() => setFilterMode(key as any)}
                  variant={filterMode === key ? 'light' : 'subtle'}
                  size="xs"
                  leftSection={<Icon size={14} />}
                  style={{ flex: 1 }}
                >
                  {label}
                </Button>
              ))}
            </Group>

            {/* Chat List */}
            <ScrollArea style={{ flex: 1 }} type="auto">
              <Stack gap="xs">
              {filteredChats.length === 0 ? (
                <Stack align="center" py="xl" gap="md">
                  <IconMessageCircle size={48} opacity={0.5} color="rgb(107, 114, 128)" />
                  <Text size="sm" c="dimmed">
                    {searchQuery ? '没有找到匹配的对话' : '还没有对话记录'}
                  </Text>
                </Stack>
              ) : (
                filteredChats.map((chat) => (
                  <Box
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    p="md"
                    style={{
                      position: 'relative',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: currentChat?.id === chat.id
                        ? 'rgb(55, 65, 81)'
                        : 'transparent',
                    }}
                    className="group"
                    onMouseEnter={(e) => {
                      if (currentChat?.id !== chat.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.5)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentChat?.id !== chat.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                        <Group gap="xs" wrap="nowrap">
                          <Text fw={500} size="sm" truncate style={{ flex: 1 }}>
                            {chat.title}
                          </Text>
                          {chat.isFavorite && (
                            <IconStarFilled size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
                          )}
                        </Group>

                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {getChatPreview(chat)}
                        </Text>

                        <Group justify="space-between" gap="xs" style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)' }}>
                          <Group gap={4}>
                            <IconUsers size={12} />
                            <Text size="xs">{chat.characterName}</Text>
                          </Group>
                          <Group gap={4}>
                            <IconClock size={12} />
                            <Text size="xs">{formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}</Text>
                          </Group>
                        </Group>
                      </Stack>

                      {/* Chat Actions */}
                      <Menu position="bottom-end" shadow="md" withinPortal>
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <IconDotsVertical size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconStar size={14} />}
                            onClick={(e) => handleToggleFavorite(chat.id, e)}
                          >
                            {chat.isFavorite ? '取消收藏' : '收藏对话'}
                          </Menu.Item>

                          <Menu.Item
                            leftSection={<IconArchive size={14} />}
                            onClick={(e) => handleArchiveChat(chat.id, e)}
                          >
                            {chat.isArchived ? '取消归档' : '归档对话'}
                          </Menu.Item>

                          <Menu.Divider />

                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                          >
                            删除对话
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    {/* Message Count Badge */}
                    <Badge
                      size="xs"
                      variant="light"
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                      }}
                    >
                      {chat.messages.length}
                    </Badge>
                  </Box>
                ))
              )}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* Characters Tab */}
          <Tabs.Panel value="characters" pt="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Quick Actions */}
            <Group mb="md" grow>
              <Button
                onClick={() => { setActiveTab('characters'); router.push('/characters/community') }}
                variant="light"
                size="xs"
                leftSection={<IconWorld size={14} />}
              >
                社区
              </Button>
              <Button
                onClick={() => { setActiveTab('characters'); router.push('/characters') }}
                variant="light"
                size="xs"
                leftSection={<IconUsers size={14} />}
              >
                管理
              </Button>
            </Group>

            <ScrollArea style={{ flex: 1 }} type="auto">
              <Stack gap="xs">
              {filteredCharacters.length === 0 ? (
                <Stack align="center" py="xl" gap="md">
                  <IconUsers size={48} opacity={0.5} color="rgb(107, 114, 128)" />
                  <Text size="sm" c="dimmed">
                    {searchQuery ? '没有找到匹配的角色' : '还没有创建角色'}
                  </Text>
                </Stack>
              ) : (
                filteredCharacters.map((character) => (
                  <Box
                    key={character.id}
                    onClick={() => handleCharacterClick(character)}
                    p="md"
                    style={{
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: selectedCharacter?.id === character.id
                        ? 'rgb(55, 65, 81)'
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCharacter?.id !== character.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.5)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCharacter?.id !== character.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <Group align="flex-start" wrap="nowrap" gap="sm">
                      {/* Character Avatar */}
                      <Avatar
                        src={character.avatar}
                        size={40}
                        radius="xl"
                        style={{ flexShrink: 0 }}
                      >
                        <IconUsers size={20} />
                      </Avatar>

                      {/* Character Info */}
                      <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={500} size="sm" truncate>
                          {character.name}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {character.description}
                        </Text>

                        {/* Tags */}
                        {character.tags && character.tags.length > 0 && (
                          <Group gap={4}>
                            {character.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} size="xs" variant="light">
                                {tag}
                              </Badge>
                            ))}
                            {character.tags.length > 3 && (
                              <Badge size="xs" variant="light">
                                +{character.tags.length - 3}
                              </Badge>
                            )}
                          </Group>
                        )}

                        {/* Stats */}
                        <Group justify="space-between" gap="xs" style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)' }}>
                          <Text size="xs">创建 {formatDistanceToNow(new Date(character.createdAt), { addSuffix: true })}</Text>
                          {character.messageCount !== undefined && (
                            <Text size="xs">{character.messageCount} 消息</Text>
                          )}
                        </Group>
                      </Stack>
                    </Group>
                  </Box>
                ))
              )}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* Tools Tab */}
          <Tabs.Panel value="tools" pt="md">
            <Stack gap="xs">
              <Button
                variant="subtle"
                fullWidth
                justify="flex-start"
                leftSection={<IconWorld size={16} />}
                onClick={() => window.location.href = '/world-info'}
              >
                世界信息管理
              </Button>

              <Stack align="center" py="xl" gap="md">
                <IconHash size={48} opacity={0.5} color="rgb(107, 114, 128)" />
                <Text size="sm" c="dimmed" mb="xs">
                  更多工具和插件功能
                </Text>
                <Text size="xs" c="dimmed">
                  即将推出...
                </Text>
              </Stack>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Box>

      {/* Sidebar Footer */}
      <Stack
        gap="xs"
        p="md"
        style={{
          borderTop: '1px solid rgb(55, 65, 81)',
        }}
      >
        <Group justify="space-between" style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)' }}>
          <Text size="xs">共 {chats.length} 个对话</Text>
          <Text size="xs">共 {characters.length} 个角色</Text>
        </Group>
      </Stack>
    </Box>
  )
}
