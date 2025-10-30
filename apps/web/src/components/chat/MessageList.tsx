/**
 * Message list component for displaying chat messages
 * 性能优化：useMemo 缓存格式化内容
 */

import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { Message } from '@sillytavern-clone/shared'
import { useChatStore } from '@/stores/chatStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useTranslation } from '@/lib/i18n'
import { applyRegexScripts } from '@/lib/regexScriptStorage'
import IncompleteInteractionPrompt from './IncompleteInteractionPrompt'
import {
  Box,
  Stack,
  Group,
  Avatar,
  Text,
  Menu,
  ActionIcon,
  Textarea,
  Button,
  Tooltip,
  Badge,
} from '@mantine/core'
import {
  IconCopy,
  IconRefresh,
  IconTrash,
  IconUser,
  IconRobot,
  IconEdit,
  IconDotsVertical,
  IconArrowDown,
  IconCheck,
  IconX,
  IconSquare,
} from '@tabler/icons-react'

interface MessageListProps {
  className?: string
  messages?: Message[]
  isLoading?: boolean
  onEditMessage?: (messageId: string, newContent: string) => void
  onDeleteMessage?: (messageId: string) => void
  onRegenerateMessage?: (messageId: string) => void
  onScrollToBottom?: () => void
  showIncompletePrompt?: boolean
  onContinueIncomplete?: () => void
  onDismissIncomplete?: () => void
}

export default function MessageList({
  className = '',
  messages: propMessages,
  isLoading = false,
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage,
  onScrollToBottom,
  showIncompletePrompt = false,
  onContinueIncomplete,
  onDismissIncomplete
}: MessageListProps) {
  const { currentChat, character, generationProgress, cancelGeneration, messages: storeMessages } = useChatStore()
  const { t } = useTranslation()
  // Always prefer propMessages if provided, otherwise use store messages, then currentChat messages
  const messages = propMessages !== undefined ? propMessages : (storeMessages || currentChat?.messages || [])
  const hasTempAI = Array.isArray(messages) && messages.some((m: Message) => typeof m.id === 'string' && m.id.startsWith('temp-ai-'))
  console.log('[MessageList] Rendering with', messages.length, 'messages, hasTempAI:', hasTempAI)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

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

  // 性能优化：缓存消息格式化内容的函数
  const createFormatMessageContent = useMemo(() => {
    // 创建一个缓存 Map
    const cache = new Map<string, string>()
    
    return (content: string) => {
      // 检查缓存
      if (cache.has(content)) {
        return cache.get(content)!
      }
      
      // Apply regex scripts from localStorage first
      let formatted = applyRegexScripts(content)
      
      // Then apply basic formatting (these run after regex scripts)
      formatted = formatted
        .replace(/\n/g, '<br />')
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-blue-300 mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-purple-300 mt-4 mb-2">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-purple-400 mt-4 mb-2">$1</h1>')
      
      // 存入缓存
      cache.set(content, formatted)
      
      // 限制缓存大小（最多 100 条）
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value
        if (firstKey !== undefined) {
          cache.delete(firstKey)
        }
      }
      
      return formatted
    }
  }, []) // 空依赖，函数只创建一次

  const formatMessageContent = createFormatMessageContent

  if (messages.length === 0 && !isLoading) {
    return (
      <Stack className={className} justify="flex-end" style={{ flex: 1 }}>
        <Box style={{ flex: 1 }} />
        <Stack align="center" justify="center" py="xl" gap="md">
          <IconRobot size={48} opacity={0.5} color="rgb(107, 114, 128)" />
          <Text size="lg" fw={500} c="dimmed">
            {t('chat.startNewConversation')}
          </Text>
          <Text size="sm" ta="center" maw={448} c="dimmed">
            {character
              ? t('chat.startChatWith', { name: character.name })
              : t('chat.selectCharacterFirst')
            }
          </Text>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack className={className} gap={0} style={{ flex: 1 }}>
      {/* Spacer to push messages to bottom */}
      <Box style={{ flex: 1 }} />
      <Stack gap="md" px={{ base: 'xs', sm: 'md' }} py="xs">
        {messages.map((message: Message, index: number) => {
          const isUser = message.role === 'user'
          const isEditing = editingMessageId === message.id
          const previousMessage = messages[index - 1]
          const showAvatar = index === 0 || previousMessage?.role !== message.role

          return (
            <Group
              key={message.id}
              justify={isUser ? 'flex-end' : 'flex-start'}
              align="flex-start"
              wrap="nowrap"
              className="group"
            >
              <Group
                align="flex-start"
                gap="sm"
                maw="80%"
                style={{
                  flexDirection: isUser ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                {showAvatar && (
                  <Avatar
                    size={32}
                    radius="xl"
                    color={isUser ? 'blue' : 'gray'}
                    style={{
                      flexShrink: 0,
                      [isUser ? 'marginLeft' : 'marginRight']: '0.75rem',
                    }}
                  >
                    {isUser ? (
                      <IconUser size={16} />
                    ) : (
                      <>
                        {character?.avatar ? (
                          <img
                            src={character.avatar}
                            alt={character.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <IconRobot size={16} />
                        )}
                      </>
                    )}
                  </Avatar>
                )}

                {/* Message Content */}
                <Stack
                  gap="xs"
                  style={{
                    flex: 1,
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Message Header */}
                  {showAvatar && (
                    <Group
                      gap="xs"
                      style={{
                        flexDirection: isUser ? 'row-reverse' : 'row',
                      }}
                    >
                      <Text
                        size="sm"
                        fw={500}
                        c={isUser ? 'blue.4' : 'gray.4'}
                      >
                        {isUser ? t('chat.you') || '你' : character?.name || t('chat.status.character')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </Text>
                    </Group>
                  )}

                  {/* Message Bubble */}
                  <Box
                    style={{
                      position: 'relative',
                    }}
                    className="message-appear message-hover group"
                  >
                    <Box
                      p="lg"
                      style={{
                        position: 'relative',
                        borderRadius: '1rem',
                        background: isUser
                          ? 'linear-gradient(to bottom right, rgba(37, 99, 235, 0.9), rgba(29, 78, 216, 0.9))'
                          : 'linear-gradient(to bottom right, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))',
                        color: isUser ? 'white' : 'rgb(243, 244, 246)',
                        [isUser ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: '0.25rem',
                        border: isUser
                          ? '1px solid rgba(59, 130, 246, 0.3)'
                          : '1px solid rgba(75, 85, 99, 0.5)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: isUser
                          ? 'inset 0 1px 2px rgba(255,255,255,0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                          : 'inset 0 1px 2px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          background: isUser
                            ? 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))'
                            : 'linear-gradient(to bottom right, rgba(55, 65, 81, 0.9), rgba(31, 41, 55, 0.9))',
                          boxShadow: isUser
                            ? 'inset 0 1px 2px rgba(255,255,255,0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                            : 'inset 0 1px 2px rgba(0,0,0,0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                        },
                      }}
                    >
                      {isEditing ? (
                        <Stack gap="sm">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.currentTarget.value)}
                            minRows={4}
                            autosize
                            placeholder={t('chat.message.editPlaceholder')}
                            autoFocus
                            styles={{
                              input: {
                                backgroundColor: 'rgba(31, 41, 55, 0.6)',
                                borderColor: 'rgba(75, 85, 99, 0.5)',
                                color: 'rgb(243, 244, 246)',
                                '&:focus': {
                                  borderColor: 'rgba(59, 130, 246, 0.5)',
                                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                                },
                              },
                            }}
                          />
                          <Group gap="xs">
                            <Button
                              size="sm"
                              leftSection={<IconCheck size={14} />}
                              onClick={handleSaveEdit}
                              variant="gradient"
                              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                            >
                              {t('chat.message.save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              color="gray"
                              leftSection={<IconX size={14} />}
                              onClick={handleCancelEdit}
                            >
                              {t('chat.message.cancel')}
                            </Button>
                          </Group>
                        </Stack>
                      ) : (
                        <div
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '1rem',
                            lineHeight: '1.75',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: formatMessageContent(message.content)
                          }}
                        />
                      )}

                      {/* Message Actions */}
                      {!isEditing && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 0,
                            [isUser ? 'left' : 'right']: '-5rem',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }}
                          className="group-hover:opacity-100"
                        >
                          <Menu position={isUser ? 'left-start' : 'right-start'} shadow="md" withinPortal>
                            <Menu.Target>
                              <ActionIcon variant="subtle" size="sm">
                                <IconDotsVertical size={14} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconCopy size={14} />}
                                onClick={() => handleCopyMessage(message.content)}
                              >
                                {t('chat.message.copy')}
                              </Menu.Item>

                              {isUser && (
                                <Menu.Item
                                  leftSection={<IconEdit size={14} />}
                                  onClick={() => handleStartEdit(message)}
                                >
                                  {t('chat.message.edit')}
                                </Menu.Item>
                              )}

                              {!isUser && (
                                <Menu.Item
                                  leftSection={<IconRefresh size={14} />}
                                  onClick={() => handleRegenerateMessage(message.id)}
                                >
                                  {t('chat.message.regenerate')}
                                </Menu.Item>
                              )}

                              <Menu.Divider />

                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                {t('chat.message.delete')}
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Box>
                      )}

                      {/* Quick inline actions for assistant messages */}
                      {!isUser && !isEditing && (
                        <Group
                          gap={4}
                          style={{
                            position: 'absolute',
                            top: '-0.75rem',
                            right: '-0.75rem',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }}
                          className="group-hover:opacity-100"
                        >
                          <Tooltip label={t('chat.message.regenerate')}>
                            <ActionIcon
                              variant="light"
                              size="sm"
                              color="gray"
                              onClick={() => handleRegenerateMessage(message.id)}
                            >
                              <IconRefresh size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('chat.controls.scrollToBottom') || '跳转底部'}>
                            <ActionIcon
                              variant="light"
                              size="sm"
                              color="gray"
                              onClick={onScrollToBottom}
                            >
                              <IconArrowDown size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      )}
                    </Box>

                    {/* Message Status */}
                    {message.metadata?.isRegenerated && (
                      <Group
                        justify={isUser ? 'flex-end' : 'flex-start'}
                        mt="xs"
                      >
                        <Badge
                          variant="light"
                          color="blue"
                          leftSection={
                            <Box
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'rgb(96, 165, 250)',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                              }}
                            />
                          }
                          size="sm"
                        >
                          {t('chat.message.isRegenerating')}
                        </Badge>
                      </Group>
                    )}
                    
                    {/* Streaming Indicator with Progress and Cancel Button */}
                    {!isUser && message.id.startsWith('temp-ai-') && (
                      <Group
                        justify={isUser ? 'flex-end' : 'flex-start'}
                        gap="xs"
                        mt="sm"
                        wrap="wrap"
                      >
                        {/* Progress Indicator */}
                        <Badge
                          variant="light"
                          color="teal"
                          size="md"
                          leftSection={
                            <Group gap={2}>
                              <Box
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgb(45, 212, 191)',
                                  animation: 'bounce 1s infinite',
                                  animationDelay: '0ms',
                                }}
                              />
                              <Box
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgb(45, 212, 191)',
                                  animation: 'bounce 1s infinite',
                                  animationDelay: '150ms',
                                }}
                              />
                              <Box
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgb(45, 212, 191)',
                                  animation: 'bounce 1s infinite',
                                  animationDelay: '300ms',
                                }}
                              />
                            </Group>
                          }
                          styles={{
                            root: {
                              backgroundColor: 'rgba(45, 212, 191, 0.2)',
                              border: '1px solid rgba(45, 212, 191, 0.3)',
                              backdropFilter: 'blur(8px)',
                              padding: '0.5rem 0.75rem',
                            },
                          }}
                        >
                          正在生成中
                          {generationProgress > 0 && ` (${generationProgress}s)`}
                        </Badge>

                        {/* Cancel Button */}
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          onClick={cancelGeneration}
                          leftSection={<IconSquare size={12} />}
                        >
                          停止
                        </Button>

                        {/* Long Wait Warning */}
                        {generationProgress > 30 && (
                          <Badge
                            variant="light"
                            color="yellow"
                            size="sm"
                            styles={{
                              root: {
                                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                backdropFilter: 'blur(8px)',
                              },
                            }}
                          >
                            {generationProgress > 60 ? '请耐心等待，即将完成' : '响应时间较长'}
                          </Badge>
                        )}
                      </Group>
                    )}
                  </Box>
                </Stack>
              </Group>
            </Group>
          )
        })}

        {/* Incomplete Interaction Prompt */}
        {showIncompletePrompt && !isLoading && onContinueIncomplete && onDismissIncomplete && messages.length > 0 && (
          <IncompleteInteractionPrompt
            onContinue={onContinueIncomplete}
            onDismiss={onDismissIncomplete}
            isLastMessageUser={messages[messages.length - 1]?.role === 'user'}
          />
        )}

        {/* Loading Indicator (only when not streaming with temp message) */}
        {isLoading && !hasTempAI && (
          <Group justify="flex-start" className="animate-fade-in">
            <Group align="flex-start" gap="sm">
              <Avatar
                size={32}
                radius="xl"
                style={{
                  background: 'linear-gradient(to bottom right, rgb(13, 148, 136), rgb(15, 118, 110))',
                  flexShrink: 0,
                }}
              >
                <IconRobot size={16} color="white" />
              </Avatar>
              <Box
                p="md"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))',
                  borderRadius: '1rem',
                  borderBottomLeftRadius: '0.25rem',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Group gap="sm">
                  <Group gap={4}>
                    <Box
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'rgb(45, 212, 191)',
                        animation: 'bounce 1s infinite',
                        animationDelay: '0ms',
                      }}
                    />
                    <Box
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'rgb(45, 212, 191)',
                        animation: 'bounce 1s infinite',
                        animationDelay: '150ms',
                      }}
                    />
                    <Box
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'rgb(45, 212, 191)',
                        animation: 'bounce 1s infinite',
                        animationDelay: '300ms',
                      }}
                    />
                  </Group>
                  {character?.name && (
                    <Text size="sm" c="dimmed">{character.name}</Text>
                  )}
                </Group>
              </Box>
            </Group>
          </Group>
        )}

      </Stack>
    </Stack>
  )
}
