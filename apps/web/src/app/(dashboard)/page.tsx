'use client'

import { useRouter } from 'next/navigation'
import { Users, Globe, Settings, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsUIStore } from '@/stores/settingsUIStore'

export default function HomePage() {
  const router = useRouter()
  const { openSettings } = useSettingsUIStore()

  const steps = [
    {
      icon: Users,
      title: '选择角色',
      description: '从社区或自建角色卡',
      action: '浏览角色',
      href: '/characters'
    },
    {
      icon: Settings,
      title: '配置模型',
      description: '连接您的AI服务',
      action: '配置模型',
      onClick: () => openSettings('models')
    },
    {
      icon: Zap,
      title: '开始对话',
      description: '享受智能AI交互',
      action: '开始聊天',
      href: '/chat'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section - Simplified */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent"></div>
        <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl relative">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">SillyTavern</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              AI 角色对话平台，让创意无限延伸
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => router.push('/characters')}
                className="tavern-button text-base md:text-lg px-6 md:px-8 py-5 md:py-6 min-h-[44px]"
              >
                <Users className="w-5 h-5 mr-2" />
                浏览角色
              </Button>
              <Button
                onClick={() => router.push('/characters/community')}
                variant="outline"
                className="tavern-button-secondary text-base md:text-lg px-6 md:px-8 py-5 md:py-6 min-h-[44px]"
              >
                <Globe className="w-5 h-5 mr-2" />
                社区角色卡
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Step Flow - Core Gameplay */}
      <div className="container mx-auto px-6 py-12 md:py-20 max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-16 text-gray-100">
          三步开始使用
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="relative bg-gray-800/50 border border-gray-700 rounded-xl p-6 md:p-8 hover:border-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/20 group"
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 bg-teal-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                  <Icon className="w-7 h-7 text-teal-400" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 text-gray-100">
                  {step.title}
                </h3>
                <p className="text-gray-400 mb-4 text-sm md:text-base">
                  {step.description}
                </p>
                
                {/* Action Button */}
                <Button
                  onClick={() => {
                    if (step.onClick) {
                      step.onClick()
                    } else if (step.href) {
                      router.push(step.href)
                    }
                  }}
                  variant="ghost"
                  className="w-full justify-between text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 min-h-[44px]"
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section - Simplified */}
      <div className="container mx-auto px-6 py-12 pb-24 md:pb-20 max-w-4xl">
        <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-100">
            准备开始了吗？
          </h2>
          <p className="text-gray-400 mb-6 md:mb-8 text-base md:text-lg">
            立即体验 AI 对话的魅力
          </p>
          <Button
            onClick={() => router.push('/characters')}
            className="tavern-button text-base md:text-lg px-6 md:px-8 py-5 md:py-6 min-h-[44px]"
          >
            立即开始
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

