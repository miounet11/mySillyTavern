/**
 * Message input component for chat interface
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, MicOff, RotateCcw, Sparkles } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { useCharacterStore } from '@/stores/characterStore'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MessageInputProps {
  className?: string
  placeholder?: string
  disabled?: boolean
  onSendMessage?: (message: string) => void
}

export default function MessageInput({
  className = '',
  placeholder = '输入消息...',
  disabled = false,
  onSendMessage
}: MessageInputProps) {
  const { currentChat, selectedCharacter, isLoading, sendMessage, regenerateLastResponse } = useChatStore()
  const { selectedCharacter: activeCharacter } = useCharacterStore()

  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout>()

  const character = selectedCharacter || activeCharacter

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
      toast.error('请输入消息内容')
      return
    }

    if (!character) {
      toast.error('请先选择一个角色')
      return
    }

    setIsRecording(false) // Stop any ongoing recording

    try {
      setMessage('') // Clear input immediately

      if (onSendMessage) {
        onSendMessage(trimmedMessage)
      } else {
        await sendMessage(trimmedMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('发送消息失败')
      setMessage(trimmedMessage) // Restore message on error
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    // TODO: Implement actual voice recording
    toast.info('语音录制功能开发中...')
  }

  const stopRecording = () => {
    setIsRecording(false)
    // TODO: Implement actual voice recording stop and processing
  }

  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.txt,.json,.png,.jpg,.jpeg'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // TODO: Implement file upload functionality
        toast.info('文件上传功能开发中...')
      }
    }
    input.click()
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const canRegenerate = currentChat && currentChat.messages.length > 0

  const quickActions = [
    { label: '继续对话', action: () => setMessage('请继续我们的对话') },
    { label: '换个话题', action: () => setMessage('我们来聊聊别的话题吧') },
    { label: '角色扮演', action: () => setMessage('请你更深入地扮演这个角色') },
    { label: '详细描述', action: () => setMessage('请详细描述一下你现在的状态和想法') },
  ]

  return (
    <div className={`border-t border-gray-800 bg-gray-900 ${className}`}>
      <div className="p-4">
        {/* Character Context */}
        {character && (
          <div className="flex items-center space-x-2 mb-3 text-sm text-gray-400">
            <span>正在与</span>
            <span className="font-medium text-gray-300">{character.name}</span>
            <span>对话</span>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-between mb-3 p-2 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400">正在录制...</span>
              <span className="text-sm text-red-300 font-mono">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={stopRecording}
              className="border-red-800 text-red-400 hover:bg-red-900/30"
            >
              <MicOff className="w-4 h-4 mr-2" />
              停止录制
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end space-x-3">
          {/* Main Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isLoading || isRecording}
              className="tavern-input min-h-[60px] max-h-[200px] resize-none pr-12"
              rows={1}
            />

            {/* Character Count */}
            {message.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {message.length}/4000
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* File Upload */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFileUpload}
              disabled={disabled || isLoading || isRecording}
              className="tavern-button-secondary"
              title="上传文件"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Voice Recording */}
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || isLoading}
              className={isRecording ? "" : "tavern-button-secondary"}
              title={isRecording ? "停止录制" : "语音输入"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || isLoading || isRecording || !character}
                  className="tavern-button-secondary"
                  title="快捷操作"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {quickActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setMessage(action.action)}
                    className="cursor-pointer"
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Regenerate Response */}
            {canRegenerate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => regenerateLastResponse()}
                disabled={disabled || isLoading}
                className="tavern-button-secondary"
                title="重新生成上一条回复"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}

            {/* Send Button */}
            <Button
              type="button"
              onClick={handleSend}
              disabled={
                disabled ||
                isLoading ||
                isRecording ||
                !message.trim() ||
                !character
              }
              className="tavern-button"
              title="发送消息 (Enter)"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Enter 发送, Shift+Enter 换行</span>
            {character && (
              <span>模型: {character.settings?.temperature?.toFixed(1) || '0.7'}</span>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>AI正在思考...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}