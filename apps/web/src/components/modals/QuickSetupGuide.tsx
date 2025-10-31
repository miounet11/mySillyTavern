/**
 * Quick Setup Guide - 首次使用引导组件
 * 帮助新用户快速配置第一个 AI 模型
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconRocket, IconCheck, IconAlertCircle, IconExternalLink } from '@tabler/icons-react'
import { useAIModelStore } from '@/stores/aiModelStore'
import { useSettingsUIStore } from '@/stores/settingsUIStore'
import toast from 'react-hot-toast'

interface QuickSetupGuideProps {
  open: boolean
  onClose: () => void
}

export default function QuickSetupGuide({ open, onClose }: QuickSetupGuideProps) {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'google'>('openai')
  const [apiKey, setApiKey] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { createModel } = useAIModelStore()
  const { openSettings } = useSettingsUIStore()

  const providerConfigs = {
    openai: {
      name: 'OpenAI',
      icon: '🤖',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o-mini',
      modelName: 'GPT-4o Mini',
      guideUrl: 'https://platform.openai.com/api-keys',
      description: '推荐新手使用，性能好且价格实惠'
    },
    anthropic: {
      name: 'Anthropic',
      icon: '🔮',
      baseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-3-5-sonnet-20241022',
      modelName: 'Claude 3.5 Sonnet',
      guideUrl: 'https://console.anthropic.com/settings/keys',
      description: '适合创意写作和角色扮演'
    },
    google: {
      name: 'Google Gemini',
      icon: '✨',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-2.0-flash-exp',
      modelName: 'Gemini 2.0 Flash',
      guideUrl: 'https://aistudio.google.com/app/apikey',
      description: '完全免费，适合入门体验'
    }
  }

  const currentConfig = providerConfigs[provider]

  const handleQuickSetup = async () => {
    if (!apiKey.trim()) {
      toast.error('请输入 API Key')
      return
    }

    setIsCreating(true)
    try {
      const result = await createModel({
        name: `${currentConfig.modelName} (快速配置)`,
        provider: provider,
        model: currentConfig.defaultModel,
        apiKey: apiKey.trim(),
        baseUrl: currentConfig.baseUrl,
        isActive: true, // 自动设为活跃
        settings: {
          temperature: 0.9,
          maxTokens: 4096,
        }
      })

      if (result) {
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-medium">✅ 配置完成！</div>
            <div className="text-sm text-gray-300">现在可以开始聊天了</div>
          </div>,
          { duration: 3000 }
        )
        onClose()
      } else {
        throw new Error('创建模型失败')
      }
    } catch (error) {
      console.error('Quick setup error:', error)
      toast.error('配置失败，请检查 API Key 是否正确')
    } finally {
      setIsCreating(false)
    }
  }

  const handleAdvancedSetup = () => {
    onClose()
    openSettings('models')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <IconRocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-gray-100">
                欢迎使用 SillyTavern
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-1">
                让我们快速配置您的第一个 AI 模型
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: 选择供应商 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              第 1 步：选择 AI 供应商
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(providerConfigs) as Array<keyof typeof providerConfigs>).map((key) => {
                const config = providerConfigs[key]
                return (
                  <button
                    key={key}
                    onClick={() => setProvider(key)}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${provider === key
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="text-3xl mb-2">{config.icon}</div>
                    <div className="text-sm font-medium text-gray-200">
                      {config.name}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-start gap-2">
                <IconCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  {currentConfig.description}
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: 输入 API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey" className="text-sm font-medium text-gray-300">
                第 2 步：输入 API Key
              </Label>
              <a
                href={currentConfig.guideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                获取 API Key
                <IconExternalLink className="w-3 h-3" />
              </a>
            </div>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`输入您的 ${currentConfig.name} API Key...`}
              className="tavern-input"
            />
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-2">
                <IconAlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-200">
                  API Key 安全存储在您的本地浏览器中，不会上传到服务器
                </p>
              </div>
            </div>
          </div>

          {/* 配置预览 */}
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 space-y-2">
            <div className="text-sm font-medium text-gray-300 mb-3">配置预览</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-500">供应商</div>
                <div className="text-gray-200 font-medium">{currentConfig.name}</div>
              </div>
              <div>
                <div className="text-gray-500">模型</div>
                <div className="text-gray-200 font-medium">{currentConfig.modelName}</div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={handleQuickSetup}
              disabled={!apiKey.trim() || isCreating}
              className="flex-1 tavern-button"
            >
              {isCreating ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  配置中...
                </>
              ) : (
                <>
                  <IconRocket className="w-4 h-4 mr-2" />
                  开始使用
                </>
              )}
            </Button>
            <Button
              onClick={handleAdvancedSetup}
              variant="outline"
              className="tavern-button-secondary"
            >
              高级配置
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            稍后可在设置中修改或添加更多模型
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

