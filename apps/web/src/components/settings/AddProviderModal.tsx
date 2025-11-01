/**
 * Add Provider Modal - Modal dialog for selecting provider type
 */

'use client'

import { useState, useMemo } from 'react'
import { Modal, Select, Button, Stack, Text, Flex } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { AIProvider, PROVIDER_INFO } from '@sillytavern-clone/shared'
import { useProviderConfigStore } from '@/stores/providerConfigStore'

interface AddProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (provider: AIProvider) => void
}

export function AddProviderModal({ isOpen, onClose, onSave }: AddProviderModalProps) {
  const { isProviderConfigured } = useProviderConfigStore()
  
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

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

  const handleClose = () => {
    setSelectedProvider(null)
    setError('')
    onClose()
  }

  const handleSave = () => {
    if (!selectedProvider) {
      setError('请选择供应商类型')
      return
    }

    onSave(selectedProvider as AIProvider)
    handleClose()
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Text
          size="sm"
          style={{
            fontWeight: 600,
            color: 'rgb(243, 244, 246)',
          }}
        >
          添加供应商
        </Text>
      }
      size="md"
      centered
      styles={{
        content: {
          backgroundColor: 'rgb(31, 41, 55)',
        },
        header: {
          backgroundColor: 'rgb(31, 41, 55)',
          borderBottom: '1px solid rgb(55, 65, 81)',
        },
        body: {
          backgroundColor: 'rgb(31, 41, 55)',
        },
        close: {
          color: 'rgb(156, 163, 175)',
          '&:hover': {
            backgroundColor: 'rgb(55, 65, 81)',
          },
        },
      }}
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
      zIndex={150}
    >
      <Stack gap="lg">
        <Text size="sm" style={{ color: 'rgb(209, 213, 219)' }}>
          选择要添加的AI供应商类型。添加后，您可以在右侧配置API密钥和其他设置。
        </Text>

        {/* 供应商类型选择 */}
        <Select
          label="供应商类型"
          placeholder="选择供应商"
          data={availableProviders}
          value={selectedProvider}
          onChange={(value) => {
            setSelectedProvider(value)
            setError('')
          }}
          required
          error={error}
          searchable
          size="md"
          comboboxProps={{ 
            zIndex: 200,
            transitionProps: { duration: 200 }
          }}
          styles={{
            label: { 
              color: 'rgb(209, 213, 219)', 
              fontSize: '0.875rem', 
              marginBottom: 8,
              fontWeight: 600,
            },
            input: {
              backgroundColor: 'rgb(17, 24, 39)',
              borderColor: error ? 'rgb(239, 68, 68)' : 'rgb(75, 85, 99)',
              color: 'rgb(243, 244, 246)',
              minHeight: '44px',
            },
            dropdown: {
              backgroundColor: 'rgb(31, 41, 55)',
              borderColor: 'rgb(75, 85, 99)',
              zIndex: 200,
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

        {availableProviders.length === 0 && (
          <Text size="sm" style={{ color: 'rgb(156, 163, 175)', textAlign: 'center', padding: '1rem' }}>
            所有供应商都已配置
          </Text>
        )}

        {/* 操作按钮 */}
        <Flex gap="sm" justify="flex-end" style={{ marginTop: '0.5rem' }}>
          <Button
            variant="subtle"
            size="md"
            onClick={handleClose}
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
            disabled={!selectedProvider || availableProviders.length === 0}
            style={{
              backgroundColor: 'rgb(59, 130, 246)',
              color: 'white',
              minHeight: '44px',
            }}
          >
            添加
          </Button>
        </Flex>
      </Stack>
    </Modal>
  )
}

