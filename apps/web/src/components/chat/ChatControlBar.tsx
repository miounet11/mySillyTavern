/**
 * Chat control bar component for streaming, fast mode, and other controls
 */

'use client'

import { useState } from 'react'
import { ArrowDown, RotateCcw, Loader2, AlertCircle } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { Button } from '@/components/ui/button'
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
    <div className="flex items-center justify-end gap-3 px-4 py-2 glass-light border-b border-gray-800/30">
      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Check Incomplete Button */}
        {shouldShowCheckButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCheckIncomplete}
            disabled={disabled || isGenerating}
            className="h-8 px-3 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-700/20 transition-all duration-200"
            title="检查对话完整性"
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden md:inline">检测中断</span>
            <span className="md:hidden">检测</span>
          </Button>
        )}

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

      {/* Removed streaming/fast indicators (moved near input) */}
    </div>
  )
}

