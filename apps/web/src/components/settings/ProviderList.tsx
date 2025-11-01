/**
 * Provider List Component - Left Sidebar for Provider Selection
 */

'use client'

import { useState } from 'react'
import { Flex, Image, Text } from '@mantine/core'
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
    <>
      <Flex
        gap="md"
        style={{
          padding: 'var(--mantine-spacing-md) var(--mantine-spacing-sm)',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          borderBottom: '1px solid rgb(55, 65, 81)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(75, 85, 99) transparent',
        }}
        className="provider-horizontal-scroll"
      >
        {/* 添加供应商按钮卡片 */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          onClick={() => setIsAddingProvider(true)}
          style={{
            cursor: 'pointer',
            minWidth: '100px',
            maxWidth: '100px',
            padding: 'var(--mantine-spacing-sm)',
            borderRadius: 'var(--mantine-radius-md)',
            border: '2px dashed rgb(75, 85, 99)',
            background: 'transparent',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          className="provider-add-card"
        >
          <IconPlus size={32} style={{ color: 'rgb(96, 165, 250)', marginBottom: '0.25rem' }} />
          <Text size="xs" style={{ color: 'rgb(156, 163, 175)', textAlign: 'center', fontWeight: 500 }}>
            添加
          </Text>
        </Flex>

        {/* 已配置的供应商卡片列表 */}
        {configuredProviders.map((provider) => {
          const info = PROVIDER_INFO[provider]
          const isActive = selectedProvider === provider

          return (
            <Flex
              key={provider}
              direction="column"
              align="center"
              justify="center"
              onClick={() => onSelectProvider(provider)}
              style={{
                cursor: 'pointer',
                minWidth: '100px',
                maxWidth: '100px',
                padding: 'var(--mantine-spacing-sm)',
                borderRadius: 'var(--mantine-radius-md)',
                border: isActive
                  ? '2px solid rgb(59, 130, 246)'
                  : '2px solid transparent',
                background: isActive
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(31, 41, 55, 0.5)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              className="provider-card"
            >
              <Image
                src={info.icon}
                alt={info.displayName}
                w={40}
                h={40}
                style={{ flexShrink: 0, marginBottom: '0.25rem' }}
              />
              <Text
                size="xs"
                style={{
                  fontWeight: 500,
                  color: isActive ? 'rgb(96, 165, 250)' : 'rgb(209, 213, 219)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                {info.displayName}
              </Text>
            </Flex>
          )
        })}

        {/* 空状态提示 */}
        {configuredProviders.length === 0 && (
          <Text size="xs" style={{ color: 'rgb(107, 114, 128)', padding: '1rem', whiteSpace: 'nowrap' }}>
            点击"添加"按钮配置供应商
          </Text>
        )}
      </Flex>

      {/* 添加供应商Modal */}
      <AddProviderModal
        isOpen={isAddingProvider}
        onClose={() => setIsAddingProvider(false)}
        onSave={handleAddProvider}
      />

      <style jsx global>{`
        .provider-horizontal-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .provider-horizontal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .provider-horizontal-scroll::-webkit-scrollbar-thumb {
          background: rgb(75, 85, 99);
          border-radius: 3px;
        }
        .provider-horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgb(107, 114, 128);
        }
        
        .provider-add-card:hover {
          border-color: rgb(59, 130, 246);
          background: rgba(59, 130, 246, 0.05);
        }
        
        .provider-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        @media (hover: none) {
          .provider-add-card:active {
            transform: scale(0.95);
          }
          .provider-card:active {
            transform: scale(0.95);
          }
        }
      `}</style>
    </>
  )
}
