/**
 * Message input component for chat interface
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, MicOff, RotateCcw, Sparkles, Zap, Radio, X } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useCreativeStore } from '@/stores/creativeStore'
import { useModelGuard } from '@/hooks/useModelGuard'
import { useAIModelStore } from '@/stores/aiModelStore'
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
    <div className={`border-t border-gray-800/50 glass-card backdrop-blur-lg ${className}`}>
      <div className="p-3">

        {/* Compact Header: Character + Model + Mode Toggles */}
        {currentCharacter && (
          <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-gray-800/30">
            {/* Left: Character info */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{currentCharacter.name.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium truncate">{currentCharacter.name}</span>
            </div>
            
            {/* Right: Model + Mode toggles */}
            <div className="flex items-center gap-1.5">
              {activeModel && (
                <span className="text-xs text-gray-400 hidden sm:inline truncate max-w-[200px]" title={`${activeModel.provider} - ${activeModel.model}`}>
                  {activeModel.provider}/{activeModel.model}
                </span>
              )}
              
              {/* Compact Mode Toggles */}
              <button
                onClick={handleToggleStreaming}
                disabled={disabled || isLoading}
                className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
                  isStreamingEnabled 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' 
                    : 'text-gray-500 hover:text-gray-400 hover:bg-gray-800/50'
                }`}
                title={isStreamingEnabled ? '流式输出已开启' : '流式输出已关闭'}
              >
                <Radio className={`w-3.5 h-3.5 ${isStreamingEnabled ? 'animate-pulse' : ''}`} />
              </button>

              <button
                onClick={handleToggleFastMode}
                disabled={disabled || isLoading}
                className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
                  isFastModeEnabled 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30' 
                    : 'text-gray-500 hover:text-gray-400 hover:bg-gray-800/50'
                }`}
                title={isFastModeEnabled ? '快速模式已开启' : '快速模式已关闭'}
              >
                <Zap className={`w-3.5 h-3.5 ${isFastModeEnabled ? 'animate-pulse' : ''}`} />
              </button>
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse ml-1"></div>
              )}
            </div>
          </div>
        )}

        {/* Recording Status - Keep as-is (important status) */}
        {isRecording && (
          <div className="flex items-center justify-between mb-2 p-2 glass-card rounded-lg border border-red-500/30 animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-400 font-medium">{t('chat.status.recording')}</span>
              <span className="text-xs text-red-300 font-mono bg-red-950/50 px-2 py-0.5 rounded">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={stopRecording}
              className="glass-light border-red-500/30 text-red-400 hover:bg-red-900/30 h-6 text-xs"
            >
              <MicOff className="w-3 h-3 sm:mr-1.5" />
              <span className="hidden sm:inline">{t('chat.status.stopRecording')}</span>
            </Button>
          </div>
        )}

        {/* Compact Input Area - ChatGPT/Grok Style */}
        <div className="flex items-end gap-1.5">
          {/* Main Input Container */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleSetMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => { composingRef.current = true }}
              onCompositionEnd={() => { composingRef.current = false }}
              onFocus={() => setShowShortcuts(true)}
              onBlur={() => setShowShortcuts(false)}
              placeholder={placeholder || t('chat.message.placeholder')}
              disabled={disabled || isLoading || isRecording}
              className="glass-input input-focus min-h-[44px] max-h-[120px] resize-none text-sm rounded-lg border-white/10 focus:border-blue-400/30 transition-all pr-1"
              rows={1}
            />
          </div>

          {/* Compact Action Buttons - Right Side */}
          <div className="flex items-center gap-1">
            {/* File Upload */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleFileUpload}
              disabled={disabled || isLoading || isRecording}
              className="glass-light hover:bg-white/10 text-gray-400 hover:text-white border-white/10 h-9 w-9 rounded-lg"
              title={t('chat.file.upload')}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Voice Recording */}
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || isLoading}
              className={isRecording 
                ? "bg-red-600 hover:bg-red-700 h-9 w-9 rounded-lg" 
                : "glass-light hover:bg-white/10 text-gray-400 hover:text-white border-white/10 h-9 w-9 rounded-lg"}
              title={isRecording ? t('chat.voice.stopRecording') : t('chat.voice.input')}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={disabled || isLoading || isRecording || !currentCharacter}
                  className="glass-light hover:bg-white/10 text-gray-400 hover:text-white border-white/10 h-9 w-9 rounded-lg"
                  title={t('chat.quickActions.title')}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass-card border-white/10 rounded-xl">
                {quickActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={action.action}
                    className="cursor-pointer hover:bg-white/10 rounded-lg text-sm"
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Send Button - Slightly larger for prominence */}
            <Button
              type="button"
              onClick={handleSend}
              disabled={
                disabled ||
                isLoading ||
                isRecording ||
                !message.trim() ||
                !currentCharacter ||
                !isModelReady
              }
              className="gradient-btn-primary h-10 w-10 rounded-lg disabled:opacity-50"
              title={t('chat.message.sendEnter')}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Character Counter - Compact, shown only when typing */}
        {message.length > 100 && (
          <div className="flex justify-end mt-1 px-1">
            <span className={`text-xs ${message.length > 3800 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
              {message.length}/4000
            </span>
          </div>
        )}

        {/* Creative Intent Controls - Compact Single Row */}
        {currentCharacter && (
          <div className="mt-2 px-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setStoryAdvance(!storyAdvance)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-all ${
                  storyAdvance 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                    : 'bg-gray-800/40 text-amber-400/60 border-amber-400/20 hover:text-amber-300 hover:border-amber-300/30'
                }`}
                aria-label="剧情推进"
              >
                {storyAdvance && <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></span>}
                剧情推进
              </button>
              <button
                type="button"
                onClick={() => setPovMode(povMode === null ? 'first' : povMode === 'first' ? 'third' : null)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-all ${
                  povMode 
                    ? 'bg-teal-500/20 text-teal-300 border-teal-400/40' 
                    : 'bg-gray-800/40 text-teal-400/60 border-teal-400/20 hover:text-teal-300 hover:border-teal-300/30'
                }`}
                aria-label="视角设计"
              >
                {povMode && <span className="w-1 h-1 rounded-full bg-teal-400 animate-pulse"></span>}
                {povMode ? (povMode === 'first' ? '第一人称' : '第三人称') : '视角设计'}
              </button>
              <button
                type="button"
                onClick={() => setSceneTransitionOnce(true)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-all ${
                  sceneTransitionOnce 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-400/40' 
                    : 'bg-gray-800/40 text-purple-400/60 border-purple-400/20 hover:text-purple-300 hover:border-purple-300/30'
                }`}
                aria-label="场景过渡"
              >
                {sceneTransitionOnce && <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse"></span>}
                场景过渡
              </button>
              {(storyAdvance || povMode || sceneTransitionOnce) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border bg-gray-800/40 text-gray-400 border-white/10 hover:bg-gray-700/50 hover:text-white transition-all"
                >
                  <X className="w-3 h-3" />
                  清空
                </button>
              )}
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts - Show on focus */}
        {showShortcuts && (
          <div className="flex items-center gap-2 mt-1.5 px-1 text-xs text-gray-500 animate-in fade-in duration-200">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800/50 rounded text-blue-400">↵</kbd>
              <span className="hidden sm:inline">{t('chat.shortcuts.send')}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800/50 rounded text-purple-400">⇧↵</kbd>
              {t('chat.shortcuts.newline')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}