'use client'

import { useRouter } from 'next/navigation'
import { MessageSquare, Users, Globe, Sparkles, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: MessageSquare,
      title: '智能对话',
      description: '与 AI 角色进行自然流畅的对话，体验真实的交互感'
    },
    {
      icon: Users,
      title: '角色管理',
      description: '创建和管理自定义 AI 角色，塑造独特的个性'
    },
    {
      icon: Globe,
      title: '社区分享',
      description: '浏览和下载社区创作的精彩角色卡'
    },
    {
      icon: Sparkles,
      title: '高度自定义',
      description: '完全控制 AI 的行为、温度和响应风格'
    },
    {
      icon: Zap,
      title: '快速响应',
      description: '优化的性能确保流畅的聊天体验'
    },
    {
      icon: Shield,
      title: '数据安全',
      description: '您的数据本地存储，隐私得到完全保护'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent"></div>
        <div className="container mx-auto px-6 py-20 max-w-6xl relative">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-100">
              欢迎来到 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">SillyTavern</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              强大的 AI 角色扮演聊天平台，让您的创意无限延伸
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => router.push('/characters')}
                className="tavern-button text-lg px-8 py-6"
              >
                <Users className="w-5 h-5 mr-2" />
                浏览角色卡
              </Button>
              <Button
                onClick={() => router.push('/characters/community')}
                variant="outline"
                className="tavern-button-secondary text-lg px-8 py-6"
              >
                <Globe className="w-5 h-5 mr-2" />
                探索社区
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">
          功能特色
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/20"
              >
                <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-100">
            准备开始了吗？
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            立即创建您的第一个 AI 角色，开启精彩的对话之旅
          </p>
          <Button
            onClick={() => router.push('/characters')}
            className="tavern-button text-lg px-8 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            开始创建
          </Button>
        </div>
      </div>
    </div>
  )
}