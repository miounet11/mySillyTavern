/**
 * Message input component for chat interface
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, MicOff, RotateCcw, Sparkles, Zap, Radio, X } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useCreativeStore } from '@/stores/creativeStore'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/lib/i18n'

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

  return (
    <div className={`border-t border-gray-800/50 glass-card backdrop-blur-lg ${className}`}>
      <div className="p-5">

        {/* Character Context and Status */}
        {currentCharacter && (
          <div className="flex items-center space-x-2 mb-4 glass-light px-4 py-2 rounded-lg w-fit">
            <span className="text-sm text-gray-400">{t('chat.chattingWith')}</span>
            <span className="font-semibold gradient-text">{currentCharacter.name}</span>
            <span className="text-sm text-gray-400">{t('chat.conversation')}</span>
          </div>
        )}
        
        {/* Status Message when input is disabled */}
        {(!currentChat && !isLoading) && (
          <div className="mb-4 p-4 glass-light rounded-xl text-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse-glow"></div>
              <span className="text-blue-300 font-medium">{t('chat.status.initializing')}</span>
            </div>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-between mb-4 p-4 glass-card rounded-xl border border-red-500/30 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400 font-medium">{t('chat.status.recording')}</span>
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
              {t('chat.status.stopRecording')}
            </Button>
          </div>
        )}

        {/* Global Controls near input: Streaming / Fast Mode */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStreaming}
            disabled={disabled || isLoading}
            className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${isStreamingEnabled ? 'bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'} border`}
            title={isStreamingEnabled ? '流式输出已开启' : '流式输出已关闭'}
          >
            <Radio className={`w-3.5 h-3.5 mr-1.5 ${isStreamingEnabled ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">流式输出</span>
            <span className="sm:hidden">流式</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFastMode}
            disabled={disabled || isLoading}
            className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${isFastModeEnabled ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'} border`}
            title={isFastModeEnabled ? '快速模式已开启（Temperature: 0.3）' : '快速模式已关闭'}
          >
            <Zap className={`w-3.5 h-3.5 mr-1.5 ${isFastModeEnabled ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">快速模式</span>
            <span className="sm:hidden">快速</span>
          </Button>
        </div>

        {/* Input Area */}
        <div className="flex items-end space-x-3">
          {/* Main Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleSetMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { composingRef.current = true }}
            onCompositionEnd={() => { composingRef.current = false }}
              placeholder={placeholder || t('chat.message.placeholder')}
              disabled={disabled || isLoading || isRecording}
              className="glass-input input-focus min-h-[70px] max-h-[200px] resize-none pr-16 text-base"
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
              title={t('chat.file.upload')}
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
              title={isRecording ? t('chat.voice.stopRecording') : t('chat.voice.input')}
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
                  title={t('chat.quickActions.title')}
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
                onClick={() => toast(t('chat.message.regenerateInDev'))}
                disabled={disabled || isLoading}
                className="glass-light hover:bg-white/10 text-gray-300 hover:text-white border-white/20 hover-lift w-11 h-11"
                title={t('chat.message.regenerate')}
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
              title={t('chat.message.sendEnter')}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Creative intent chips (指令化开关) */}
        {currentCharacter && (
          <div className="flex flex-col gap-2 mb-3">
            {/* Active capsules */}
            <div className="flex items-center gap-2 flex-wrap">
              {storyAdvance && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full border border-amber-400/30 text-amber-300 glass-light">
                  剧情推进
                  <button className="ml-1 text-amber-300 hover:text-amber-200" onClick={() => setStoryAdvance(false)} aria-label="清除剧情推进">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {povMode && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full border border-teal-400/30 text-teal-300 glass-light">
                  视角：{povMode === 'first' ? '第一人称' : '第三人称'}
                  <button className="ml-1 text-teal-300 hover:text-teal-200" onClick={() => setPovMode(null)} aria-label="清除视角">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sceneTransitionOnce && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full border border-purple-400/30 text-purple-300 glass-light">
                  场景过渡（一次性）
                </span>
              )}
              {!storyAdvance && !povMode && !sceneTransitionOnce && (
                <span className="text-xs text-gray-500">未启用创作意图</span>
              )}
            </div>
            {/* Toggle buttons */}
            <div className="flex items-center justify-start gap-2 sm:gap-3 max-w-4xl">
              <button
                type="button"
                onClick={() => setStoryAdvance(!storyAdvance)}
                className={`px-2 py-1.5 sm:px-4 text-xs rounded-full border transition-all duration-200 glass-light bg-gray-800/60 ${storyAdvance ? 'text-amber-200 border-amber-300/60' : 'text-amber-300 border-amber-400/30 hover:text-amber-200 hover:border-amber-300/60'}`}
                aria-label="剧情推进"
              >
                <span className="hidden sm:inline">剧情推进{storyAdvance ? '（开）' : ''}</span>
                <span className="sm:hidden">剧情推进</span>
              </button>
              <button
                type="button"
                onClick={() => setPovMode(povMode === null ? 'first' : povMode === 'first' ? 'third' : null)}
                className={`px-2 py-1.5 sm:px-4 text-xs rounded-full border transition-all duration-200 glass-light bg-gray-800/60 ${povMode ? 'text-teal-200 border-teal-300/60' : 'text-teal-300 border-teal-400/30 hover:text-teal-200 hover:border-teal-300/60'}`}
                aria-label="视角设计"
              >
                <span className="hidden sm:inline">视角设计{povMode ? `（${povMode === 'first' ? '第一' : '第三'}）` : ''}</span>
                <span className="sm:hidden">视角设计</span>
              </button>
              <button
                type="button"
                onClick={() => setSceneTransitionOnce(true)}
                className={`px-2 py-1.5 sm:px-4 text-xs rounded-full border transition-all duration-200 glass-light bg-gray-800/60 ${sceneTransitionOnce ? 'text-purple-200 border-purple-300/60' : 'text-purple-300 border-purple-400/30 hover:text-purple-200 hover:border-purple-300/60'}`}
                aria-label="场景过渡"
              >
                <span className="hidden sm:inline">场景过渡{sceneTransitionOnce ? '（已启用一次性）' : ''}</span>
                <span className="sm:hidden">场景过渡</span>
              </button>
              {(storyAdvance || povMode || sceneTransitionOnce) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2 py-1.5 sm:px-4 text-xs rounded-full border transition-all duration-200 glass-light bg-gray-800/60 text-gray-300 border-white/10 hover:bg-gray-700/50"
                >
                  清空
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-3 text-xs">
            <span className="glass-light px-3 py-1.5 rounded-lg text-gray-400">
              <span className="text-blue-400">⏎</span> {t('chat.shortcuts.send')}
            </span>
            <span className="glass-light px-3 py-1.5 rounded-lg text-gray-400">
              <span className="text-purple-400">⇧</span> {t('chat.shortcuts.newline')}
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
              <span className="text-sm text-blue-300 font-medium">
                {t('chat.status.replying', { name: currentCharacter?.name || t('chat.status.character') })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}