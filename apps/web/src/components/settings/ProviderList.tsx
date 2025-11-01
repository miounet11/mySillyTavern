/**
 * Provider List Component - Left Sidebar for Provider Selection
 */

'use client'

import { useState } from 'react'
import { Stack, Flex, Image, Text, Button, Tooltip } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { AIProvider, PROVIDER_INFO } from '@sillytavern-clone/shared'
import { useProviderConfigStore } from '@/stores/providerConfigStore'
import { AddProviderModal } from './AddProviderModal'

interface ProviderListProps {
  selectedProvider: AIProvider | null
  onSelectProvider: (provider: AIProvider) => void
  onProviderAdded?: (provider: AIProvider) => void
}

export function ProviderList({ selectedProvider, onSelectProvider, onProviderAdded }: ProviderListProps) {
  // 响应式订阅 providerConfigs，当 store 更新时组件会自动重新渲染
  const providerConfigs = useProviderConfigStore((state) => state.providerConfigs)
  const { setProviderConfig } = useProviderConfigStore()
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  
  // 在组件内计算 configuredProviders
  const configuredProviders = Object.keys(providerConfigs).filter(
    (provider) => providerConfigs[provider as AIProvider]?.apiKey
  ) as AIProvider[]

  const handleAddProvider = (provider: AIProvider) => {
    const providerInfo = PROVIDER_INFO[provider]
    // Create empty configuration with default base URL
    setProviderConfig(provider, {
      apiKey: '',
      baseUrl: providerInfo.defaultBaseUrl || '',
    })
    setIsAddingProvider(false)
    onSelectProvider(provider)
    if (onProviderAdded) {
      onProviderAdded(provider)
    }
  }

  return (
    <Stack
      gap="xs"
      style={{
        padding: 'var(--mantine-spacing-xs)',
        minWidth: '140px',
        maxWidth: '140px',
        borderRight: '1px solid rgb(55, 65, 81)', // gray-700
      }}
    >
      {/* 添加供应商按钮 */}
      <Button
        variant="light"
        size="compact-xs"
        leftSection={<IconPlus size={14} />}
        onClick={() => setIsAddingProvider(true)}
        fullWidth
        styles={{
          label: {
            fontSize: '0.75rem',
          }
        }}
      >
        添加
      </Button>

      {/* 添加供应商Modal */}
      <AddProviderModal
        isOpen={isAddingProvider}
        onClose={() => setIsAddingProvider(false)}
        onSave={handleAddProvider}
      />

      {/* 已配置的供应商列表 */}
      {configuredProviders.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          style={{
            padding: '2rem 1rem',
            color: 'rgb(107, 114, 128)',
          }}
        >
          <Text size="xs" style={{ textAlign: 'center', color: 'rgb(107, 114, 128)' }}>
            还没有配置供应商
          </Text>
          <Text size="xs" style={{ textAlign: 'center', color: 'rgb(107, 114, 128)', marginTop: '0.25rem' }}>
            点击上方按钮添加
          </Text>
        </Flex>
      ) : (
        configuredProviders.map((provider) => {
          const info = PROVIDER_INFO[provider]
          const isActive = selectedProvider === provider

          return (
            <Tooltip key={provider} label={info.displayName} position="right">
              <Flex
                gap="xs"
                align="center"
                onClick={() => onSelectProvider(provider)}
                style={{
                  cursor: 'pointer',
                  padding: 'var(--mantine-spacing-xs)',
                  borderRadius: 'var(--mantine-radius-md)',
                  background: isActive
                    ? 'rgba(59, 130, 246, 0.15)' // blue-500/15
                    : 'transparent',
                  color: isActive
                    ? 'rgb(96, 165, 250)' // blue-400
                    : 'rgb(156, 163, 175)', // gray-400
                  transition: 'all 0.2s ease',
                }}
                className={!isActive ? 'provider-list-item' : ''}
              >
                <Image
                  src={info.icon}
                  alt={info.displayName}
                  w={32}
                  h={32}
                  style={{ flexShrink: 0 }}
                />
                <Text
                  size="xs"
                  style={{
                    fontWeight: 500,
                    color: 'inherit',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {info.displayName}
                </Text>
              </Flex>
            </Tooltip>
          )
        })
      )}
    </Stack>
  )
}
