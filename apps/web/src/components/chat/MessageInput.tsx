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
  value?: string
  onChange?: (value: string) => void
  onSend?: (message: string) => Promise<void>
  onSendMessage?: (message: string) => void
}

export default function MessageInput({
  className = '',
  placeholder = '输入消息...',
  disabled = false,
  value,
  onChange,
  onSend,
  onSendMessage
}: MessageInputProps) {
  const { currentChat, isLoading, character } = useChatStore()
  const { selectedCharacter: activeCharacter } = useCharacterStore()

  const [internalMessage, setInternalMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout>()

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

    if (!currentCharacter) {
      toast.error('请先选择一个角色')
      return
    }

    setIsRecording(false) // Stop any ongoing recording

    try {
      handleSetMessage('') // Clear input immediately

      if (onSend) {
        await onSend(trimmedMessage)
      } else if (onSendMessage) {
        onSendMessage(trimmedMessage)
      } else {
        toast.error('发送功能未配置')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('发送消息失败')
      handleSetMessage(trimmedMessage) // Restore message on error
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
        toast.error('您的浏览器不支持语音录制')
        return
      }
      
      setIsRecording(true)
      
      // 这里应该实现实际的录音功能
      // 由于完整实现需要音频处理和STT服务，这里提供基础框架
      toast('语音录制功能需要配置语音识别服务 (如 Whisper API)')
      
      // 清理资源
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('无法访问麦克风，请检查权限设置')
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
        toast.error('文件大小不能超过 10MB')
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
          throw new Error('上传失败')
        }
        
        const data = await response.json()
        toast.success('文件上传成功')
        
        // 如果是图片，可以插入到消息中
        if (file.type.startsWith('image/')) {
          handleSetMessage(message + `\n[图片: ${data.filename}]`)
        } else {
          handleSetMessage(message + `\n[文件: ${data.filename}]`)
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error('文件上传失败')
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

  return (
    <div className={`border-t border-gray-800 bg-gray-900 ${className}`}>
      <div className="p-4">
        {/* Character Context */}
        {currentCharacter && (
          <div className="flex items-center space-x-2 mb-3 text-sm text-gray-400">
            <span>正在与</span>
            <span className="font-medium text-gray-300">{currentCharacter.name}</span>
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
              onChange={(e) => handleSetMessage(e.target.value)}
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
                  disabled={disabled || isLoading || isRecording || !currentCharacter}
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
                    onClick={action.action}
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
                onClick={() => toast('重新生成功能开发中...')}
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
                !currentCharacter
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
            {currentCharacter && (
              <span>模型: {currentCharacter.settings?.temperature?.toFixed(1) || '0.7'}</span>
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