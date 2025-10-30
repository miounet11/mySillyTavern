/**
 * Retry Dialog Component
 * 显示超时或错误后的重试对话框
 */

'use client'

import { Modal, Button, Text, Stack, Alert, Group, ThemeIcon } from '@mantine/core'
import { 
  IconAlertTriangle, 
  IconRefresh, 
  IconX, 
  IconWifi, 
  IconServer, 
  IconClock 
} from '@tabler/icons-react'

interface RetryDialogProps {
  isOpen: boolean
  errorType: 'timeout' | 'network' | 'server' | 'cancelled'
  errorMessage: string
  retryCount: number
  maxRetries: number
  onRetry: () => void
  onCancel: () => void
}

export default function RetryDialog({
  isOpen,
  errorType,
  errorMessage,
  retryCount,
  maxRetries,
  onRetry,
  onCancel,
}: RetryDialogProps) {
  const getIcon = () => {
    switch (errorType) {
      case 'timeout':
        return <IconClock size={48} />
      case 'network':
        return <IconWifi size={48} />
      case 'server':
        return <IconServer size={48} />
      default:
        return <IconAlertTriangle size={48} />
    }
  }

  const getIconColor = () => {
    switch (errorType) {
      case 'timeout':
        return 'yellow'
      case 'network':
      case 'server':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getTitle = () => {
    switch (errorType) {
      case 'timeout':
        return '请求超时'
      case 'network':
        return '网络错误'
      case 'server':
        return '服务器错误'
      case 'cancelled':
        return '已取消'
      default:
        return '发生错误'
    }
  }

  const getDescription = () => {
    if (errorType === 'timeout') {
      return 'AI模型响应时间较长，请求已超时。您可以重试或取消本次生成。'
    }
    return errorMessage
  }

  const canRetry = retryCount < maxRetries && errorType !== 'cancelled'

  return (
    <Modal
      opened={isOpen}
      onClose={onCancel}
      centered
      size="md"
      withCloseButton={false}
    >
      <Stack align="center" gap="lg">
        {/* Icon */}
        <ThemeIcon
          size={80}
          radius="xl"
          variant="light"
          color={getIconColor()}
        >
          {getIcon()}
        </ThemeIcon>

        {/* Title and Description */}
        <Stack align="center" gap="xs">
          <Text size="xl" fw={600}>
            {getTitle()}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {getDescription()}
          </Text>
        </Stack>

        {/* Retry Info */}
        {canRetry && retryCount > 0 && (
          <Alert
            variant="light"
            color="blue"
            title={`已重试 ${retryCount} 次，最多可重试 ${maxRetries} 次`}
            icon={null}
            styles={{
              root: {
                width: '100%',
              },
            }}
          />
        )}

        {/* Actions */}
        <Group gap="sm" justify="center" w="100%">
          {canRetry ? (
            <>
              <Button
                variant="default"
                leftSection={<IconX size={16} />}
                onClick={onCancel}
                flex={1}
              >
                取消
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                leftSection={<IconRefresh size={16} />}
                onClick={onRetry}
                flex={1}
              >
                重试 {retryCount > 0 && `(${retryCount + 1}/${maxRetries})`}
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              onClick={onCancel}
              fullWidth
            >
              关闭
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  )
}



