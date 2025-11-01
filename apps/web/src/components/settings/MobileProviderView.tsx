/**
 * Mobile Provider View - Mobile-optimized provider selection and configuration
 */

'use client'

import { useState } from 'react'
import { Stack, Flex, Image, Text, Button, Badge, PasswordInput, TextInput, Box } from '@mantine/core'
import { IconPlus, IconChevronRight, IconArrowLeft, IconCheck, IconDatabase } from '@tabler/icons-react'
import { AIProvider, PROVIDER_INFO, AIModelConfig } from '@sillytavern-clone/shared'
import { useProviderConfigStore } from '@/stores/providerConfigStore'
import { ModelCard } from './ModelCard'
import { InlineModelForm } from './InlineModelForm'
import { AddProviderForm } from './AddProviderForm'
import toast from 'react-hot-toast'

interface MobileProviderViewProps {
  selectedProvider: AIProvider | null
  onSelectProvider: (provider: AIProvider) => void
  models: AIModelConfig[]
  onAddModel: () => void
  onEditModel: (model: AIModelConfig) => void
  onDeleteModel: (model: AIModelConfig) => void
  onSetActiveModel: (model: AIModelConfig) => void
  onRefreshModels?: () => void
  isLoading?: boolean
}

export function MobileProviderView({
  selectedProvider,
  onSelectProvider,
  models,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onSetActiveModel,
  onRefreshModels,
  isLoading = false,
}: MobileProviderViewProps) {
  const providerConfigs = useProviderConfigStore((state) => state.providerConfigs)
  const { setProviderConfig, updateProviderApiKey, updateProviderBaseUrl, getProviderConfig } = useProviderConfigStore()
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [isAddingModel, setIsAddingModel] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  const configuredProviders = Object.keys(providerConfigs).filter(
    (provider) => providerConfigs[provider as AIProvider]?.apiKey
  ) as AIProvider[]

  // Load provider config when provider changes
  const loadProviderConfig = (provider: AIProvider) => {
    const providerInfo = PROVIDER_INFO[provider]
    const config = getProviderConfig(provider)
    if (config) {
      setApiKey(config.apiKey || '')
      setBaseUrl(config.baseUrl || providerInfo.defaultBaseUrl || '')
    } else {
      setApiKey('')
      setBaseUrl(providerInfo.defaultBaseUrl || '')
    }
  }

  const handleSelectProvider = (provider: AIProvider) => {
    onSelectProvider(provider)
    loadProviderConfig(provider)
  }

  const handleBackToList = () => {
    onSelectProvider(null as any)
    setIsAddingModel(false)
  }

  const handleAddProvider = (provider: AIProvider, config: { apiKey: string; baseUrl: string }) => {
    setProviderConfig(provider, config)
    setIsAddingProvider(false)
    handleSelectProvider(provider)
  }

  const handleApiKeyChange = (value: string) => {
    if (selectedProvider) {
      setApiKey(value)
      updateProviderApiKey(selectedProvider, value)
    }
  }

  const handleBaseUrlChange = (value: string) => {
    if (selectedProvider) {
      setBaseUrl(value)
      updateProviderBaseUrl(selectedProvider, value)
    }
  }

  const handleSaveNewModel = async (modelData: {
    name: string
    settings?: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  }) => {
    if (!selectedProvider) return

    try {
      const response = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelData.name,
          provider: selectedProvider,
          model: modelData.name,
          apiKey: apiKey,
          baseUrl: baseUrl,
          settings: modelData.settings || {},
          isActive: false,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '添加模型失败')
      }

      toast.success('模型添加成功')
      setIsAddingModel(false)
      
      if (onRefreshModels) {
        onRefreshModels()
      }
    } catch (error) {
      console.error('Error saving model:', error)
      toast.error(error instanceof Error ? error.message : '添加模型失败')
      throw error
    }
  }

  // Provider List View
  if (!selectedProvider) {
    return (
      <Stack gap="md" style={{ padding: 'var(--mantine-spacing-md)', paddingBottom: 'var(--mantine-spacing-xl)' }}>
        {/* Header */}
        <Text
          size="lg"
          style={{
            fontWeight: 600,
            color: 'rgb(243, 244, 246)',
            marginBottom: '0.5rem',
          }}
        >
          AI 供应商
        </Text>

        {/* Add Provider Button */}
        <Button
          variant="light"
          size="lg"
          leftSection={<IconPlus size={20} />}
          onClick={() => setIsAddingProvider(true)}
          disabled={isAddingProvider}
          fullWidth
          style={{
            minHeight: '48px',
            fontSize: '1rem',
          }}
        >
          添加新供应商
        </Button>

        {/* Add Provider Form */}
        {isAddingProvider && (
          <Box style={{ marginTop: '1rem' }}>
            <AddProviderForm
              onSave={handleAddProvider}
              onCancel={() => setIsAddingProvider(false)}
            />
          </Box>
        )}

        {/* Provider Cards */}
        {configuredProviders.length === 0 && !isAddingProvider ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{
              padding: '3rem 1rem',
              color: 'rgb(107, 114, 128)',
            }}
          >
            <IconDatabase size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <Text size="md" fw={600} style={{ marginBottom: '0.5rem', color: 'rgb(209, 213, 219)' }}>
              还没有配置供应商
            </Text>
            <Text size="sm" style={{ textAlign: 'center', color: 'rgb(107, 114, 128)' }}>
              点击上方按钮添加您的第一个 AI 供应商
            </Text>
          </Flex>
        ) : (
          <Stack gap="md">
            {configuredProviders.map((provider) => {
              const info = PROVIDER_INFO[provider]
              const providerModels = models.filter((m) => m.provider === provider)
              const activeModel = providerModels.find((m) => m.isActive)

              return (
                <Flex
                  key={provider}
                  gap="md"
                  align="center"
                  onClick={() => handleSelectProvider(provider)}
                  style={{
                    cursor: 'pointer',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(31, 41, 55, 0.5)',
                    border: '1px solid rgb(55, 65, 81)',
                    transition: 'all 0.2s ease',
                    minHeight: '72px',
                  }}
                  className="hover:bg-[rgb(31,41,55)] active:scale-[0.98]"
                >
                  <Image
                    src={info.icon}
                    alt={info.displayName}
                    w={48}
                    h={48}
                    style={{ flexShrink: 0 }}
                  />
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      size="md"
                      style={{
                        fontWeight: 600,
                        color: 'rgb(243, 244, 246)',
                      }}
                    >
                      {info.displayName}
                    </Text>
                    <Flex gap="xs" align="center" style={{ flexWrap: 'wrap' }}>
                      <Badge
                        color={providerModels.length > 0 ? 'teal' : 'gray'}
                        size="sm"
                        variant="light"
                      >
                        {providerModels.length} 模型
                      </Badge>
                      {activeModel && (
                        <Badge color="green" size="sm" variant="light">
                          {activeModel.name}
                        </Badge>
                      )}
                    </Flex>
                  </Stack>
                  <IconChevronRight size={24} style={{ color: 'rgb(156, 163, 175)' }} />
                </Flex>
              )
            })}
          </Stack>
        )}
      </Stack>
    )
  }

  // Provider Detail View
  const providerInfo = PROVIDER_INFO[selectedProvider]
  const providerModels = models.filter((m) => m.provider === selectedProvider)

  return (
    <Stack gap="md" style={{ padding: 'var(--mantine-spacing-md)', paddingBottom: 'var(--mantine-spacing-xl)' }}>
      {/* Header with Back Button */}
      <Flex align="center" gap="md">
        <Button
          variant="subtle"
          size="md"
          onClick={handleBackToList}
          leftSection={<IconArrowLeft size={20} />}
          style={{
            color: 'rgb(156, 163, 175)',
            padding: '0.5rem',
          }}
        >
          返回
        </Button>
        <Text
          size="xl"
          style={{
            fontWeight: 600,
            color: 'rgb(243, 244, 246)',
            flex: 1,
          }}
        >
          {providerInfo.displayName}
        </Text>
      </Flex>

      {/* API Configuration */}
      <Stack gap="md">
        <Text
          size="sm"
          style={{
            fontWeight: 600,
            color: 'rgb(209, 213, 219)',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          }}
        >
          API 配置
        </Text>

        <div>
          <Text size="sm" style={{ marginBottom: 8, color: 'rgb(209, 213, 219)' }}>
            API Key
          </Text>
          <PasswordInput
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            size="md"
            styles={{
              input: {
                backgroundColor: 'rgb(31, 41, 55)',
                borderColor: 'rgb(75, 85, 99)',
                color: 'rgb(243, 244, 246)',
                minHeight: '48px',
              },
            }}
          />
          <Text size="xs" style={{ marginTop: 4, color: 'rgb(107, 114, 128)' }}>
            {providerInfo.description}
          </Text>
        </div>

        <div>
          <Text size="sm" style={{ marginBottom: 8, color: 'rgb(209, 213, 219)' }}>
            API Host
          </Text>
          <TextInput
            placeholder={providerInfo.defaultBaseUrl || 'https://api.example.com'}
            value={baseUrl}
            onChange={(e) => handleBaseUrlChange(e.target.value)}
            size="md"
            styles={{
              input: {
                backgroundColor: 'rgb(31, 41, 55)',
                borderColor: 'rgb(75, 85, 99)',
                color: 'rgb(243, 244, 246)',
                minHeight: '48px',
              },
            }}
          />
          {providerInfo.defaultBaseUrl && (
            <Text size="xs" style={{ marginTop: 4, color: 'rgb(107, 114, 128)' }}>
              默认: {providerInfo.defaultBaseUrl}
            </Text>
          )}
        </div>
      </Stack>

      {/* Models Section */}
      <Stack gap="md" style={{ marginTop: '1rem' }}>
        <Flex align="center" justify="space-between">
          <Text
            size="sm"
            style={{
              fontWeight: 600,
              color: 'rgb(209, 213, 219)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
            }}
          >
            模型列表
          </Text>
          <Button
            variant="light"
            size="md"
            leftSection={<IconPlus size={18} />}
            onClick={() => setIsAddingModel(true)}
            disabled={isAddingModel}
            style={{
              minHeight: '40px',
            }}
          >
            添加模型
          </Button>
        </Flex>

        {/* Inline Add Model Form */}
        {isAddingModel && (
          <InlineModelForm
            provider={selectedProvider}
            onSave={handleSaveNewModel}
            onCancel={() => setIsAddingModel(false)}
          />
        )}

        {/* Model Cards */}
        {providerModels.length === 0 && !isAddingModel ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{
              padding: '2rem 1rem',
              color: 'rgb(107, 114, 128)',
              borderRadius: '0.5rem',
              border: '2px dashed rgb(75, 85, 99)',
              backgroundColor: 'rgb(17, 24, 39, 0.3)',
            }}
          >
            <IconDatabase size={48} style={{ opacity: 0.5, marginBottom: '1rem', color: 'rgb(156, 163, 175)' }} />
            <Text size="sm" fw={600} style={{ marginBottom: '0.5rem', color: 'rgb(209, 213, 219)' }}>
              还没有配置模型
            </Text>
            <Text size="xs" style={{ color: 'rgb(107, 114, 128)', marginBottom: '1rem', textAlign: 'center' }}>
              点击上方"添加模型"按钮添加您的第一个模型
            </Text>
          </Flex>
        ) : (
          <Stack gap="md">
            {providerModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onEdit={onEditModel}
                onDelete={onDeleteModel}
                onSetActive={onSetActiveModel}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

