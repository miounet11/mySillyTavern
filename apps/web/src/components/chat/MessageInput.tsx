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

  return (
    <div className={`border-t border-gray-800/50 glass-card backdrop-blur-lg ${className}`}>
      <div className="p-5">
        {/* Character Context and Status */}
        {currentCharacter && (
          <div className="flex items-center space-x-2 mb-4 glass-light px-4 py-2 rounded-lg w-fit">
            <span className="text-sm text-gray-400">正在与</span>
            <span className="font-semibold gradient-text">{currentCharacter.name}</span>
            <span className="text-sm text-gray-400">对话</span>
          </div>
        )}
        
        {/* Status Message when input is disabled */}
        {(!currentChat && !isLoading) && (
          <div className="mb-4 p-4 glass-light rounded-xl text-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse-glow"></div>
              <span className="text-blue-300 font-medium">正在初始化对话...</span>
            </div>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-between mb-4 p-4 glass-card rounded-xl border border-red-500/30 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400 font-medium">正在录制...</span>
              <span className="text-sm text-red-300 font-mono bg-red-950/50 px-3 py-1 rounded-lg">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={stopRecording}
              className="glass-light border-red-500/30 text-red-400 hover:bg-red-900/30 hover-lift"
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
              className="glass-input min-h-[70px] max-h-[200px] resize-none pr-16 text-base"
              rows={1}
            />

            {/* Character Count */}
            {message.length > 0 && (
              <div className="absolute bottom-3 right-3 text-xs font-medium glass-light px-2 py-1 rounded-lg">
                <span className={message.length > 3800 ? 'text-red-400' : 'text-gray-400'}>
                  {message.length}/4000
                </span>
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
              className="glass-light hover:bg-white/10 text-gray-300 hover:text-white border-white/20 hover-lift w-11 h-11"
              title="上传文件"
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            {/* Voice Recording */}
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || isLoading}
              className={isRecording ? "bg-red-600 hover:bg-red-700 w-11 h-11" : "glass-light hover:bg-white/10 text-gray-300 hover:text-white border-white/20 hover-lift w-11 h-11"}
              title={isRecording ? "停止录制" : "语音输入"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || isLoading || isRecording || !currentCharacter}
                  className="glass-light hover:bg-white/10 text-gray-300 hover:text-white border-white/20 hover-lift w-11 h-11"
                  title="快捷操作"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass-card border-white/10">
                {quickActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={action.action}
                    className="cursor-pointer hover:bg-white/10"
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
                className="glass-light hover:bg-white/10 text-gray-300 hover:text-white border-white/20 hover-lift w-11 h-11"
                title="重新生成上一条回复"
              >
                <RotateCcw className="w-5 h-5" />
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
              className="gradient-btn-primary hover-lift w-14 h-11"
              title="发送消息 (Enter)"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3 text-xs">
            <span className="glass-light px-3 py-1.5 rounded-lg text-gray-400">
              <span className="text-blue-400">⏎</span> Enter 发送
            </span>
            <span className="glass-light px-3 py-1.5 rounded-lg text-gray-400">
              <span className="text-purple-400">⇧</span> Shift+Enter 换行
            </span>
            {currentCharacter && (
              <span className="glass-light px-3 py-1.5 rounded-lg text-gray-400">
                <span className="text-teal-400">🎨</span> {currentCharacter.settings?.temperature?.toFixed(1) || '0.7'}
              </span>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center space-x-2 glass-light px-4 py-2 rounded-lg animate-pulse-glow">
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-300 font-medium">AI正在思考...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}