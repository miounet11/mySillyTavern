/**
 * ModelSetupBanner - Subtle top banner to prompt AI model configuration
 * Shows when no model is configured, non-intrusive alternative to auto-popup
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconRocket, IconX, IconSparkles, IconSettings } from '@tabler/icons-react'

interface ModelSetupBannerProps {
  onOpenSetup: () => void
  onDismiss?: () => void
}

export default function ModelSetupBanner({ onOpenSetup, onDismiss }: ModelSetupBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-40 animate-slide-down">
      <div className="bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-pink-600/95 backdrop-blur-sm border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Icon + Message */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm flex-shrink-0">
                <IconSparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm sm:text-base">
                  需要配置 AI 模型才能开始对话
                </p>
                <p className="text-white/80 text-xs hidden sm:block mt-0.5">
                  选择 OpenAI、Anthropic 或 Google Gemini，只需 2 步即可完成
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={onOpenSetup}
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                size="sm"
              >
                <IconRocket className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">立即配置</span>
                <span className="sm:hidden">配置</span>
              </Button>
              
              <button
                onClick={handleDismiss}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                aria-label="关闭横幅"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom glow effect */}
      <div className="h-1 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 blur-sm" />
    </div>
  )
}

