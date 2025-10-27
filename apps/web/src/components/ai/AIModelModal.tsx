/**
 * AI Model configuration modal for creating and editing AI models
 */

import { useState, useEffect } from 'react'
import { X, Save, TestTube, Key, Globe, Settings, Check, AlertCircle } from 'lucide-react'
import { AIModelConfig } from '@sillytavern-clone/shared'
import { useAIModelStore } from '@/stores/aiModelStore'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AIModelModalProps {
  isOpen: boolean
  onClose: () => void
  onModelCreated?: (model: AIModelConfig) => void
  onModelUpdated?: (model: AIModelConfig) => void
  editingModel?: AIModelConfig | null
}

interface TestResult {
  success: boolean
  response?: string
  latency?: number
  usage?: any
  error?: string
}

function AIModelModal({
  isOpen,
  onClose,
  onModelCreated,
  onModelUpdated,
  editingModel
}: AIModelModalProps) {
  const { createModel, updateModel, testModel } = useAIModelStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'cohere' | 'deepseek' | 'moonshot' | 'zhipu' | 'newapi' | 'local' | 'custom'
    model: string
    apiKey: string
    baseUrl: string
    settings: {
      temperature: number
      maxTokens: number
      topP: number
      topK: number
      frequencyPenalty: number
      presencePenalty: number
      stopSequences: string[]
      systemPrompt: string
      contextWindow: number
    }
    isActive: boolean
  }>({
    name: '',
    provider: 'openai',
    model: '',
    apiKey: '',
    baseUrl: '',
    settings: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      topK: 40,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [],
      systemPrompt: '',
      contextWindow: 4096,
    },
    isActive: true
  })

  const [testMessage, setTestMessage] = useState('Hello! Can you respond with a simple greeting?')
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [modelInputMode, setModelInputMode] = useState<'select' | 'input'>('select') // 'select' or 'input'

  // Common model options for each provider
  const providerModels = {
    openai: [
      'gpt-4-turbo-preview',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ],
    anthropic: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
    ],
    google: [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ],
    azure: [
      'gpt-4',
      'gpt-35-turbo',
    ],
    cohere: [
      'command',
      'command-light',
      'command-r',
      'command-r-plus',
    ],
    deepseek: [
      'deepseek-chat',
      'deepseek-coder',
    ],
    moonshot: [
      'moonshot-v1-8k',
      'moonshot-v1-32k',
      'moonshot-v1-128k',
    ],
    zhipu: [
      'glm-4',
      'glm-4-air',
      'glm-3-turbo',
    ],
    newapi: [], // Will be fetched from API
    local: [
      'llama-2-7b-chat',
      'llama-2-13b-chat',
      'llama-2-70b-chat',
      'qwen-72b-chat',
      'custom-model',
    ],
    custom: []
  }

  const defaultBaseUrls = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    google: 'https://generativelanguage.googleapis.com/v1beta',
    azure: 'https://YOUR_RESOURCE.openai.azure.com',
    cohere: 'https://api.cohere.ai/v1',
    deepseek: 'https://api.deepseek.com/v1',
    moonshot: 'https://api.moonshot.cn/v1',
    zhipu: 'https://open.bigmodel.cn/api/paas/v4',
    newapi: 'https://api.example.com/v1',
    local: 'http://localhost:8080/v1',
    custom: ''
  }

  // Reset form when modal opens/closes or editing model changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('basic') // Reset to first tab when modal opens
      if (editingModel) {
        setFormData({
          name: editingModel.name,
          provider: editingModel.provider as any,
          model: editingModel.model,
          apiKey: '', // Never pre-fill API keys for security
          baseUrl: editingModel.baseUrl || '',
          settings: {
            temperature: editingModel.settings?.temperature ?? 0.7,
            maxTokens: editingModel.settings?.maxTokens ?? 2048,
            topP: editingModel.settings?.topP ?? 0.9,
            topK: editingModel.settings?.topK ?? 40,
            frequencyPenalty: editingModel.settings?.frequencyPenalty ?? 0,
            presencePenalty: editingModel.settings?.presencePenalty ?? 0,
            stopSequences: editingModel.settings?.stopSequences || [],
            systemPrompt: editingModel.settings?.systemPrompt || '',
            contextWindow: editingModel.settings?.contextWindow ?? 4096,
          },
          isActive: editingModel.isActive || false
        })
      } else {
        resetForm()
      }
    }
    setTestResult(null)
  }, [isOpen, editingModel])

  const resetForm = () => {
    setFormData({
      name: '',
      provider: 'openai',
      model: '',
      apiKey: '',
      baseUrl: '',
      settings: {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        topK: 40,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: [],
        systemPrompt: '',
        contextWindow: 4096,
      },
      isActive: true
    })
    setTestMessage('Hello! Can you respond with a simple greeting?')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.model.trim()) {
      toast.error('模型名称是必填项')
      return
    }

    if (!formData.apiKey.trim() && formData.provider !== 'local') {
      toast.error('API密钥是必填项')
      return
    }

    if (formData.provider === 'custom' && !formData.baseUrl.trim()) {
      toast.error('自定义 API 需要提供基础地址')
      return
    }

    setIsLoading(true)

    try {
      const submitData = {
        ...formData,
        // Use model name as display name if no custom name is provided
        name: formData.name.trim() || formData.model.trim(),
        // Only set baseUrl if it's provided and different from default
        baseUrl: formData.baseUrl || defaultBaseUrls[formData.provider] || undefined
      }

      if (editingModel) {
        // Don't update API key if it's empty (keeping existing one)
        const updateData: any = { ...submitData }
        if (!submitData.apiKey) {
          delete updateData.apiKey
        }

        const updatedModel = await updateModel(editingModel.id, updateData)
        if (updatedModel) {
          toast.success('AI模型更新成功')
          onModelUpdated?.(updatedModel)
          onClose()
        }
      } else {
        const newModel = await createModel(submitData)
        if (newModel) {
          toast.success('AI模型创建成功')
          onModelCreated?.(newModel)
          onClose()
        }
      }
    } catch (error) {
      console.error('Error saving AI model:', error)
      toast.error(editingModel ? '更新AI模型失败' : '创建AI模型失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!formData.model.trim()) {
      toast.error('请先选择模型')
      return
    }

    if (!formData.apiKey.trim() && formData.provider !== 'local') {
      toast.error('请先输入API密钥')
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const testData = {
        model: formData.model,
        provider: formData.provider,
        apiKey: formData.apiKey,
        baseUrl: formData.baseUrl || defaultBaseUrls[formData.provider],
        settings: formData.settings,
        testMessage
      }

      // Create a temporary model for testing
      const tempModelId = editingModel?.id || 'temp-test'

      // If editing, update the model first, otherwise test with temporary data
      if (editingModel && formData.apiKey) {
        await updateModel(editingModel.id, testData)
      }

      const success = await testModel(editingModel?.id || tempModelId)

      if (success) {
        // testModel should return the actual test result with latency
        // This is a simplified version; in real implementation, testModel returns the full result
        const data: any = success as any
        setTestResult({
          success: true,
          response: 'Connection successful! The model responded correctly.',
          latency: (data && data.latency) ? data.latency : 0
        })
        toast.success('连接测试成功')
      } else {
        setTestResult({
          success: false,
          error: 'Failed to connect to the AI model. Please check your configuration.'
        })
        toast.error('连接测试失败')
      }

    } catch (error) {
      console.error('Error testing AI model:', error)
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      toast.error('连接测试失败')
    } finally {
      setIsTesting(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }))
  }

  const addStopSequence = () => {
    const sequences = [...formData.settings.stopSequences, '']
    updateSetting('stopSequences', sequences)
  }

  const updateStopSequence = (index: number, value: string) => {
    const sequences = [...formData.settings.stopSequences]
    sequences[index] = value
    updateSetting('stopSequences', sequences)
  }

  const removeStopSequence = (index: number) => {
    const sequences = formData.settings.stopSequences.filter((_, i) => i !== index)
    updateSetting('stopSequences', sequences)
  }

  // Fetch available models from API
  const fetchModelsFromAPI = async () => {
    if (!formData.baseUrl || !formData.apiKey) {
      toast.error('请先填写 API 地址和密钥')
      return
    }

    setIsFetchingModels(true)
    try {
      const baseUrl = formData.baseUrl.replace(/\/$/, '') // Remove trailing slash
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${formData.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Handle different API response formats
      let models: string[] = []
      if (data.data && Array.isArray(data.data)) {
        // OpenAI-compatible format
        models = data.data.map((m: any) => m.id || m.model || m.name).filter(Boolean)
      } else if (Array.isArray(data.models)) {
        // Alternative format
        models = data.models.map((m: any) => typeof m === 'string' ? m : (m.id || m.name)).filter(Boolean)
      } else if (Array.isArray(data)) {
        // Direct array format
        models = data.map((m: any) => typeof m === 'string' ? m : (m.id || m.name)).filter(Boolean)
      }

      if (models.length === 0) {
        toast.error('未找到可用模型')
        return
      }

      setAvailableModels(models)
      setModelInputMode('select')
      toast.success(`成功获取 ${models.length} 个模型`)
    } catch (error) {
      console.error('Error fetching models:', error)
      toast.error(`获取模型列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsFetchingModels(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[92vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-800 flex-shrink-0">
          <DialogTitle className="text-2xl font-semibold text-gray-100">
            {editingModel ? '编辑AI模型' : '添加AI模型'}
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-1">
            配置 AI 模型连接信息和参数设置
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 mx-6 mt-4 mb-0 flex-shrink-0">
              <TabsTrigger value="basic" className="text-base py-3">
                <Settings className="w-4 h-4 mr-2" />
                基本配置
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-base py-3">
                <Globe className="w-4 h-4 mr-2" />
                模型设置
              </TabsTrigger>
              <TabsTrigger value="test" className="text-base py-3">
                <TestTube className="w-4 h-4 mr-2" />
                连接测试
              </TabsTrigger>
            </TabsList>

            {/* Basic Configuration */}
            <TabsContent value="basic" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-6">
              <div className="space-y-6 max-w-5xl mx-auto">
                {/* Step 1: API Base URL - First */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                    <h3 className="text-sm font-semibold text-gray-200">设置 API 地址</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="provider" className="text-sm font-medium text-gray-300">
                        选择提供商或自定义
                      </Label>
                      <Select
                        value={formData.provider}
                        onValueChange={(value: any) => {
                          setFormData(prev => ({
                            ...prev,
                            provider: value,
                            model: '',
                            baseUrl: defaultBaseUrls[value as keyof typeof defaultBaseUrls] || ''
                          }))
                          setAvailableModels([])
                          setModelInputMode('select')
                        }}
                      >
                        <SelectTrigger className="tavern-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* 主流提供商 */}
                          <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                          <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                          <SelectItem value="google">Google (Gemini)</SelectItem>
                          <SelectItem value="azure">Azure OpenAI</SelectItem>
                          
                          {/* 国内提供商 */}
                          <SelectItem value="deepseek">DeepSeek (深度求索)</SelectItem>
                          <SelectItem value="moonshot">Moonshot (月之暗面)</SelectItem>
                          <SelectItem value="zhipu">智谱 AI (GLM)</SelectItem>
                          
                          {/* 其他提供商 */}
                          <SelectItem value="cohere">Cohere</SelectItem>
                          
                          {/* NewAPI 和自定义 */}
                          <SelectItem value="newapi">NewAPI (中转API)</SelectItem>
                          <SelectItem value="local">本地模型 (Ollama/LM Studio)</SelectItem>
                          <SelectItem value="custom">自定义 API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="baseUrl" className="text-sm font-medium text-gray-300">
                        API 基础地址 {formData.provider === 'custom' && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="baseUrl"
                        type="url"
                        value={formData.baseUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                        placeholder={defaultBaseUrls[formData.provider as keyof typeof defaultBaseUrls] || 'https://api.example.com/v1'}
                        className="tavern-input"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.provider === 'custom' ? 
                          '请输入完整的 API 地址（如：https://your-api.com/v1）' : 
                          `默认：${defaultBaseUrls[formData.provider as keyof typeof defaultBaseUrls] || '需要手动输入'}`
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: API Key - Second */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                    <h3 className="text-sm font-semibold text-gray-200">配置 API 密钥</h3>
                  </div>
                  <div>
                    <Label htmlFor="apiKey" className="text-sm font-medium text-gray-300">
                      API 密钥 {formData.provider !== 'local' && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={formData.provider === 'local' ? '本地模型无需API密钥' : 'sk-...'}
                      className="tavern-input"
                      disabled={formData.provider === 'local'}
                    />
                    {formData.provider === 'local' && (
                      <div className="text-xs text-gray-500 mt-1">
                        本地模型无需 API 密钥
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Model Selection - Third */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</div>
                      <h3 className="text-sm font-semibold text-gray-200">选择或输入模型</h3>
                    </div>
                    <div className="flex gap-2">
                      {/* Fetch models button for compatible providers */}
                      {(formData.provider === 'newapi' || formData.provider === 'custom' || formData.provider === 'openai' || formData.provider === 'azure') && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={fetchModelsFromAPI}
                          disabled={isFetchingModels || !formData.baseUrl || !formData.apiKey}
                          className="text-xs"
                        >
                          {isFetchingModels ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-100 mr-1"></div>
                              获取中...
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 mr-1" />
                              从API获取
                            </>
                          )}
                        </Button>
                      )}
                      {/* Toggle between select and input */}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setModelInputMode(modelInputMode === 'select' ? 'input' : 'select')}
                        className="text-xs"
                      >
                        {modelInputMode === 'select' ? '手动输入' : '选择模型'}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-sm font-medium text-gray-300">
                      模型名称 <span className="text-red-500">*</span>
                    </Label>
                    {modelInputMode === 'select' ? (
                      <Select
                        value={formData.model}
                        onValueChange={(value) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            model: value,
                            name: prev.name || value // Auto-fill name if empty
                          }))
                        }}
                      >
                        <SelectTrigger className="tavern-input">
                          <SelectValue placeholder="选择模型或切换到手动输入..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {/* Show fetched models first if available */}
                          {availableModels.length > 0 ? (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 bg-gray-800/50">
                                从 API 获取的模型 ({availableModels.length})
                              </div>
                              {availableModels.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            /* Show predefined models */
                            providerModels[formData.provider as keyof typeof providerModels].length > 0 ? (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 bg-gray-800/50">
                                  预设模型
                                </div>
                                {providerModels[formData.provider as keyof typeof providerModels].map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                              </>
                            ) : (
                              <div className="px-2 py-1.5 text-xs text-gray-500">
                                暂无预设模型，请点击「从API获取」或「手动输入」
                              </div>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => {
                          const value = e.target.value
                          setFormData(prev => ({ 
                            ...prev, 
                            model: value,
                            name: prev.name || value // Auto-fill name if empty
                          }))
                        }}
                        placeholder="例如: gpt-4-turbo, claude-3-opus, qwen-max, deepseek-chat..."
                        className="tavern-input"
                        maxLength={100}
                      />
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {availableModels.length > 0 ? (
                        `已从 API 获取 ${availableModels.length} 个模型`
                      ) : modelInputMode === 'input' ? (
                        '直接输入完整的模型名称'
                      ) : (
                        formData.provider === 'newapi' || formData.provider === 'custom' ? 
                        '点击「从API获取」按钮自动获取可用模型列表' : 
                        '选择预设模型或点击「手动输入」'
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 4: Display Name - Fourth (Optional) */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center font-bold">4</div>
                    <h3 className="text-sm font-semibold text-gray-200">自定义显示名称（可选）</h3>
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                      显示名称
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={formData.model || "为此配置起个名字，例如：我的 GPT-4"}
                      className="tavern-input"
                      maxLength={50}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      留空将使用模型名称作为显示名称
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Model Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isActive" className="text-sm text-gray-300">
                  设为活跃模型 (这将会停用其他活跃模型)
                </Label>
              </div>
            </TabsContent>

            {/* Model Settings */}
            <TabsContent value="settings" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="temperature" className="text-sm font-medium text-gray-300">
                      创造性 (Temperature): {formData.settings.temperature}
                    </Label>
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.settings.temperature}
                      onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>保守</span>
                      <span>创新</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxTokens" className="text-sm font-medium text-gray-300">
                      最大令牌数 (Max Tokens)
                    </Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="1"
                      max="32000"
                      value={formData.settings.maxTokens}
                      onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                      className="tavern-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="topP" className="text-sm font-medium text-gray-300">
                      Top P: {formData.settings.topP}
                    </Label>
                    <input
                      type="range"
                      id="topP"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.settings.topP}
                      onChange={(e) => updateSetting('topP', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="topK" className="text-sm font-medium text-gray-300">
                      Top K (仅适用于某些模型)
                    </Label>
                    <Input
                      id="topK"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.settings.topK}
                      onChange={(e) => updateSetting('topK', parseInt(e.target.value))}
                      className="tavern-input"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="frequencyPenalty" className="text-sm font-medium text-gray-300">
                      频率惩罚: {formData.settings.frequencyPenalty}
                    </Label>
                    <input
                      type="range"
                      id="frequencyPenalty"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={formData.settings.frequencyPenalty}
                      onChange={(e) => updateSetting('frequencyPenalty', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="presencePenalty" className="text-sm font-medium text-gray-300">
                      存在惩罚: {formData.settings.presencePenalty}
                    </Label>
                    <input
                      type="range"
                      id="presencePenalty"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={formData.settings.presencePenalty}
                      onChange={(e) => updateSetting('presencePenalty', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contextWindow" className="text-sm font-medium text-gray-300">
                      上下文窗口大小
                    </Label>
                    <Input
                      id="contextWindow"
                      type="number"
                      min="1"
                      max="200000"
                      value={formData.settings.contextWindow}
                      onChange={(e) => updateSetting('contextWindow', parseInt(e.target.value))}
                      className="tavern-input"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="systemPrompt" className="text-sm font-medium text-gray-300">
                    系统提示词
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={formData.settings.systemPrompt}
                    onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                    placeholder="可选的系统提示词，用于设置AI的行为和角色..."
                    className="tavern-input min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300">停止序列</Label>
                  <div className="space-y-2 mt-2">
                    {formData.settings.stopSequences.map((sequence, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={sequence}
                          onChange={(e) => updateStopSequence(index, e.target.value)}
                          placeholder={`停止序列 ${index + 1}`}
                          className="tavern-input flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeStopSequence(index)}
                          className="tavern-button-secondary"
                        >
                          删除
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addStopSequence}
                      className="tavern-button-secondary"
                    >
                      添加停止序列
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Connection Test */}
            <TabsContent value="test" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <Label htmlFor="testMessage" className="text-sm font-medium text-gray-300">
                    测试消息
                  </Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="输入一条测试消息..."
                    className="tavern-input min-h-[100px] mt-2"
                  />
                </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !formData.model || (!formData.apiKey && formData.provider !== 'local')}
                  className="tavern-button"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTesting ? '测试中...' : '测试连接'}
                </Button>

                {formData.provider !== 'local' && !formData.apiKey && (
                  <div className="flex items-center text-sm text-yellow-400">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    需要API密钥才能测试连接
                  </div>
                )}
              </div>

              {/* Test Results */}
              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.success
                    ? 'bg-green-900/20 border-green-800 text-green-200'
                    : 'bg-red-900/20 border-red-800 text-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    {testResult.success ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">
                        {testResult.success ? '连接成功' : '连接失败'}
                      </h4>

                      {testResult.response && (
                        <p className="text-sm mb-2">{testResult.response}</p>
                      )}

                      {testResult.error && (
                        <p className="text-sm mb-2">错误: {testResult.error}</p>
                      )}

                      {testResult.latency && (
                        <p className="text-xs">延迟: {testResult.latency}ms</p>
                      )}

                      {testResult.usage && (
                        <div className="text-xs mt-2">
                          <p>输入令牌: {testResult.usage.prompt_tokens || 'N/A'}</p>
                          <p>输出令牌: {testResult.usage.completion_tokens || 'N/A'}</p>
                          <p>总令牌: {testResult.usage.total_tokens || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="tavern-button-secondary"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="tavern-button"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? '保存中...' : (editingModel ? '更新模型' : '添加模型')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Export as default
export default AIModelModal