/**
 * Optimized message item component with React.memo and useMemo
 * 性能优化：仅在 content 或 id 变化时重渲染
 */

import { memo, useMemo, useState } from 'react'
import { Message } from '@sillytavern-clone/shared'
import { formatDistanceToNow } from 'date-fns'
import { applyRegexScripts } from '@/lib/regexScriptStorage'
import { useTranslation } from '@/lib/i18n'
import toast from 'react-hot-toast'
import {
  Box,
  Group,
  Avatar,
  Text,
  Menu,
  ActionIcon,
  Textarea,
  Button,
  Tooltip,
} from '@mantine/core'
import {
  IconCopy,
  IconRefresh,
  IconTrash,
  IconUser,
  IconRobot,
  IconEdit,
  IconDotsVertical,
  IconCheck,
  IconX,
} from '@tabler/icons-react'

interface MessageItemProps {
  message: Message
  characterName?: string
  characterAvatar?: string
  isLastAssistantMessage?: boolean
  onEditMessage?: (messageId: string, newContent: string) => void
  onDeleteMessage?: (messageId: string) => void
  onRegenerateMessage?: (messageId: string) => void
}

const MessageItem = memo(({
  message,
  characterName = 'Character',
  characterAvatar,
  isLastAssistantMessage = false,
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage
}: MessageItemProps) => {
  const { t } = useTranslation()
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const isUser = message.role === 'user'
  const isEditing = editingMessageId === message.id

  // 使用 useMemo 缓存格式化内容，避免重复计算
  const formattedContent = useMemo(() => {
    if (!message.content) return ''
    
    // Apply regex scripts from localStorage first
    let formatted = applyRegexScripts(message.content)
    
    // Then apply basic formatting
    formatted = formatted
      .replace(/\n/g, '<br />')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-blue-300 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-purple-300 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-purple-400 mt-4 mb-2">$1</h1>')
    
    return formatted
  }, [message.content])

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
    toast.success(t('chat.message.copied'))
  }

  const handleStartEdit = () => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const handleSaveEdit = () => {
    if (editContent.trim() && onEditMessage) {
      onEditMessage(message.id, editContent)
      setEditingMessageId(null)
      setEditContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleDeleteMessage = () => {
    if (confirm(t('chat.message.deleteConfirm'))) {
      if (onDeleteMessage) {
        onDeleteMessage(message.id)
      }
    }
  }

  const handleRegenerateMessage = () => {
    if (onRegenerateMessage) {
      onRegenerateMessage(message.id)
    }
  }

  // 时间戳格式化（也缓存）
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
    } catch {
      return ''
    }
  }, [message.timestamp])

  return (
    <Group
      gap="md"
      align="flex-start"
      p="md"
      style={{
        backgroundColor: isUser
          ? 'hsl(var(--primary-rose) / 0.05)'
          : 'hsl(var(--accent-gold) / 0.05)',
        borderRadius: 'var(--radius-lg)',
        transition: 'background-color 0.2s',
      }}
    >
      {/* Avatar */}
      <Avatar
        size="md"
        radius="xl"
        color={isUser ? 'brand' : 'accent'}
        style={{ flexShrink: 0 }}
      >
        {isUser ? (
          <IconUser size={20} />
        ) : characterAvatar ? (
          <img src={characterAvatar} alt={characterName} />
        ) : (
          <IconRobot size={20} />
        )}
      </Avatar>

      {/* Content */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <Text size="sm" fw={600} c={isUser ? 'brand.6' : 'accent.6'}>
              {isUser ? 'You' : characterName}
            </Text>
            {timeAgo && (
              <Text size="xs" c="dimmed">
                {timeAgo}
              </Text>
            )}
          </Group>

          {/* Actions Menu */}
          <Menu position="bottom-end" shadow="md" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm" color="gray">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconCopy size={14} />}
                onClick={handleCopyMessage}
              >
                {t('chat.message.copy')}
              </Menu.Item>
              {onEditMessage && (
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={handleStartEdit}
                >
                  {t('chat.message.edit')}
                </Menu.Item>
              )}
              {!isUser && isLastAssistantMessage && onRegenerateMessage && (
                <Menu.Item
                  leftSection={<IconRefresh size={14} />}
                  onClick={handleRegenerateMessage}
                >
                  {t('chat.message.regenerate')}
                </Menu.Item>
              )}
              {onDeleteMessage && (
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={handleDeleteMessage}
                >
                  {t('chat.message.delete')}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Message Content */}
        {isEditing ? (
          <Box>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              minRows={3}
              autosize
              mb="xs"
            />
            <Group gap="xs">
              <Button
                size="xs"
                leftSection={<IconCheck size={14} />}
                onClick={handleSaveEdit}
              >
                {t('chat.message.save')}
              </Button>
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                leftSection={<IconX size={14} />}
                onClick={handleCancelEdit}
              >
                {t('chat.message.cancel')}
              </Button>
            </Group>
          </Box>
        ) : (
          <div
            className="whitespace-pre-wrap break-words text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
            style={{ color: 'hsl(var(--text-primary))' }}
          />
        )}
      </Box>
    </Group>
  )
}, (prevProps, nextProps) => {
  // 自定义比较函数：仅在这些属性变化时才重渲染
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.characterName === nextProps.characterName &&
    prevProps.isLastAssistantMessage === nextProps.isLastAssistantMessage
  )
})

MessageItem.displayName = 'MessageItem'

export default MessageItem

