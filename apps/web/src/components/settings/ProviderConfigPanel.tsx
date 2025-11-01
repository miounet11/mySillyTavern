/**
 * Provider Config Panel - Right-side configuration panel for selected provider
 */

'use client'

import { useState, useEffect } from 'react'
import { Stack, Flex, Button, Text, PasswordInput, TextInput } from '@mantine/core'
import { IconPlus, IconRefresh, IconRestore, IconDatabase } from '@tabler/icons-react'
import { AIProvider, AIModelConfig, PROVIDER_INFO } from '@sillytavern-clone/shared'
import { ModelCard } from './ModelCard'
import { InlineModelForm } from './InlineModelForm'
import { useProviderConfigStore } from '@/stores/providerConfigStore'
import toast from 'react-hot-toast'

interface ProviderConfigPanelProps {
  provider: AIProvider
  models: AIModelConfig[]
  onAddModel: () => void
  onEditModel: (model: AIModelConfig) => void
  onDeleteModel: (model: AIModelConfig) => void
  onSetActiveModel: (model: AIModelConfig) => void
  onFetchModels?: () => void
  onResetModels?: () => void
  onRefreshModels?: () => void
  isLoading?: boolean
}

export function ProviderConfigPanel({
  provider,
  models,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onSetActiveModel,
  onFetchModels,
  onResetModels,
  onRefreshModels,
  isLoading = false,
}: ProviderConfigPanelProps) {
  const providerInfo = PROVIDER_INFO[provider]
  const { getProviderConfig, updateProviderApiKey, updateProviderBaseUrl } = useProviderConfigStore()
  
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState(providerInfo.defaultBaseUrl || '')
  const [isAddingModel, setIsAddingModel] = useState(false)

  // Load provider config when provider changes
  useEffect(() => {
    const config = getProviderConfig(provider)
    if (config) {
      setApiKey(config.apiKey || '')
      setBaseUrl(config.baseUrl || providerInfo.defaultBaseUrl || '')
    } else {
      setApiKey('')
      setBaseUrl(providerInfo.defaultBaseUrl || '')
    }
    setIsAddingModel(false) // Close form when switching providers
  }, [provider, getProviderConfig, providerInfo.defaultBaseUrl])

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    updateProviderApiKey(provider, value)
  }

  const handleBaseUrlChange = (value: string) => {
    setBaseUrl(value)
    updateProviderBaseUrl(provider, value)
  }

  const handleSaveNewModel = async (modelData: {
    name: string
    settings?: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  }) => {
    try {
      const response = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelData.name,
          provider: provider,
          model: modelData.name, // 模型名称同时作为 model ID
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
      
      // Refresh models list
      if (onRefreshModels) {
        onRefreshModels()
      }
    } catch (error) {
      console.error('Error saving model:', error)
      toast.error(error instanceof Error ? error.message : '添加模型失败')
      throw error
    }
  }

  return (
    <Stack
      gap="lg"
      style={{
        flex: 1,
        padding: 'var(--mantine-spacing-md)',
        paddingBottom: 'calc(var(--mantine-spacing-xl) + 2rem)',
        overflow: 'auto',
      }}
      className="md:pb-4"
    >
      {/* Header */}
      <Flex align="center" justify="space-between">
        <Text
          size="xl"
          style={{
            fontWeight: 600,
            color: 'rgb(243, 244, 246)', // gray-100
          }}
        >
          {providerInfo.displayName}
        </Text>
      </Flex>

      {/* API Configuration Section */}
      <Stack gap="xs">
        <Text
          size="sm"
          style={{
            fontWeight: 600,
            color: 'rgb(209, 213, 219)', // gray-300
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          }}
        >
          API 配置
        </Text>

        {/* API Key */}
        <div>
          <Text size="sm" style={{ marginBottom: 8, color: 'rgb(209, 213, 219)' }}>
            API Key
          </Text>
          <Flex gap="xs" align="center">
            <PasswordInput
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              size="md"
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: 'rgb(31, 41, 55)',
                  borderColor: 'rgb(75, 85, 99)',
                  color: 'rgb(243, 244, 246)',
                  minHeight: '44px',
                },
              }}
            />
          </Flex>
          <Text size="xs" style={{ marginTop: 4, color: 'rgb(107, 114, 128)' }}>
            {providerInfo.description}
          </Text>
        </div>

        {/* API Host */}
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
                minHeight: '44px',
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

      {/* Model Section */}
      <Stack gap="xs">
        <Flex align="center" justify="space-between">
          <Text
            size="sm"
            style={{
              fontWeight: 600,
              color: 'rgb(209, 213, 219)', // gray-300
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
            }}
          >
            模型
          </Text>
          <Flex gap="sm" align="center">
            <Button
              variant="light"
              size="compact-sm"
              leftSection={<IconPlus size={14} />}
              onClick={() => setIsAddingModel(true)}
              disabled={isAddingModel}
              style={{
                fontSize: '0.75rem',
                minHeight: '32px',
              }}
              className="md:h-7"
            >
              New
            </Button>
            {onResetModels && (
              <Button
                variant="subtle"
                size="compact-xs"
                leftSection={<IconRestore size={12} />}
                onClick={onResetModels}
                style={{
                  fontSize: '0.75rem',
                  height: 28,
                  color: 'rgb(156, 163, 175)',
                }}
              >
                Reset
              </Button>
            )}
            {onFetchModels && (
              <Button
                variant="subtle"
                size="compact-xs"
                leftSection={<IconRefresh size={12} />}
                onClick={onFetchModels}
                loading={isLoading}
                style={{
                  fontSize: '0.75rem',
                  height: 28,
                  color: 'rgb(156, 163, 175)',
                }}
              >
                Fetch
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Models List */}
        <Stack gap="sm">
          {/* Inline Add Form */}
          {isAddingModel && (
            <InlineModelForm
              provider={provider}
              onSave={handleSaveNewModel}
              onCancel={() => setIsAddingModel(false)}
            />
          )}

          {/* Existing Models */}
          {models.length === 0 && !isAddingModel ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              style={{
                padding: '2rem 1rem',
                color: 'rgb(107, 114, 128)', // gray-500
                borderRadius: '0.5rem',
                border: '2px dashed rgb(75, 85, 99)',
                backgroundColor: 'rgb(17, 24, 39, 0.3)',
              }}
            >
              <IconDatabase size={48} style={{ opacity: 0.5, marginBottom: '1rem', color: 'rgb(156, 163, 175)' }} />
              <Text size="sm" fw={600} style={{ marginBottom: '0.5rem', color: 'rgb(209, 213, 219)' }}>
                还没有配置 AI 模型
              </Text>
              <Text size="xs" style={{ color: 'rgb(107, 114, 128)', marginBottom: '1rem', textAlign: 'center' }}>
                点击上方 "New" 按钮添加您的第一个模型
              </Text>
              <div style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: 'rgb(59, 130, 246, 0.1)', 
                borderRadius: '0.375rem',
                border: '1px solid rgb(59, 130, 246, 0.2)',
                marginTop: '0.5rem'
              }}>
                <Text size="xs" style={{ color: 'rgb(147, 197, 253)', textAlign: 'center' }}>
                  💡 提示：第一个添加的模型会自动设为活跃
                </Text>
              </div>
            </Flex>
          ) : (
            models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onEdit={onEditModel}
                onDelete={onDeleteModel}
                onSetActive={onSetActiveModel}
              />
            ))
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}

