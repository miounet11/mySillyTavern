'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Trash2, 
  Check,
  Loader2,
  Settings2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { TextInput, NumberInput, Select, Stack, Group, Card, Text } from '@mantine/core'

export default function LLMConfigPanel() {
  const [configs, setConfigs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingImage, setIsSavingImage] = useState(false)

  // 新配置表单
  const [newConfig, setNewConfig] = useState({
    name: '',
    provider: 'openai',
    model: '',
    apiKey: '',
    baseUrl: '',
    temperature: 0.8,
    maxTokens: 2000,
  })

  // 图像生成配置
  const [imageConfig, setImageConfig] = useState({
    imageApiUrl: '',
    imageApiKey: '',
    imageModel: 'dall-e-3',
    imageProvider: 'openai',
    hasImageConfig: false
  })

  useEffect(() => {
    loadConfigs()
    loadImageConfig()
  }, [])

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/admin/config/llm')
      const data = await response.json()
      setConfigs(data.configs || [])
    } catch (error) {
      console.error('Error loading configs:', error)
      toast.error('加载配置失败')
    } finally {
      setIsLoading(false)
    }
  }

  const loadImageConfig = async () => {
    try {
      const response = await fetch('/api/admin/config/image')
      const data = await response.json()
      setImageConfig({
        imageApiUrl: data.imageApiUrl || '',
        imageApiKey: data.imageApiKey === '********' ? '' : data.imageApiKey || '',
        imageModel: data.imageModel || 'dall-e-3',
        imageProvider: data.imageProvider || 'openai',
        hasImageConfig: data.hasImageConfig || false
      })
    } catch (error) {
      console.error('Error loading image config:', error)
    }
  }

  const saveImageConfig = async () => {
    if (!imageConfig.imageApiUrl) {
      toast.error('请填写图像API地址')
      return
    }

    setIsSavingImage(true)
    try {
      const response = await fetch('/api/admin/config/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageConfig)
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('图像配置保存成功')
        loadImageConfig()
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Save image config error:', error)
      toast.error('保存失败')
    } finally {
      setIsSavingImage(false)
    }
  }

  const handleSave = async () => {
    if (!newConfig.name || !newConfig.model) {
      toast.error('请填写配置名称和模型')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/config/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newConfig.name,
          provider: newConfig.provider,
          model: newConfig.model,
          apiKey: newConfig.apiKey || undefined,
          baseUrl: newConfig.baseUrl || undefined,
          settings: {
            temperature: newConfig.temperature,
            maxTokens: newConfig.maxTokens
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('配置保存成功')
        setConfigs([...configs, data.config])
        // 重置表单
        setNewConfig({
          name: '',
          provider: 'openai',
          model: '',
          apiKey: '',
          baseUrl: '',
          temperature: 0.8,
          maxTokens: 2000,
        })
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个配置吗？')) return

    try {
      const response = await fetch(`/api/admin/config/llm?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('配置已删除')
        setConfigs(configs.filter(c => c.id !== id))
      } else {
        toast.error('删除失败')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('删除失败')
    }
  }

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'google', label: 'Google (Gemini)' },
    { value: 'custom', label: '自定义' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 已有配置列表 */}
      {configs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            现有配置 ({configs.length})
          </h3>
          <div className="space-y-3">
            {configs.map((config) => (
              <Card key={config.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Text className="font-semibold text-white">
                        {config.name}
                      </Text>
                      <span className="px-2 py-1 text-xs rounded bg-teal-500/20 text-teal-400">
                        {config.provider}
                      </span>
                    </div>
                    <Text size="sm" className="text-gray-400">
                      模型: {config.model}
                    </Text>
                    {config.baseUrl && (
                      <Text size="xs" className="text-gray-500 mt-1">
                        Base URL: {config.baseUrl}
                      </Text>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDelete(config.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 添加新配置 */}
      <div className="glass-card p-6 rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-teal-400" />
          添加新配置
        </h3>

        <Stack gap="md">
          <TextInput
            label="配置名称"
            placeholder="例如：GPT-4 生产环境"
            value={newConfig.name}
            onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
            required
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              },
              label: { color: 'rgb(209, 213, 219)' }
            }}
          />

          <Group grow>
            <Select
              label="Provider"
              value={newConfig.provider}
              onChange={(value) => setNewConfig({ ...newConfig, provider: value || 'openai' })}
              data={providerOptions}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                },
                label: { color: 'rgb(209, 213, 219)' }
              }}
            />

            <TextInput
              label="Model"
              placeholder="例如：gpt-4, claude-3-opus"
              value={newConfig.model}
              onChange={(e) => setNewConfig({ ...newConfig, model: e.target.value })}
              required
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                },
                label: { color: 'rgb(209, 213, 219)' }
              }}
            />
          </Group>

          <TextInput
            label="API Key"
            placeholder="sk-..."
            type="password"
            value={newConfig.apiKey}
            onChange={(e) => setNewConfig({ ...newConfig, apiKey: e.target.value })}
            description="留空则使用环境变量中的默认值"
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              },
              label: { color: 'rgb(209, 213, 219)' },
              description: { color: 'rgb(156, 163, 175)' }
            }}
          />

          <TextInput
            label="Base URL"
            placeholder="https://api.openai.com/v1"
            value={newConfig.baseUrl}
            onChange={(e) => setNewConfig({ ...newConfig, baseUrl: e.target.value })}
            description="留空则使用默认URL"
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              },
              label: { color: 'rgb(209, 213, 219)' },
              description: { color: 'rgb(156, 163, 175)' }
            }}
          />

          <Group grow>
            <NumberInput
              label="Temperature"
              value={newConfig.temperature}
              onChange={(value) => setNewConfig({ ...newConfig, temperature: Number(value) || 0.8 })}
              min={0}
              max={2}
              step={0.1}
              decimalScale={1}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                },
                label: { color: 'rgb(209, 213, 219)' }
              }}
            />

            <NumberInput
              label="Max Tokens"
              value={newConfig.maxTokens}
              onChange={(value) => setNewConfig({ ...newConfig, maxTokens: Number(value) || 2000 })}
              min={1}
              max={8000}
              step={100}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                },
                label: { color: 'rgb(209, 213, 219)' }
              }}
            />
          </Group>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gradient-btn-teal h-11"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>保存中...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>保存配置</span>
              </div>
            )}
          </Button>
        </Stack>
      </div>

      {/* 图像生成配置 */}
      <div className="glass-card p-6 rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-purple-400" />
          图像生成配置
          {imageConfig.hasImageConfig && (
            <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
              已配置
            </span>
          )}
        </h3>

        <Stack gap="md">
          <TextInput
            label="图像API地址"
            placeholder="https://api.openai.com/v1/images/generations"
            value={imageConfig.imageApiUrl}
            onChange={(e) => setImageConfig({ ...imageConfig, imageApiUrl: e.target.value })}
            required
            description="用于AI生成角色封面图的API端点"
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              },
              label: { color: 'rgb(209, 213, 219)' },
              description: { color: 'rgb(156, 163, 175)' }
            }}
          />

          <TextInput
            label="图像API密钥"
            placeholder={imageConfig.hasImageConfig ? '已保存（输入新密钥以更新）' : 'sk-...'}
            type="password"
            value={imageConfig.imageApiKey}
            onChange={(e) => setImageConfig({ ...imageConfig, imageApiKey: e.target.value })}
            description="用于API认证"
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              },
              label: { color: 'rgb(209, 213, 219)' },
              description: { color: 'rgb(156, 163, 175)' }
            }}
          />

          <Group grow>
            <Select
              label="图像服务提供商"
              value={imageConfig.imageProvider}
              onChange={(value) => setImageConfig({ ...imageConfig, imageProvider: value || 'openai' })}
              data={[
                { value: 'openai', label: 'OpenAI (DALL-E)' },
                { value: 'stability', label: 'Stability AI' },
                { value: 'other', label: '其他' }
              ]}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                },
                label: { color: 'rgb(209, 213, 219)' }
              }}
            />

            <TextInput
              label="图像模型"
              placeholder="dall-e-3"
              value={imageConfig.imageModel}
              onChange={(e) => setImageConfig({ ...imageConfig, imageModel: e.target.value })}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                },
                label: { color: 'rgb(209, 213, 219)' }
              }}
            />
          </Group>

          <Button
            onClick={saveImageConfig}
            disabled={isSavingImage}
            className="w-full gradient-btn-purple h-11"
          >
            {isSavingImage ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>保存中...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>保存图像配置</span>
              </div>
            )}
          </Button>
        </Stack>
      </div>

      {/* 使用说明 */}
      <div className="glass-card p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 使用说明</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• LLM配置将用于角色卡生成功能</li>
          <li>• 图像配置用于AI生成角色封面图</li>
          <li>• API Key 会加密存储</li>
          <li>• Temperature 越高，生成的内容越有创造性</li>
          <li>• 建议 Temperature 设置为 0.7-0.9</li>
        </ul>
      </div>
    </div>
  )
}

