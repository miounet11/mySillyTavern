/**
 * Chat control bar component for streaming, fast mode, and other controls
 */

'use client'

import { useState } from 'react'
import { Zap, Radio, ArrowDown, RotateCcw, Loader2 } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useTranslation } from '@/lib/i18n'

interface ChatControlBarProps {
  onScrollToBottom?: () => void
  onRegenerate?: () => void
  showRegenerate?: boolean
  disabled?: boolean
}

export default function ChatControlBar({
  onScrollToBottom,
  onRegenerate,
  showRegenerate = true,
  disabled = false
}: ChatControlBarProps) {
  const { t } = useTranslation()
  const {
    isStreamingEnabled,
    isFastModeEnabled,
    isGenerating,
    toggleStreaming,
    toggleFastMode
  } = useChatStore()

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
    <div className="flex items-center justify-between gap-3 px-4 py-2 glass-light border-b border-gray-800/30">
      {/* Left: Generation Controls */}
      <div className="flex items-center gap-2">
        {/* Streaming Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleStreaming}
          disabled={disabled || isGenerating}
          className={`
            h-8 px-3 text-xs font-medium transition-all duration-200
            ${isStreamingEnabled 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/30' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
            }
          `}
          title={isStreamingEnabled ? '流式输出已开启' : '流式输出已关闭'}
        >
          <Radio className={`w-3.5 h-3.5 mr-1.5 ${isStreamingEnabled ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">流式输出</span>
          <span className="sm:hidden">流式</span>
        </Button>

        {/* Fast Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFastMode}
          disabled={disabled || isGenerating}
          className={`
            h-8 px-3 text-xs font-medium transition-all duration-200
            ${isFastModeEnabled 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
            }
          `}
          title={isFastModeEnabled ? '快速模式已开启（Temperature: 0.3）' : '快速模式已关闭'}
        >
          <Zap className={`w-3.5 h-3.5 mr-1.5 ${isFastModeEnabled ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">快速模式</span>
          <span className="sm:hidden">快速</span>
        </Button>
      </div>

      {/* Right: Action Controls */}
      <div className="flex items-center gap-2">
        {/* Regenerate Button */}
        {showRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={disabled || isGenerating}
            className="h-8 px-3 text-xs font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
            title="重新生成最后一条回复"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span className="hidden sm:inline">重新生成</span>
            <span className="sm:hidden">重生成</span>
          </Button>
        )}

        {/* Scroll to Bottom Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onScrollToBottom}
          disabled={disabled}
          className="h-8 px-3 text-xs font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
          title="跳转到对话底部"
        >
          <ArrowDown className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden sm:inline">跳转底部</span>
          <span className="sm:hidden">底部</span>
        </Button>
      </div>

      {/* Status Indicators */}
      {(isStreamingEnabled || isFastModeEnabled) && (
        <div className="hidden md:flex items-center gap-2 ml-4 text-xs text-gray-500">
          {isStreamingEnabled && (
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              流式
            </span>
          )}
          {isFastModeEnabled && (
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
              快速 (0.3)
            </span>
          )}
        </div>
      )}
    </div>
  )
}

