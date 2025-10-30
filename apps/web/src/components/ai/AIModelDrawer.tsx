/**
 * AI Model configuration drawer - right-side panel
 */

import { useState, useEffect } from 'react'
import { 
  IconX, 
  IconDeviceFloppy, 
  IconFlask, 
  IconKey, 
  IconWorld, 
  IconSettings, 
  IconCheck, 
  IconAlertCircle, 
  IconChevronDown, 
  IconChevronRight 
} from '@tabler/icons-react'
import { AIModelConfig } from '@sillytavern-clone/shared'
import { useAIModelStore } from '@/stores/aiModelStore'
import toast from 'react-hot-toast'
import {
  Drawer,
  Button,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  PasswordInput,
  Checkbox,
  Slider,
  Stack,
  Group,
  Box,
  Text,
  Collapse,
  ScrollArea,
  Loader
} from '@mantine/core'

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
    <Drawer
      opened={isOpen}
      onClose={onClose}
      position="right"
      size="500px"
      title={
        <Text fw={600} size="xl">
          {editingModel ? '编辑模型' : '新建配置'}
        </Text>
      }
      styles={{
        content: {
          display: 'flex',
          flexDirection: 'column'
        },
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }
      }}
      zIndex={60}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Scrollable Content */}
        <ScrollArea style={{ flex: 1 }} px="md" py="md">
            <div className="space-y-4">
              
              {/* API Configurations */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">API Configurations</h3>
                
                <Stack gap="sm">
                  <Select
                    label="提供商"
                    placeholder="请选择提供商..."
                    value={formData.provider}
                    onChange={(value: any) => {
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
                    data={[
                      { value: 'openai', label: 'OpenAI (ChatGPT)' },
                      { value: 'anthropic', label: 'Anthropic (Claude)' },
                      { value: 'google', label: 'Google (Gemini)' },
                      { value: 'azure', label: 'Azure OpenAI' },
                      { value: 'deepseek', label: 'DeepSeek (深度求索)' },
                      { value: 'zhipu', label: '智谱 AI (GLM)' },
                      { value: 'custom', label: '自定义 OpenAI 格式' }
                    ]}
                    styles={{ label: { fontSize: '0.75rem', color: 'var(--mantine-color-gray-5)' } }}
                  />
                  
                  <TextInput
                    label={
                      <>
                        API 地址{' '}
                        {(formData.provider === 'azure' || formData.provider === 'custom') && (
                          <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span>
                        )}
                      </>
                    }
                    value={formData.baseUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder={defaultBaseUrls[formData.provider as keyof typeof defaultBaseUrls] || 'https://api.example.com/v1'}
                    description={
                      formData.provider === 'azure' 
                        ? '请输入您的Azure资源地址（如：https://your-resource.openai.azure.com）'
                        : formData.provider === 'custom' 
                        ? '请输入自定义的OpenAI兼容API地址'
                        : `默认：${defaultBaseUrls[formData.provider as keyof typeof defaultBaseUrls] || '需要手动输入'}`
                    }
                    styles={{ 
                      label: { fontSize: '0.75rem', color: 'var(--mantine-color-gray-5)' },
                      description: { fontSize: '0.75rem' }
                    }}
                  />

                  {/* 获取模型列表按钮 - 所有提供商都显示 */}
                  <Button
                    type="button"
                    onClick={fetchModelsFromAPI}
                    disabled={isFetchingModels || !formData.baseUrl || !formData.apiKey}
                    fullWidth
                    variant="outline"
                    color="orange"
                    leftSection={
                      isFetchingModels ? (
                        <Loader size="xs" />
                      ) : (
                        <IconWorld size={16} />
                      )
                    }
                    styles={{
                      root: {
                        borderWidth: 2,
                        boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)',
                        '&:hover': {
                          boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
                        }
                      }
                    }}
                  >
                    {isFetchingModels ? '获取模型列表...' : 'Get Model List'}
                  </Button>
                </Stack>
              </div>

              <hr className="border-gray-800 my-4" />

              {/* API Key */}
              <Box>
                <Text size="xs" fw={600} c="gray.5" tt="uppercase" mb="sm">
                  API Key
                </Text>
                <PasswordInput
                  placeholder="sk-..."
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  description={`请输入您的API密钥，用于访问${formData.provider === 'openai' ? 'OpenAI' : formData.provider === 'anthropic' ? 'Anthropic' : formData.provider === 'google' ? 'Google' : formData.provider === 'azure' ? 'Azure' : formData.provider === 'deepseek' ? 'DeepSeek' : formData.provider === 'zhipu' ? '智谱AI' : '自定义'}服务`}
                  styles={{ description: { fontSize: '0.75rem' } }}
                />
              </Box>

              <hr className="border-gray-800 my-4" />

              {/* Model */}
              <Box>
                <Text size="xs" fw={600} c="gray.5" tt="uppercase" mb="sm">
                  Model
                </Text>
                
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="xs" c="gray.5">
                      模型名称
                    </Text>
                    <Button
                      type="button"
                      size="xs"
                      variant="subtle"
                      onClick={() => setModelInputMode(modelInputMode === 'select' ? 'input' : 'select')}
                    >
                      {modelInputMode === 'select' ? '手动输入' : '选择模型'}
                    </Button>
                  </Group>
                  {modelInputMode === 'select' ? (
                    <Select
                      placeholder="选择模型..."
                      value={formData.model}
                      onChange={(value) => {
                        console.log('[AIModelDrawer] 选择模型:', value)
                        if (value) {
                          setFormData(prev => ({ 
                            ...prev, 
                            model: value,
                            name: prev.name || value
                          }))
                        }
                      }}
                      data={
                        availableModels.length > 0 
                          ? [
                              { group: `从 API 获取 (${availableModels.length} 个模型)`, items: availableModels.map(m => ({ value: m, label: m })) }
                            ]
                          : providerModels[formData.provider as keyof typeof providerModels]?.length > 0
                          ? [
                              { group: '预设模型', items: providerModels[formData.provider as keyof typeof providerModels].map(m => ({ value: m, label: m })) }
                            ]
                          : []
                      }
                      nothingFoundMessage="暂无预设模型，请点击「Get Model List」或切换为手动输入"
                      maxDropdownHeight={300}
                    />
                  ) : (
                    <TextInput
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
                    />
                  )}
                </Stack>
              </Box>

              <hr className="border-gray-800 my-4" />

              {/* Display Name */}
              <TextInput
                label="显示名称（可选）"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={formData.model || "自定义显示名称"}
                styles={{ label: { fontSize: '0.75rem', color: 'var(--mantine-color-gray-5)' } }}
              />

              <hr className="border-gray-800 my-4" />

              {/* Model Parameters - Collapsible */}
              <Box>
                <Group
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  justify="space-between"
                  mb="sm"
                >
                  <Text size="xs" fw={600} c="gray.5" tt="uppercase">
                    模型参数
                  </Text>
                  {showAdvanced ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                </Group>

                <Collapse in={showAdvanced}>
                  <Stack gap="sm" mt="sm">
                    <Box>
                      <Text size="xs" c="gray.5" mb={8}>
                        Temperature: {formData.settings.temperature}
                      </Text>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={formData.settings.temperature}
                        onChange={(value) => updateSetting('temperature', value)}
                        marks={[
                          { value: 0, label: '0' },
                          { value: 1, label: '1' },
                          { value: 2, label: '2' }
                        ]}
                      />
                    </Box>

                    <NumberInput
                      label="Max Tokens"
                      value={formData.settings.maxTokens}
                      onChange={(value) => updateSetting('maxTokens', value)}
                      min={1}
                      styles={{ label: { fontSize: '0.75rem', color: 'var(--mantine-color-gray-5)' } }}
                    />

                    <Box>
                      <Text size="xs" c="gray.5" mb={8}>
                        Top P: {formData.settings.topP}
                      </Text>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={formData.settings.topP}
                        onChange={(value) => updateSetting('topP', value)}
                        marks={[
                          { value: 0, label: '0' },
                          { value: 0.5, label: '0.5' },
                          { value: 1, label: '1' }
                        ]}
                      />
                    </Box>

                    <NumberInput
                      label="Context Window"
                      value={formData.settings.contextWindow}
                      onChange={(value) => updateSetting('contextWindow', value)}
                      min={1}
                      styles={{ label: { fontSize: '0.75rem', color: 'var(--mantine-color-gray-5)' } }}
                    />
                  </Stack>
                </Collapse>
              </Box>

              <hr className="border-gray-800 my-4" />

              {/* Capabilities Configuration */}
              <Box>
                <Text size="xs" fw={600} c="gray.5" tt="uppercase" mb="sm">
                  模型能力
                </Text>
                <Stack gap="xs">
                  <Checkbox
                    label="Vision Support (图像识别)"
                    checked={formData.capabilities?.vision || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      capabilities: { ...prev.capabilities!, vision: e.currentTarget.checked }
                    }))}
                    styles={{ label: { fontSize: '0.75rem' } }}
                  />
                  <Checkbox
                    label="Tool Calling (函数调用)"
                    checked={formData.capabilities?.tools || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      capabilities: { ...prev.capabilities!, tools: e.currentTarget.checked }
                    }))}
                    styles={{ label: { fontSize: '0.75rem' } }}
                  />
                  <Checkbox
                    label="Streaming (流式输出)"
                    checked={formData.capabilities?.streaming ?? true}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      capabilities: { ...prev.capabilities!, streaming: e.currentTarget.checked }
                    }))}
                    styles={{ label: { fontSize: '0.75rem' } }}
                  />
                </Stack>
              </Box>

              <hr className="border-gray-800 my-4" />

              {/* Metadata Configuration */}
              <Box>
                <Text size="xs" fw={600} c="gray.5" tt="uppercase" mb="sm">
                  模型元数据
                </Text>
                <Stack gap="sm">
                  <NumberInput
                    label="Input Window (输入窗口)"
                    value={formData.metadata?.inputWindow || 4096}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata!, inputWindow: Number(value) }
                    }))}
                    min={1}
                    styles={{ label: { fontSize: '0.75rem', color: 'var(--mantine-color-gray-5)' } }}
                  />
                  <NumberInput
                    label="Output Window (输出窗口)"
                    value={formData.metadata?.outputWindow || 4096}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata!, outputWindow: Number(value) }
                    }))}
                    min={1}
                    styles={{ label: { fontSize: '0.75rem', color: 'var(--mantine-color-gray-5)' } }}
                  />
                  <Checkbox
                    label="Reasoning Model (推理模型，如 o1/o3)"
                    checked={formData.metadata?.isReasoning || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata!, isReasoning: e.currentTarget.checked }
                    }))}
                    styles={{ label: { fontSize: '0.75rem' } }}
                  />
                </Stack>
              </Box>

              <hr className="border-gray-800 my-4" />

              {/* Advanced Settings - Collapsible */}
              <Box>
                <Group
                  onClick={() => setShowTestSection(!showTestSection)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  justify="space-between"
                  mb="sm"
                >
                  <Text size="xs" fw={600} c="gray.5" tt="uppercase">
                    连接测试
                  </Text>
                  {showTestSection ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                </Group>

                <Collapse in={showTestSection}>
                  <Stack gap="sm" mt="sm">
                    <Textarea
                      label="测试消息"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.currentTarget.value)}
                      placeholder="输入测试消息..."
                      minRows={3}
                      styles={{ label: { fontSize: '0.75rem', color: 'var(--mantine-color-gray-5)' } }}
                    />

                    <Button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || !formData.model || !formData.apiKey}
                      fullWidth
                      leftSection={isTesting ? <Loader size="xs" /> : <IconFlask size={16} />}
                    >
                      {isTesting ? '测试中...' : '测试连接'}
                    </Button>

                    {testResult && (
                      <Box
                        p="sm"
                        style={{
                          borderRadius: 'var(--mantine-radius-md)',
                          border: testResult.success 
                            ? '1px solid var(--mantine-color-green-8)'
                            : '1px solid var(--mantine-color-red-8)',
                          backgroundColor: testResult.success
                            ? 'rgba(64, 192, 87, 0.1)'
                            : 'rgba(250, 82, 82, 0.1)'
                        }}
                      >
                        <Group align="flex-start" gap="xs">
                          {testResult.success ? (
                            <IconCheck size={16} style={{ color: 'var(--mantine-color-green-4)', flexShrink: 0, marginTop: 2 }} />
                          ) : (
                            <IconAlertCircle size={16} style={{ color: 'var(--mantine-color-red-4)', flexShrink: 0, marginTop: 2 }} />
                          )}
                          <Box style={{ flex: 1 }}>
                            <Text size="xs" fw={500} mb={4} c={testResult.success ? 'green.2' : 'red.2'}>
                              {testResult.success ? '连接成功' : '连接失败'}
                            </Text>
                            {testResult.response && <Text size="xs" c="gray.3">{testResult.response}</Text>}
                            {testResult.error && <Text size="xs" c="red.3">错误: {testResult.error}</Text>}
                          </Box>
                        </Group>
                      </Box>
                    )}
                  </Stack>
                </Collapse>
              </Box>

              <hr className="border-gray-800 my-4" />

              {/* Active Model */}
              <Checkbox
                label="设为活跃模型"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                styles={{ label: { fontSize: '0.75rem' } }}
              />

            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <Group p="md" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
            <Button
              type="button"
              variant="default"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              color="orange"
              leftSection={isLoading ? <Loader size="xs" /> : <IconDeviceFloppy size={16} />}
              style={{ 
                flex: 1,
                borderWidth: 2,
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)'
              }}
              styles={{
                root: {
                  '&:hover': {
                    boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
                  }
                }
              }}
            >
              {isLoading ? '保存中...' : '创建配置'}
            </Button>
          </Group>
        </form>
      </Drawer>
    )
}

export default AIModelDrawer
