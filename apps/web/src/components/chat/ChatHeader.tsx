/**
 * Chat header component displaying character info and chat controls
 */

import { useState } from 'react'
import { Chat, Character } from '@sillytavern-clone/shared'
import { useChatStore } from '@/stores/chatStore'
import { useCharacterStore } from '@/stores/characterStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { Group, Button, Badge, Avatar, Text, ActionIcon, Menu } from '@mantine/core'
import { 
  IconDotsVertical, 
  IconArrowLeft, 
  IconShare2, 
  IconDownload, 
  IconTrash, 
  IconUsers, 
  IconStar, 
  IconEdit 
} from '@tabler/icons-react'
import { useTranslation } from '@/lib/i18n'

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
  const { t } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)

  const currentChat = chat || null
  const currentCharacter = character || null

  const handleDeleteChat = async () => {
    if (!currentChat) return

    const confirmMessage = t('chat.deleteConfirm', { name: currentCharacter?.name || 'AI' })

    if (confirm(confirmMessage)) {
      try {
        const success = await deleteChat(currentChat.id)
        if (success) {
          toast.success(t('chat.deleted'))
          onBack?.()
        }
      } catch (error) {
        toast.error(t('chat.deleteFailed'))
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

      toast.success(t('chat.chatHeader.success.exported'))
    } catch (error) {
      toast.error(t('chat.error.deleteFailed'))
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
          title: t('chat.chatHeader.shareTitle', { name: currentCharacter?.name || 'AI' }),
          text: t('chat.chatHeader.shareText'),
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success(t('chat.chatHeader.success.shareLinkCopied'))
      }
    } catch (error) {
      toast.error(t('chat.chatHeader.error.shareFailed'))
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
      
      toast.success(currentChat.isFavorite ? t('chat.unfavorited') : t('chat.favorited'))
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(t('chat.chatHeader.error.operationFailed'))
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
    <div 
      className={className}
      style={{
        borderBottom: '1px solid rgba(55, 65, 81, 0.5)',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(16px)',
        padding: '1.25rem',
      }}
    >
      {/* Header Content */}
      <Group justify="space-between" align="flex-start">
        {/* Left Section - Back Button and Character Info */}
        <Group gap="md">
          {onBack && (
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={onBack}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
          )}

          {/* Character Avatar */}
          <div style={{ position: 'relative' }}>
            <Avatar
              src={currentCharacter?.avatar}
              size={56}
              radius="xl"
              style={{
                border: '2px solid rgba(59, 130, 246, 0.5)',
                transition: 'all 0.3s',
              }}
            >
              <IconUsers size={28} />
            </Avatar>
            
            {/* Online Status Indicator */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '16px',
                height: '16px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '2px solid rgb(17, 24, 39)',
              }}
            />
          </div>

          {/* Character Name and Status */}
          <div>
            <Group gap="xs" mb="xs">
              <Text
                size="xl"
                fw={700}
                style={{
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {currentCharacter?.name || 'AI Assistant'}
              </Text>
              {currentChat?.isFavorite && (
                <IconStar size={20} fill="#fbbf24" color="#fbbf24" />
              )}
            </Group>

            <Group gap="sm">
              <Badge 
                size="sm" 
                color="green" 
                variant="light"
                leftSection={
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: '#22c55e' 
                  }} />
                }
              >
                {t('chat.chatHeader.online')}
              </Badge>

              {stats && (
                <>
                  <Text size="sm" c="dimmed">•</Text>
                  <Text size="sm" fw={500}>{stats.total} {t('chat.chatHeader.messagesCount')}</Text>
                  <Text size="sm" c="dimmed">•</Text>
                  <Text size="sm" c="dimmed">{stats.lastActivity}</Text>
                </>
              )}
            </Group>
          </div>
        </Group>

        {/* Right Section - Actions */}
        <Group gap="xs">
          {/* Edit Character Button */}
          {currentCharacter && onEditCharacter && (
            <Button
              variant="light"
              size="sm"
              leftSection={<IconEdit size={16} />}
              onClick={onEditCharacter}
            >
              {t('chat.editCharacter')}
            </Button>
          )}

          {/* New Chat Button */}
          {onNewChat && (
            <Button
              variant="gradient"
              gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
              size="sm"
              onClick={onNewChat}
            >
              {t('chat.chatHeader.newChat')}
            </Button>
          )}

          {/* Actions Menu */}
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <IconDotsVertical size={20} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown style={{ minWidth: '200px' }}>
              {/* Character Info */}
              {currentCharacter && (
                <>
                  <Menu.Label>
                    <Text fw={600} size="sm">{currentCharacter.name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>{currentCharacter.description}</Text>
                    {currentCharacter.tags && Array.isArray(currentCharacter.tags) && currentCharacter.tags.length > 0 && (
                      <Group gap={4} mt="xs">
                        {currentCharacter.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} size="xs" variant="light">
                            {tag}
                          </Badge>
                        ))}
                        {currentCharacter.tags.length > 3 && (
                          <Badge size="xs" variant="light">
                            +{currentCharacter.tags.length - 3}
                          </Badge>
                        )}
                      </Group>
                    )}
                  </Menu.Label>
                  <Menu.Divider />
                </>
              )}

              {/* Chat Actions */}
              <Menu.Item
                leftSection={<IconStar size={16} />}
                onClick={handleToggleFavorite}
              >
                {currentChat?.isFavorite ? t('chat.chatHeader.unfavoriteChat') : t('chat.chatHeader.favoriteChat')}
              </Menu.Item>

              <Menu.Item
                leftSection={<IconShare2 size={16} />}
                onClick={handleShareChat}
              >
                {t('chat.chatHeader.shareChat')}
              </Menu.Item>

              <Menu.Item
                leftSection={<IconDownload size={16} />}
                onClick={handleExportChat}
                disabled={isExporting || !currentChat}
              >
                {isExporting ? t('chat.chatHeader.exportingChat') : t('chat.chatHeader.exportChat')}
              </Menu.Item>

              {currentCharacter && onEditCharacter && (
                <Menu.Item
                  leftSection={<IconEdit size={16} />}
                  onClick={onEditCharacter}
                >
                  {t('chat.editCharacter')}
                </Menu.Item>
              )}

              <Menu.Divider />

              {/* Destructive Actions */}
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                onClick={handleDeleteChat}
                disabled={!currentChat}
                color="red"
              >
                {t('chat.deleteChat')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Chat Stats Bar */}
      {stats && stats.total > 0 && (
        <Group 
          justify="space-between" 
          mt="lg" 
          pt="md"
          style={{ borderTop: '1px solid rgba(107, 114, 128, 0.5)' }}
        >
          <Group gap="sm">
            <Badge variant="light" size="md">
              👤 {stats.user}
            </Badge>
            <Badge variant="light" size="md" color="violet">
              🤖 {stats.ai}
            </Badge>
            <Badge variant="light" size="md" color="cyan">
              💬 {stats.total}
            </Badge>
          </Group>

          <Group gap="sm">
            {currentCharacter?.settings?.temperature && (
              <Badge variant="light" size="md">
                🎨 {currentCharacter.settings.temperature.toFixed(1)}
              </Badge>
            )}
            {currentChat?.modelUsed && (
              <Badge variant="light" size="md" color="yellow">
                ⚡ {currentChat.modelUsed}
              </Badge>
            )}
          </Group>
        </Group>
      )}
    </div>
  )
}