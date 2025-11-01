/**
 * Add Provider Form - Form for adding new provider configurations
 */

'use client'

import { useState, useMemo } from 'react'
import { Stack, Flex, Button, Text, Select, TextInput, PasswordInput } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { AIProvider, PROVIDER_INFO } from '@sillytavern-clone/shared'
import { useProviderConfigStore } from '@/stores/providerConfigStore'

interface AddProviderFormProps {
  onSave: (provider: AIProvider, config: { apiKey: string; baseUrl: string }) => void
  onCancel: () => void
}

export function AddProviderForm({ onSave, onCancel }: AddProviderFormProps) {
  const { isProviderConfigured } = useProviderConfigStore()
  
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [errors, setErrors] = useState<{ provider?: string; apiKey?: string; baseUrl?: string }>({})

  // 获取未配置的供应商列表
  const availableProviders = useMemo(() => {
    const allProviders = Object.keys(PROVIDER_INFO) as AIProvider[]
    return allProviders
      .filter((provider) => !isProviderConfigured(provider))
      .map((provider) => ({
        value: provider,
        label: PROVIDER_INFO[provider].displayName,
      }))
  }, [isProviderConfigured])

  // 当选择供应商时，自动填充默认 Base URL
  const handleProviderChange = (value: string | null) => {
    setSelectedProvider(value)
    if (value) {
      const provider = value as AIProvider
      setBaseUrl(PROVIDER_INFO[provider].defaultBaseUrl || '')
    } else {
      setBaseUrl('')
    }
  }

  const validateForm = () => {
    const newErrors: { provider?: string; apiKey?: string; baseUrl?: string } = {}
    
    if (!selectedProvider) {
      newErrors.provider = '请选择供应商类型'
    }
    
    if (!apiKey.trim()) {
      newErrors.apiKey = 'API Key 不能为空'
    }
    
    if (!baseUrl.trim()) {
      newErrors.baseUrl = 'API Host 不能为空'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm() || !selectedProvider) {
      return
    }

    onSave(selectedProvider as AIProvider, {
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
    })
  }

  return (
    <Stack
      gap="md"
      style={{
        padding: '1rem',
        border: '2px solid rgb(59, 130, 246)', // blue-500
        borderRadius: '0.5rem',
        backgroundColor: 'rgb(31, 41, 55)', // gray-800
        marginBottom: '0.5rem',
      }}
    >
      <Text
        size="sm"
        style={{
          fontWeight: 600,
          color: 'rgb(96, 165, 250)', // blue-400
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        }}
      >
        添加新供应商
      </Text>

      {/* 供应商类型选择 */}
      <Select
        label="供应商类型"
        placeholder="选择供应商"
        data={availableProviders}
        value={selectedProvider}
        onChange={handleProviderChange}
        required
        error={errors.provider}
        searchable
        size="md"
        comboboxProps={{ 
          zIndex: 1000,
          transitionProps: { duration: 200 }
        }}
        styles={{
          label: { color: 'rgb(209, 213, 219)', fontSize: '0.875rem', marginBottom: 4 },
          input: {
            backgroundColor: 'rgb(17, 24, 39)',
            borderColor: errors.provider ? 'rgb(239, 68, 68)' : 'rgb(75, 85, 99)',
            color: 'rgb(243, 244, 246)',
            minHeight: '44px',
          },
          dropdown: {
            backgroundColor: 'rgb(31, 41, 55)',
            borderColor: 'rgb(75, 85, 99)',
            zIndex: 1000,
          },
          option: {
            color: 'rgb(243, 244, 246)',
            '&[data-selected]': {
              backgroundColor: 'rgb(59, 130, 246)',
            },
            '&[data-hovered]': {
              backgroundColor: 'rgb(55, 65, 81)',
            },
          },
        }}
      />

      {/* API Key */}
      <PasswordInput
        label="API Key"
        placeholder="sk-..."
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        required
        error={errors.apiKey}
        size="md"
        styles={{
          label: { color: 'rgb(209, 213, 219)', fontSize: '0.875rem', marginBottom: 4 },
          input: {
            backgroundColor: 'rgb(17, 24, 39)',
            borderColor: errors.apiKey ? 'rgb(239, 68, 68)' : 'rgb(75, 85, 99)',
            color: 'rgb(243, 244, 246)',
            minHeight: '44px',
          },
        }}
      />

      {/* API Host */}
      <TextInput
        label="API Host"
        placeholder="https://api.example.com"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        required
        error={errors.baseUrl}
        size="md"
        description={
          selectedProvider && PROVIDER_INFO[selectedProvider as AIProvider]?.defaultBaseUrl
            ? `默认: ${PROVIDER_INFO[selectedProvider as AIProvider].defaultBaseUrl}`
            : undefined
        }
        styles={{
          label: { color: 'rgb(209, 213, 219)', fontSize: '0.875rem', marginBottom: 4 },
          description: { color: 'rgb(107, 114, 128)', fontSize: '0.75rem' },
          input: {
            backgroundColor: 'rgb(17, 24, 39)',
            borderColor: errors.baseUrl ? 'rgb(239, 68, 68)' : 'rgb(75, 85, 99)',
            color: 'rgb(243, 244, 246)',
            minHeight: '44px',
          },
        }}
      />

      {/* 操作按钮 */}
      <Flex gap="sm" justify="flex-end">
        <Button
          variant="subtle"
          size="md"
          onClick={onCancel}
          leftSection={<IconX size={18} />}
          style={{
            color: 'rgb(156, 163, 175)',
            minHeight: '44px',
          }}
        >
          取消
        </Button>
        <Button
          size="md"
          onClick={handleSave}
          leftSection={<IconCheck size={18} />}
          style={{
            backgroundColor: 'rgb(59, 130, 246)',
            color: 'white',
            minHeight: '44px',
          }}
        >
          保存并添加模型
        </Button>
      </Flex>
    </Stack>
  )
}

