/**
 * Incomplete Interaction Prompt Component
 * 当检测到对话中断时显示的行内提示组件
 */

'use client'

import { Alert, Button, Group, Text } from '@mantine/core'
import { IconAlertCircle, IconRefresh, IconX } from '@tabler/icons-react'

interface IncompleteInteractionPromptProps {
  onContinue: () => void
  onDismiss: () => void
  isLastMessageUser?: boolean
  className?: string
}

export default function IncompleteInteractionPrompt({
  onContinue,
  onDismiss,
  isLastMessageUser = true,
  className = '',
}: IncompleteInteractionPromptProps) {
  const getMessage = () => {
    if (isLastMessageUser) {
      return '看起来这条消息还未得到回复，是否继续生成？'
    }
    return '检测到回复未完成或已中断，是否重新生成？'
  }

  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        margin: '1rem 0',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <div style={{ maxWidth: '80%' }}>
        <Alert
          icon={<IconAlertCircle size={20} />}
          color="yellow"
          variant="light"
          radius="md"
          styles={{
            root: {
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(245, 158, 11, 0.5)',
              backdropFilter: 'blur(8px)',
            },
            icon: {
              color: 'rgb(251, 191, 36)',
            },
            message: {
              color: 'rgb(254, 243, 199)',
            },
          }}
        >
          <Text size="sm" mb="md">
            {getMessage()}
          </Text>
          
          <Group gap="xs">
            <Button
              size="xs"
              variant="gradient"
              gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
              leftSection={<IconRefresh size={14} />}
              onClick={onContinue}
            >
              继续生成
            </Button>
            <Button
              size="xs"
              variant="default"
              leftSection={<IconX size={14} />}
              onClick={onDismiss}
            >
              忽略
            </Button>
          </Group>
        </Alert>
      </div>
    </div>
  )
}

