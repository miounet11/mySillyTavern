/**
 * Incomplete Interaction Prompt Component
 * 当检测到对话中断时显示的行内提示组件
 */

'use client'

import { AlertCircle, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className={`flex justify-start my-4 animate-fade-in ${className}`}>
      <div className="max-w-[80%]">
        <div className="relative rounded-xl px-5 py-4 shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-900/40 to-amber-800/40 border border-amber-600/50 backdrop-blur-sm">
          {/* Icon and Message */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-100 leading-relaxed">
                {getMessage()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-8">
            <Button
              size="sm"
              onClick={onContinue}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              继续生成
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              className="bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-white border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4 mr-1.5" />
              忽略
            </Button>
          </div>

          {/* Decorative corner accent */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-500/60 rounded-tl-xl"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-500/60 rounded-br-xl"></div>
        </div>
      </div>
    </div>
  )
}

