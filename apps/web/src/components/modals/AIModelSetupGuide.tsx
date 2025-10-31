'use client'

import { Wand2, Settings, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIModelSetupGuideProps {
  isOpen: boolean
  onClose: () => void
  onOpenSettings: () => void
  isMobile?: boolean
}

export default function AIModelSetupGuide({
  isOpen,
  onClose,
  onOpenSettings,
  isMobile = false
}: AIModelSetupGuideProps) {
  if (!isOpen) return null

  const handleSetupClick = () => {
    onOpenSettings()
    // On mobile, the guide will be hidden by the parent component
    // On desktop, it stays visible as backdrop
  }

  const steps = [
    {
      icon: Settings,
      title: '选择AI提供商',
      description: 'OpenAI, Claude, DeepSeek, 或本地模型',
      color: 'text-blue-400'
    },
    {
      icon: Check,
      title: '输入API密钥',
      description: '或配置本地模型连接',
      color: 'text-teal-400'
    },
    {
      icon: Wand2,
      title: '选择对话模型',
      description: 'GPT-4, Claude-3, 或其他',
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className={`w-full h-full flex items-center justify-center p-4 ${isMobile ? 'pb-24' : ''}`}>
        <div className="glass-card rounded-2xl p-6 sm:p-8 md:p-10 max-w-2xl w-full mx-auto shadow-2xl border border-white/10">
          {/* Header Icon */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-400/30 mb-4 sm:mb-6 animate-pulse-glow">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-teal-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2 sm:mb-3">
              让我们开始你的AI对话之旅 ✨
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              只需3个简单步骤，即可开启智能对话体验
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-3 sm:gap-4 mb-6 sm:mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="glass-light rounded-lg p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-400/30 flex items-center justify-center">
                      <span className="text-teal-400 font-bold text-sm sm:text-base">{index + 1}</span>
                    </div>
                  </div>
                  
                  {/* Step Icon & Content */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <step.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${step.color} flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleSetupClick}
              className="gradient-btn-teal gap-2 h-12 sm:h-14 w-full sm:flex-1 hover-lift text-base sm:text-lg font-semibold"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>立即配置 AI 模型</span>
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="glass-light hover:bg-white/10 text-white border-white/20 h-12 sm:h-14 w-full sm:w-auto px-6 hover-lift text-sm sm:text-base"
            >
              稍后再说
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              💡 提示：配置AI模型后才能开始对话体验
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

