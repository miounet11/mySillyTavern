/**
 * Provider List Component - Left Sidebar for Provider Selection
 */

'use client'

import { useState } from 'react'
import { Stack, Flex, Image, Text, Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { AIProvider, PROVIDER_INFO } from '@sillytavern-clone/shared'
import { useProviderConfigStore } from '@/stores/providerConfigStore'
import { AddProviderForm } from './AddProviderForm'

interface ProviderListProps {
  selectedProvider: AIProvider | null
  onSelectProvider: (provider: AIProvider) => void
  onProviderAdded?: (provider: AIProvider) => void
}

export function ProviderList({ selectedProvider, onSelectProvider, onProviderAdded }: ProviderListProps) {
  const { getConfiguredProviders, setProviderConfig } = useProviderConfigStore()
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  
  const configuredProviders = getConfiguredProviders()

  const handleAddProvider = (provider: AIProvider, config: { apiKey: string; baseUrl: string }) => {
    setProviderConfig(provider, config)
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
        minWidth: '200px',
        borderRight: '1px solid rgb(55, 65, 81)', // gray-700
      }}
    >
      {/* 添加供应商按钮 */}
      <Button
        variant="light"
        size="compact-sm"
        leftSection={<IconPlus size={16} />}
        onClick={() => setIsAddingProvider(true)}
        disabled={isAddingProvider}
        style={{
          fontSize: '0.875rem',
        }}
      >
        添加供应商
      </Button>

      {/* 内联添加供应商表单 */}
      {isAddingProvider && (
        <AddProviderForm
          onSave={handleAddProvider}
          onCancel={() => setIsAddingProvider(false)}
        />
      )}

      {/* 已配置的供应商列表 */}
      {configuredProviders.length === 0 && !isAddingProvider ? (
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
            <Flex
              key={provider}
              gap="xs"
              align="center"
              onClick={() => onSelectProvider(provider)}
              style={{
                cursor: 'pointer',
                padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-md)',
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
                w={36}
                h={36}
                style={{ flexShrink: 0 }}
              />
              <Text
                size="sm"
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
          )
        })
      )}
    </Stack>
  )
}
