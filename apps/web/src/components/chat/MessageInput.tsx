/**
 * Message input component for chat interface
 */

import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useCreativeStore } from '@/stores/creativeStore'
import { useModelGuard } from '@/hooks/useModelGuard'
import { useAIModelStore } from '@/stores/aiModelStore'
import toast from 'react-hot-toast'
import { useTranslation } from '@/lib/i18n'
import {
  Box,
  Textarea,
  Button,
  ActionIcon,
  Menu,
  Group,
  Text,
  Tooltip,
  Badge,
  Stack,
} from '@mantine/core'
import {
  IconSend,
  IconPaperclip,
  IconMicrophone,
  IconMicrophoneOff,
  IconSparkles,
  IconBolt,
  IconBroadcast,
  IconX,
} from '@tabler/icons-react'

interface MessageInputProps {
  className?: string
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
  onSend?: (message: string) => Promise<void>
  onSendMessage?: (message: string) => void
}

export default function MessageInput({
  className = '',
  placeholder,
  disabled = false,
  value,
  onChange,
  onSend,
  onSendMessage
}: MessageInputProps) {
  const { currentChat, isLoading, character } = useChatStore()
  const {
    isStreamingEnabled,
    isFastModeEnabled,
    toggleStreaming,
    toggleFastMode,
  } = useChatStore()
  const { selectedCharacter: activeCharacter } = useCharacterStore()
  const {
    storyAdvance,
    povMode,
    sceneTransitionOnce,
    setStoryAdvance,
    setPovMode,
    setSceneTransitionOnce,
    clearAll,
    hydrateFromLocalStorage,
  } = useCreativeStore()
  const { isModelReady, assertModelReady } = useModelGuard()
  const { activeModel } = useAIModelStore()
  const { t } = useTranslation()

  const [internalMessage, setInternalMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout>()
  const composingRef = useRef(false)
  const sendingRef = useRef(false)

  const currentCharacter = character || activeCharacter
  const message = value !== undefined ? value : internalMessage

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  // Handle recording timer
  useEffect(() => {
    try { hydrateFromLocalStorage() } catch {}
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      setRecordingTime(0)
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const handleSend = async () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      toast.error(t('chat.error.emptyMessage'))
      return
    }

    if (!currentCharacter) {
      toast.error(t('chat.error.selectCharacter'))
      return
    }

    // 检查模型是否已配置
    if (!isModelReady) {
      toast.error('请先配置 AI 模型')
      assertModelReady() // 自动打开设置抽屉
      return
    }

    setIsRecording(false) // Stop any ongoing recording

    try {
      if (sendingRef.current) return
      sendingRef.current = true
      handleSetMessage('') // Clear input immediately

      if (onSend) {
        await onSend(trimmedMessage)
      } else if (onSendMessage) {
        onSendMessage(trimmedMessage)
      } else {
        toast.error(t('chat.error.sendNotConfigured'))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(t('chat.error.sendFailed'))
      handleSetMessage(trimmedMessage) // Restore message on error
    } finally {
      sendingRef.current = false
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (composingRef.current) return
    if (e.repeat) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startRecording = async () => {
    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // 检查浏览器是否支持MediaRecorder
      if (!window.MediaRecorder) {
        toast.error(t('chat.error.recordingNotSupported'))
        return
      }
      
      setIsRecording(true)
      
      // 这里应该实现实际的录音功能
      // 由于完整实现需要音频处理和STT服务，这里提供基础框架
      toast(t('chat.error.recordingNeedsSTT'))
      
      // 清理资源
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error(t('chat.error.microphonePermission'))
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    // 停止录制并处理音频
    // 实际实现需要：
    // 1. 停止 MediaRecorder
    // 2. 将录音转换为可上传格式
    // 3. 调用语音转文字API (如 OpenAI Whisper)
    // 4. 将识别结果插入到输入框
  }

  const handleFileUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.txt,.json,.png,.jpg,.jpeg,.pdf,.doc,.docx'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      // 检查文件大小 (10MB 限制)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('chat.error.fileTooLarge'))
        return
      }
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', file.type)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(t('chat.error.uploadFailed'))
        }
        
        const data = await response.json()
        toast.success(t('chat.file.uploadSuccess'))
        
        // 如果是图片，可以插入到消息中
        if (file.type.startsWith('image/')) {
          handleSetMessage(message + `\n[${t('chat.file.image')}: ${data.filename}]`)
        } else {
          handleSetMessage(message + `\n[${t('chat.file.file')}: ${data.filename}]`)
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error(t('chat.error.uploadFailed'))
      }
    }
    input.click()
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const canRegenerate = currentChat && currentChat.messages && Array.isArray(currentChat.messages) && currentChat.messages.length > 0

  const handleSetMessage = (msg: string) => {
    if (onChange) {
      onChange(msg)
    } else {
      setInternalMessage(msg)
    }
  }

  const quickActions = [
    { label: '继续对话', action: () => handleSetMessage('请继续我们的对话') },
    { label: '换个话题', action: () => handleSetMessage('我们来聊聊别的话题吧') },
    { label: '角色扮演', action: () => handleSetMessage('请你更深入地扮演这个角色') },
    { label: '详细描述', action: () => handleSetMessage('请详细描述一下你现在的状态和想法') },
  ]

  // Handlers for global toggles moved near input
  const handleToggleStreaming = () => {
    toggleStreaming()
    toast.success(
      isStreamingEnabled
        ? '已切换到完整输出模式'
        : '已切换到流式输出模式',
      { duration: 2000 }
    )
  }

  const handleToggleFastMode = () => {
    toggleFastMode()
    toast.success(
      isFastModeEnabled
        ? '已关闭快速模式'
        : '已开启快速模式（Temperature: 0.3）',
      { duration: 2000 }
    )
  }

  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <Box
      className={className}
      style={{
        borderTop: '1px solid rgba(55, 65, 81, 0.5)',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <Stack gap="md" p="md">
        {/* Compact Header: Character + Model + Mode Toggles */}
        {currentCharacter && (
          <Group
            justify="space-between"
            px="xs"
            py={6}
            style={{
              borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
            }}
          >
            {/* Left: Character info */}
            <Group gap="xs" style={{ minWidth: 0 }}>
              <Box
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to bottom right, rgb(59, 130, 246), rgb(168, 85, 247))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text size="xs" fw={700} c="white">
                  {currentCharacter.name.charAt(0)}
                </Text>
              </Box>
              <Text size="sm" fw={500} truncate>
                {currentCharacter.name}
              </Text>
            </Group>
            
            {/* Right: Model + Mode toggles */}
            <Group gap={6}>
              {activeModel && (
                <Text
                  size="xs"
                  c="dimmed"
                  truncate
                  visibleFrom="sm"
                  maw={200}
                  title={`${activeModel.provider} - ${activeModel.model}`}
                >
                  {activeModel.provider}/{activeModel.model}
                </Text>
              )}
              
              {/* Compact Mode Toggles */}
              <Tooltip label={isStreamingEnabled ? '流式输出已开启' : '流式输出已关闭'}>
                <ActionIcon
                  variant={isStreamingEnabled ? 'light' : 'subtle'}
                  color={isStreamingEnabled ? 'blue' : 'gray'}
                  onClick={handleToggleStreaming}
                  disabled={disabled || isLoading}
                  size="sm"
                  style={{
                    border: isStreamingEnabled ? '1px solid rgba(59, 130, 246, 0.3)' : 'none',
                  }}
                >
                  <IconBroadcast
                    size={14}
                    className={isStreamingEnabled ? 'animate-pulse' : ''}
                  />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={isFastModeEnabled ? '快速模式已开启' : '快速模式已关闭'}>
                <ActionIcon
                  variant={isFastModeEnabled ? 'light' : 'subtle'}
                  color={isFastModeEnabled ? 'yellow' : 'gray'}
                  onClick={handleToggleFastMode}
                  disabled={disabled || isLoading}
                  size="sm"
                  style={{
                    border: isFastModeEnabled ? '1px solid rgba(251, 191, 36, 0.3)' : 'none',
                  }}
                >
                  <IconBolt
                    size={14}
                    className={isFastModeEnabled ? 'animate-pulse' : ''}
                  />
                </ActionIcon>
              </Tooltip>
              
              {/* Loading indicator */}
              {isLoading && (
                <Box
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(96, 165, 250)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />
              )}
            </Group>
          </Group>
        )}

        {/* Recording Status */}
        {isRecording && (
          <Group
            justify="space-between"
            p="xs"
            style={{
              borderRadius: '0.5rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              animation: 'fadeIn 0.3s ease-in-out',
            }}
          >
            <Group gap="xs">
              <Box
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'rgb(239, 68, 68)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              <Text size="xs" c="red.4" fw={500}>
                {t('chat.status.recording')}
              </Text>
              <Badge
                size="xs"
                variant="filled"
                color="red"
                style={{
                  fontFamily: 'monospace',
                }}
              >
                {formatRecordingTime(recordingTime)}
              </Badge>
            </Group>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={stopRecording}
              leftSection={<IconMicrophoneOff size={12} />}
            >
              <Text visibleFrom="sm">{t('chat.status.stopRecording')}</Text>
            </Button>
          </Group>
        )}

        {/* Compact Input Area - ChatGPT/Grok Style */}
        <Group gap={6} align="flex-end">
          {/* Main Input Container */}
          <Box style={{ flex: 1, position: 'relative' }}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleSetMessage(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => { composingRef.current = true }}
              onCompositionEnd={() => { composingRef.current = false }}
              onFocus={() => setShowShortcuts(true)}
              onBlur={() => setShowShortcuts(false)}
              placeholder={placeholder || t('chat.message.placeholder')}
              disabled={disabled || isLoading || isRecording}
              minRows={1}
              maxRows={5}
              autosize
              styles={{
                input: {
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgb(243, 244, 246)',
                  minHeight: '44px',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  '&:focus': {
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                  },
                  '&::placeholder': {
                    color: 'rgb(156, 163, 175)',
                  },
                },
              }}
            />
          </Box>

          {/* Compact Action Buttons - Right Side */}
          <Group gap={4}>
            {/* File Upload */}
            <Tooltip label={t('chat.file.upload')}>
              <ActionIcon
                variant="light"
                onClick={handleFileUpload}
                disabled={disabled || isLoading || isRecording}
                size="lg"
              >
                <IconPaperclip size={16} />
              </ActionIcon>
            </Tooltip>

            {/* Voice Recording */}
            <Tooltip label={isRecording ? t('chat.voice.stopRecording') : t('chat.voice.input')}>
              <ActionIcon
                variant={isRecording ? 'filled' : 'light'}
                color={isRecording ? 'red' : 'gray'}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled || isLoading}
                size="lg"
              >
                {isRecording ? <IconMicrophoneOff size={16} /> : <IconMicrophone size={16} />}
              </ActionIcon>
            </Tooltip>

            {/* Quick Actions */}
            <Menu position="top-end" shadow="md" withinPortal>
              <Menu.Target>
                <Tooltip label={t('chat.quickActions.title')}>
                  <ActionIcon
                    variant="light"
                    disabled={disabled || isLoading || isRecording || !currentCharacter}
                    size="lg"
                  >
                    <IconSparkles size={16} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                {quickActions.map((action, index) => (
                  <Menu.Item
                    key={index}
                    onClick={action.action}
                  >
                    {action.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>

            {/* Send Button - Slightly larger for prominence */}
            <Tooltip label={t('chat.message.sendEnter')}>
              <ActionIcon
                variant="gradient"
                gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
                onClick={handleSend}
                disabled={
                  disabled ||
                  isLoading ||
                  isRecording ||
                  !message.trim() ||
                  !currentCharacter ||
                  !isModelReady
                }
                size={40}
                style={{
                  opacity: (disabled || isLoading || isRecording || !message.trim() || !currentCharacter || !isModelReady) ? 0.5 : 1,
                }}
              >
                <IconSend size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Character Counter - Compact, shown only when typing */}
        {message.length > 100 && (
          <Group justify="flex-end" px="xs">
            <Text
              size="xs"
              c={message.length > 3800 ? 'red.4' : 'dimmed'}
              fw={message.length > 3800 ? 700 : 400}
            >
              {message.length}/4000
            </Text>
          </Group>
        )}

        {/* Creative Intent Controls - Compact Single Row */}
        {currentCharacter && (
          <Group gap={6} px="xs">
            <Button
              variant={storyAdvance ? 'light' : 'subtle'}
              color={storyAdvance ? 'yellow' : 'gray'}
              size="xs"
              onClick={() => setStoryAdvance(!storyAdvance)}
              leftSection={
                storyAdvance && (
                  <Box
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'rgb(251, 191, 36)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  />
                )
              }
              styles={{
                root: {
                  border: storyAdvance
                    ? '1px solid rgba(251, 191, 36, 0.4)'
                    : '1px solid rgba(251, 191, 36, 0.2)',
                },
              }}
            >
              剧情推进
            </Button>
            
            <Button
              variant={povMode ? 'light' : 'subtle'}
              color={povMode ? 'teal' : 'gray'}
              size="xs"
              onClick={() => setPovMode(povMode === null ? 'first' : povMode === 'first' ? 'third' : null)}
              leftSection={
                povMode && (
                  <Box
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'rgb(45, 212, 191)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  />
                )
              }
              styles={{
                root: {
                  border: povMode
                    ? '1px solid rgba(45, 212, 191, 0.4)'
                    : '1px solid rgba(45, 212, 191, 0.2)',
                },
              }}
            >
              {povMode ? (povMode === 'first' ? '第一人称' : '第三人称') : '视角设计'}
            </Button>
            
            <Button
              variant={sceneTransitionOnce ? 'light' : 'subtle'}
              color={sceneTransitionOnce ? 'violet' : 'gray'}
              size="xs"
              onClick={() => setSceneTransitionOnce(true)}
              leftSection={
                sceneTransitionOnce && (
                  <Box
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'rgb(168, 85, 247)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  />
                )
              }
              styles={{
                root: {
                  border: sceneTransitionOnce
                    ? '1px solid rgba(168, 85, 247, 0.4)'
                    : '1px solid rgba(168, 85, 247, 0.2)',
                },
              }}
            >
              场景过渡
            </Button>
            
            {(storyAdvance || povMode || sceneTransitionOnce) && (
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                onClick={clearAll}
                leftSection={<IconX size={12} />}
              >
                清空
              </Button>
            )}
          </Group>
        )}

        {/* Keyboard Shortcuts - Show on focus */}
        {showShortcuts && (
          <Group gap="sm" px="xs" style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)' }}>
            <Group gap={4}>
              <kbd
                style={{
                  padding: '2px 6px',
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderRadius: '0.25rem',
                  color: 'rgb(96, 165, 250)',
                }}
              >
                ↵
              </kbd>
              <Text size="xs" visibleFrom="sm">
                {t('chat.shortcuts.send')}
              </Text>
            </Group>
            <Group gap={4} visibleFrom="sm">
              <kbd
                style={{
                  padding: '2px 6px',
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderRadius: '0.25rem',
                  color: 'rgb(168, 85, 247)',
                }}
              >
                ⇧↵
              </kbd>
              <Text size="xs">{t('chat.shortcuts.newline')}</Text>
            </Group>
          </Group>
        )}
      </Stack>
    </Box>
  )
}
