/**
 * Chat control bar component for streaming, fast mode, and other controls
 */

'use client'

import { useState } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { Group, Button, Badge, Tooltip, Loader } from '@mantine/core'
import { IconArrowDown, IconRefresh, IconAlertCircle } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { useTranslation } from '@/lib/i18n'

interface ChatControlBarProps {
  onScrollToBottom?: () => void
  onRegenerate?: () => void
  showRegenerate?: boolean
  disabled?: boolean
  onCheckIncomplete?: () => void
}

export default function ChatControlBar({
  onScrollToBottom,
  onRegenerate,
  showRegenerate = true,
  disabled = false,
  onCheckIncomplete
}: ChatControlBarProps) {
  const { t } = useTranslation()
  const { isGenerating, messages, checkForIncompleteInteraction } = useChatStore()

  const handleCheckIncomplete = () => {
    const hasIncomplete = checkForIncompleteInteraction()
    if (hasIncomplete) {
      toast.success('检测到未完成的对话', { 
        icon: '⚠️',
        duration: 3000 
      })
      if (onCheckIncomplete) {
        onCheckIncomplete()
      }
    } else {
      toast('对话完整，没有检测到中断', { 
        icon: '✅',
        duration: 2000 
      })
    }
  }

  // 判断是否应该显示检测按钮（有消息时显示）
  const shouldShowCheckButton = messages.length > 0

  return (
    <Group
      justify="space-between"
      gap="xs"
      px={{ base: 'xs', sm: 'md' }}
      py="xs"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left Side - Info */}
      <Group gap="xs">
        {messages.length > 0 && (
          <Badge
            variant="light"
            color="blue"
            size="md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            {messages.length} 条消息
          </Badge>
        )}
      </Group>

      {/* Right Side - Action Controls */}
      <Group gap={6}>
        {/* Check Incomplete Button */}
        {shouldShowCheckButton && (
          <Tooltip label="检查对话完整性" position="top">
            <Button
              variant="subtle"
              size="compact-sm"
              color="yellow"
              onClick={handleCheckIncomplete}
              disabled={disabled || isGenerating}
              leftSection={<IconAlertCircle size={14} />}
              styles={{
                root: {
                  height: '28px',
                  fontSize: '0.75rem',
                },
              }}
              visibleFrom="sm"
            >
              检测中断
            </Button>
          </Tooltip>
        )}
        {shouldShowCheckButton && (
          <Tooltip label="检查对话完整性" position="top" hiddenFrom="sm">
            <Button
              variant="subtle"
              size="compact-sm"
              color="yellow"
              onClick={handleCheckIncomplete}
              disabled={disabled || isGenerating}
              styles={{
                root: {
                  height: '28px',
                  padding: '0 8px',
                },
              }}
              hiddenFrom="sm"
            >
              <IconAlertCircle size={14} />
            </Button>
          </Tooltip>
        )}

        {/* Regenerate Button */}
        {showRegenerate && (
          <Tooltip label="重新生成最后一条回复" position="top">
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={onRegenerate}
              disabled={disabled || isGenerating}
              leftSection={
                isGenerating ? (
                  <Loader size={14} />
                ) : (
                  <IconRefresh size={14} />
                )
              }
              styles={{
                root: {
                  height: '28px',
                  fontSize: '0.75rem',
                },
              }}
              visibleFrom="sm"
            >
              重新生成
            </Button>
          </Tooltip>
        )}
        {showRegenerate && (
          <Tooltip label="重新生成最后一条回复" position="top" hiddenFrom="sm">
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={onRegenerate}
              disabled={disabled || isGenerating}
              styles={{
                root: {
                  height: '28px',
                  padding: '0 8px',
                },
              }}
              hiddenFrom="sm"
            >
              {isGenerating ? (
                <Loader size={14} />
              ) : (
                <IconRefresh size={14} />
              )}
            </Button>
          </Tooltip>
        )}

        {/* Scroll to Bottom Button */}
        <Tooltip label="跳转到对话底部" position="top">
          <Button
            variant="subtle"
            size="compact-sm"
            color="cyan"
            onClick={onScrollToBottom}
            disabled={disabled}
            leftSection={<IconArrowDown size={14} />}
            styles={{
              root: {
                height: '28px',
                fontSize: '0.75rem',
              },
            }}
            visibleFrom="sm"
          >
            跳转底部
          </Button>
        </Tooltip>
        <Tooltip label="跳转到对话底部" position="top" hiddenFrom="sm">
          <Button
            variant="subtle"
            size="compact-sm"
            color="cyan"
            onClick={onScrollToBottom}
            disabled={disabled}
            styles={{
              root: {
                height: '28px',
                padding: '0 8px',
              },
            }}
            hiddenFrom="sm"
          >
            <IconArrowDown size={14} />
          </Button>
        </Tooltip>
      </Group>
    </Group>
  )
}

