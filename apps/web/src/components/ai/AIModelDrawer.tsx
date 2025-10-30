/**
 * AI Model configuration drawer - right-side panel
 */

import { useState, useEffect } from 'react'
import { X, Save, TestTube, Key, Globe, Settings, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { AIModelConfig } from '@sillytavern-clone/shared'
import { useAIModelStore } from '@/stores/aiModelStore'
import toast from 'react-hot-toast'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetPortal,
  SheetOverlay,
} from '@/components/ui/sheet'
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

interface AIModelDrawerProps {
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

function AIModelDrawer({
  isOpen,
  onClose,
  onModelCreated,
  onModelUpdated,
  editingModel
}: AIModelDrawerProps) {
  const { createModel, updateModel, testModel, testModelConfig, setActiveModel, fetchModels } = useAIModelStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showTestSection, setShowTestSection] = useState(false)

  // Form state - 精简为7个主流提供商
  const [formData, setFormData] = useState<{
    name: string
    provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'deepseek' | 'zhipu' | 'custom'
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
    capabilities?: {
      streaming: boolean
      images: boolean
      tools: boolean
      vision: boolean
      audio: boolean
    }
    metadata?: {
      inputWindow: number
      outputWindow: number
      displayName?: string
      description?: string
      isReasoning?: boolean
    }
    isActive: boolean
  }>({
    name: '',
    provider: 'openai',
    model: '',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1', // 设置默认API地址
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
    capabilities: {
      streaming: true,
      images: false,
      tools: false,
      vision: false,
      audio: false,
    },
    metadata: {
      inputWindow: 4096,
      outputWindow: 4096,
      displayName: '',
      description: '',
      isReasoning: false,
    },
    isActive: true
  })

  const [testMessage, setTestMessage] = useState('Hello! Can you respond with a simple greeting?')
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [modelInputMode, setModelInputMode] = useState<'select' | 'input'>('select')

  // Common model options for each provider - 精简为7个主流提供商
  const providerModels = {
    openai: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ],
    anthropic: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
    google: [
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
    ],
    azure: [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-35-turbo',
    ],
    deepseek: [
      'deepseek-chat',
      'deepseek-reasoner',
      'deepseek-coder',
    ],
    zhipu: [
      'glm-4-plus',
      'glm-4-0520',
      'glm-4',
      'glm-4-air',
      'glm-3-turbo',
    ],
    custom: [] // 自定义OpenAI格式，通过API获取模型列表
  }

  // 默认API地址配置 - 精简为7个主流提供商
  const defaultBaseUrls = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    google: 'https://generativelanguage.googleapis.com/v1beta',
    azure: '', // Azure需要用户填写自己的资源地址
    deepseek: 'https://api.deepseek.com/v1',
    zhipu: 'https://open.bigmodel.cn/api/paas/v4',
    custom: '' // 自定义OpenAI格式，需要用户手动填写
  }

  // Reset form when modal opens/closes or editing model changes
  useEffect(() => {
    if (isOpen) {
      if (editingModel) {
        const providerKey = editingModel.provider as keyof typeof defaultBaseUrls
        setFormData({
          name: editingModel.name,
          provider: editingModel.provider as any,
          model: editingModel.model,
          apiKey: editingModel.apiKey || '', // Pre-fill API key for easier editing
          baseUrl: editingModel.baseUrl || defaultBaseUrls[providerKey] || '', // 使用默认URL如果没有设置
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
          capabilities: editingModel.capabilities || {
            streaming: true,
            images: false,
            tools: false,
            vision: false,
            audio: false,
          },
          metadata: editingModel.metadata || {
            inputWindow: 4096,
            outputWindow: 4096,
            displayName: '',
            description: '',
            isReasoning: false,
          },
          isActive: editingModel.isActive || false
        })
        
        // 智能判断使用input还是select模式
        const presetModels = (providerKey in providerModels) ? providerModels[providerKey as keyof typeof providerModels] : []
        const isInPreset = presetModels.includes(editingModel.model)
        
        console.log('[AIModelDrawer] 编辑模式 - 模型:', editingModel.model, '是否在预设列表:', isInPreset)
        
        if (isInPreset) {
          // 模型在预设列表中，使用select模式
          setModelInputMode('select')
          setAvailableModels([])
        } else {
          // 模型不在预设列表，使用input模式直接显示
          setModelInputMode('input')
        }
      } else {
        resetForm()
        setAvailableModels([])
        setModelInputMode('select')
      }
      setShowAdvanced(false)
      setShowTestSection(false)
    }
    setTestResult(null)
  }, [isOpen, editingModel])

  const resetForm = () => {
    setFormData({
      name: '',
      provider: 'openai',
      model: '',
      apiKey: '',
      baseUrl: defaultBaseUrls.openai, // 设置默认API地址
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
      capabilities: {
        streaming: true,
        images: false,
        tools: false,
        vision: false,
        audio: false,
      },
      metadata: {
        inputWindow: 4096,
        outputWindow: 4096,
        displayName: '',
        description: '',
        isReasoning: false,
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

    // When editing, API key is optional (we keep the existing one if not changed)
    // When creating new, API key is required
    if (!editingModel && !formData.apiKey.trim()) {
      toast.error('API密钥是必填项')
      return
    }

    if ((formData.provider === 'custom' || formData.provider === 'azure') && !formData.baseUrl.trim()) {
      toast.error(formData.provider === 'azure' ? 'Azure OpenAI 需要提供资源地址' : '自定义 API 需要提供基础地址')
      return
    }

    setIsLoading(true)

    try {
      const submitData = {
        ...formData,
        name: formData.name.trim() || formData.model.trim(),
        baseUrl: formData.baseUrl || defaultBaseUrls[formData.provider] || undefined
      }

      if (editingModel) {
        const updateData: any = { ...submitData }
        if (!submitData.apiKey) {
          delete updateData.apiKey
        }

        const updatedModel = await updateModel(editingModel.id, updateData)
        if (updatedModel) {
          toast.success('AI模型更新成功')
          onModelUpdated?.(updatedModel)
          
          // 关键修复：强制从服务器刷新所有模型，确保数据同步
          await fetchModels()
          
          // 如果是激活模型，确保使用服务器返回的最新数据
          if (updatedModel.isActive) {
            setActiveModel(updatedModel)
          }
          onClose()
        }
      } else {
        const newModel = await createModel(submitData)
        if (newModel) {
          toast.success('AI模型创建成功')
          onModelCreated?.(newModel)
          
          // 关键修复：强制从服务器刷新所有模型，确保数据同步
          await fetchModels()
          
          // 如果是激活模型，确保使用服务器返回的最新数据
          if (submitData.isActive) {
            setActiveModel(newModel)
          }
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

    // For new models, API key is required
    // For editing, we can use the existing API key if user hasn't provided a new one
    if (!formData.apiKey.trim() && !editingModel) {
      toast.error('请先输入API密钥')
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      if (editingModel) {
        const ok = await testModel(editingModel.id)
        if (ok) {
          setTestResult({ success: true, response: '连接成功' })
          toast.success('连接测试成功')
        } else {
          setTestResult({ success: false, error: '连接失败' })
          toast.error('连接测试失败')
        }
      } else {
        const result = await testModelConfig({
          provider: formData.provider as any,
          model: formData.model,
          apiKey: formData.apiKey,
          baseUrl: formData.baseUrl || defaultBaseUrls[formData.provider as keyof typeof defaultBaseUrls],
          settings: formData.settings,
          testMessage
        })
        setTestResult(result)
        if (result.success) toast.success('连接测试成功')
        else toast.error(result.error || '连接测试失败')
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
      const baseUrl = formData.baseUrl.replace(/\/$/, '')
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
      
      let models: string[] = []
      if (data.data && Array.isArray(data.data)) {
        models = data.data.map((m: any) => m.id || m.model || m.name).filter(Boolean)
      } else if (Array.isArray(data.models)) {
        models = data.models.map((m: any) => typeof m === 'string' ? m : (m.id || m.name)).filter(Boolean)
      } else if (Array.isArray(data)) {
        models = data.map((m: any) => typeof m === 'string' ? m : (m.id || m.name)).filter(Boolean)
      }

      console.log('[AIModelDrawer] 获取到的模型列表:', models.length, '个模型')
      console.log('[AIModelDrawer] 模型:', models.slice(0, 5), '...')

      if (models.length === 0) {
        setAvailableModels([])
        setModelInputMode('input')
        toast('未获取到模型，已切换为手动输入', { icon: '✍️' })
      } else {
        // 关键修复：确保状态更新并强制切换到select模式
        setAvailableModels(models)
        setModelInputMode('select')
        // 清空当前选择，让用户从新列表中选择
        setFormData(prev => ({ ...prev, model: '' }))
        toast.success(`成功获取 ${models.length} 个模型`)
      }
    } catch (error) {
      console.error('[AIModelDrawer] 获取模型列表失败:', error)
      toast.error(`获取模型列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsFetchingModels(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[500px] p-0 flex flex-col overflow-hidden !z-[60]">
        <SheetHeader className="px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <SheetTitle className="text-xl font-semibold text-gray-100">
            {editingModel ? '编辑模型' : '新建配置'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-4">
            <div className="space-y-4">
              
              {/* API Configurations */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">API Configurations</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="provider" className="text-xs text-gray-400">
                      提供商
                    </Label>
                    <Select
                      value={formData.provider}
                      onValueChange={(value: any) => {
                        console.log('[AIModelDrawer] 选择提供商:', value)
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
                      <SelectTrigger className="tavern-input h-9 mt-1">
                        <SelectValue placeholder="请选择提供商..." />
                      </SelectTrigger>
                      <SelectContent>
                        {/* 国外主流提供商 */}
                        <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        <SelectItem value="google">Google (Gemini)</SelectItem>
                        <SelectItem value="azure">Azure OpenAI</SelectItem>
                        
                        {/* 国内主流提供商 */}
                        <SelectItem value="deepseek">DeepSeek (深度求索)</SelectItem>
                        <SelectItem value="zhipu">智谱 AI (GLM)</SelectItem>
                        
                        {/* 自定义OpenAI格式 */}
                        <SelectItem value="custom">自定义 OpenAI 格式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="baseUrl" className="text-xs text-gray-400">
                      API 地址 {(formData.provider === 'azure' || formData.provider === 'custom') && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="baseUrl"
                      type="url"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder={defaultBaseUrls[formData.provider as keyof typeof defaultBaseUrls] || 'https://api.example.com/v1'}
                      className="tavern-input h-9 mt-1 text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.provider === 'azure' ? (
                        '请输入您的Azure资源地址（如：https://your-resource.openai.azure.com）'
                      ) : formData.provider === 'custom' ? (
                        '请输入自定义的OpenAI兼容API地址'
                      ) : (
                        `默认：${defaultBaseUrls[formData.provider as keyof typeof defaultBaseUrls] || '需要手动输入'}`
                      )}
                    </div>
                  </div>

                  {/* 获取模型列表按钮 - 所有提供商都显示 */}
                  <Button
                    type="button"
                    onClick={fetchModelsFromAPI}
                    disabled={isFetchingModels || !formData.baseUrl || !formData.apiKey}
                    className="w-full h-10 bg-transparent border-2 border-amber-600 text-amber-500 hover:bg-amber-600/10 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-200"
                    style={{
                      boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)'
                    }}
                  >
                    {isFetchingModels ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500 mr-2"></div>
                        获取模型列表...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Get Model List
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <hr className="border-gray-800 my-4" />

              {/* API Key */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">API Key</h3>
                <div>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="sk-..."
                    className="tavern-input h-9 text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    请输入您的API密钥，用于访问{formData.provider === 'openai' ? 'OpenAI' : formData.provider === 'anthropic' ? 'Anthropic' : formData.provider === 'google' ? 'Google' : formData.provider === 'azure' ? 'Azure' : formData.provider === 'deepseek' ? 'DeepSeek' : formData.provider === 'zhipu' ? '智谱AI' : '自定义'}服务
                  </div>
                </div>
              </div>

              <hr className="border-gray-800 my-4" />

              {/* Model */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Model</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label htmlFor="model" className="text-xs text-gray-400">
                        模型名称
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setModelInputMode(modelInputMode === 'select' ? 'input' : 'select')}
                        className="text-xs h-6 px-2"
                      >
                        {modelInputMode === 'select' ? '手动输入' : '选择模型'}
                      </Button>
                    </div>
                    {modelInputMode === 'select' ? (
                      <Select
                        value={formData.model}
                        onValueChange={(value) => {
                          console.log('[AIModelDrawer] 选择模型:', value)
                          setFormData(prev => ({ 
                            ...prev, 
                            model: value,
                            name: prev.name || value
                          }))
                        }}
                      >
                        <SelectTrigger className="tavern-input h-9">
                          <SelectValue placeholder="选择模型..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {availableModels.length > 0 ? (
                            // 优先显示从API获取的模型
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 bg-gray-800/50 sticky top-0">
                                从 API 获取 ({availableModels.length} 个模型)
                              </div>
                              {availableModels.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            // 回退到预设模型
                            providerModels[formData.provider as keyof typeof providerModels]?.length > 0 ? (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 bg-gray-800/50 sticky top-0">
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
                                暂无预设模型，请点击"Get Model List"或切换为手动输入
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
                            name: prev.name || value
                          }))
                        }}
                        placeholder="输入模型ID，例如 gpt-4o、claude-3-5-sonnet、deepseek-chat"
                        className="tavern-input h-9 text-sm"
                      />
                    )}
                  </div>
                  
                </div>
              </div>

              <hr className="border-gray-800 my-4" />

              {/* Display Name */}
              <div>
                <Label htmlFor="name" className="text-xs text-gray-400">
                  显示名称（可选）
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={formData.model || "自定义显示名称"}
                  className="tavern-input h-9 mt-1 text-sm"
                />
              </div>

              <hr className="border-gray-800 my-4" />

              {/* Model Parameters - Collapsible */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase hover:text-gray-300 transition-colors"
                >
                  <span>模型参数</span>
                  {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label htmlFor="temperature" className="text-xs text-gray-400">
                        Temperature: {formData.settings.temperature}
                      </Label>
                      <input
                        type="range"
                        id="temperature"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formData.settings.temperature}
                        onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxTokens" className="text-xs text-gray-400">
                        Max Tokens
                      </Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        value={formData.settings.maxTokens}
                        onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                        className="tavern-input h-9 mt-1 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="topP" className="text-xs text-gray-400">
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
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contextWindow" className="text-xs text-gray-400">
                        Context Window
                      </Label>
                      <Input
                        id="contextWindow"
                        type="number"
                        value={formData.settings.contextWindow}
                        onChange={(e) => updateSetting('contextWindow', parseInt(e.target.value))}
                        className="tavern-input h-9 mt-1 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-800 my-4" />

              {/* Capabilities Configuration */}
              <div>
                <Label className="text-xs text-gray-400 uppercase">模型能力</Label>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cap-vision"
                      checked={formData.capabilities?.vision || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        capabilities: { ...prev.capabilities!, vision: e.target.checked }
                      }))}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <Label htmlFor="cap-vision" className="text-xs text-gray-400">Vision Support (图像识别)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cap-tools"
                      checked={formData.capabilities?.tools || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        capabilities: { ...prev.capabilities!, tools: e.target.checked }
                      }))}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <Label htmlFor="cap-tools" className="text-xs text-gray-400">Tool Calling (函数调用)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cap-streaming"
                      checked={formData.capabilities?.streaming ?? true}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        capabilities: { ...prev.capabilities!, streaming: e.target.checked }
                      }))}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <Label htmlFor="cap-streaming" className="text-xs text-gray-400">Streaming (流式输出)</Label>
                  </div>
                </div>
              </div>

              <hr className="border-gray-800 my-4" />

              {/* Metadata Configuration */}
              <div>
                <Label className="text-xs text-gray-400 uppercase">模型元数据</Label>
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor="inputWindow" className="text-xs text-gray-400">
                      Input Window (输入窗口)
                    </Label>
                    <Input
                      id="inputWindow"
                      type="number"
                      value={formData.metadata?.inputWindow || 4096}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata!, inputWindow: parseInt(e.target.value) }
                      }))}
                      className="tavern-input h-9 mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outputWindow" className="text-xs text-gray-400">
                      Output Window (输出窗口)
                    </Label>
                    <Input
                      id="outputWindow"
                      type="number"
                      value={formData.metadata?.outputWindow || 4096}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata!, outputWindow: parseInt(e.target.value) }
                      }))}
                      className="tavern-input h-9 mt-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isReasoning"
                      checked={formData.metadata?.isReasoning || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata!, isReasoning: e.target.checked }
                      }))}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <Label htmlFor="isReasoning" className="text-xs text-gray-400">
                      Reasoning Model (推理模型，如 o1/o3)
                    </Label>
                  </div>
                </div>
              </div>

              <hr className="border-gray-800 my-4" />

              {/* Advanced Settings - Collapsible */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowTestSection(!showTestSection)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase hover:text-gray-300 transition-colors"
                >
                  <span>连接测试</span>
                  {showTestSection ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {showTestSection && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label htmlFor="testMessage" className="text-xs text-gray-400">
                        测试消息
                      </Label>
                      <Textarea
                        id="testMessage"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        placeholder="输入测试消息..."
                        className="tavern-input min-h-[60px] mt-1 text-sm"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || !formData.model || !formData.apiKey}
                      className="w-full tavern-button h-9"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {isTesting ? '测试中...' : '测试连接'}
                    </Button>

                    {testResult && (
                      <div className={`p-3 rounded-lg border text-sm ${
                        testResult.success
                          ? 'bg-green-900/20 border-green-800 text-green-200'
                          : 'bg-red-900/20 border-red-800 text-red-200'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {testResult.success ? (
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 text-xs">
                            <p className="font-medium mb-1">
                              {testResult.success ? '连接成功' : '连接失败'}
                            </p>
                            {testResult.response && <p>{testResult.response}</p>}
                            {testResult.error && <p>错误: {testResult.error}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <hr className="border-gray-800 my-4" />

              {/* Active Model */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600"
                />
                <Label htmlFor="isActive" className="text-xs text-gray-400">
                  设为活跃模型
                </Label>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-800 flex gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 tavern-button-secondary h-10"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-600 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] h-10"
            >
              {isLoading ? '保存中...' : '创建配置'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default AIModelDrawer

