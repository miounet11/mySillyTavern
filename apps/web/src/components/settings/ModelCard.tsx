/**
 * Model Card Component - Enhanced card with capabilities and metadata
 */

'use client'

import { Flex, Text, Badge, ActionIcon, Stack } from '@mantine/core'
import { IconEye, IconTool, IconBulb, IconDatabase, IconLogout, IconSettings, IconCircleMinus, IconPower } from '@tabler/icons-react'
import { AIModelConfig } from '@sillytavern-clone/shared'

interface ModelCardProps {
  model: AIModelConfig
  onEdit: (model: AIModelConfig) => void
  onDelete: (model: AIModelConfig) => void
  onSetActive?: (model: AIModelConfig) => void
}

export function ModelCard({ model, onEdit, onDelete, onSetActive }: ModelCardProps) {
  const capabilities = model.capabilities
  const metadata = model.metadata

  // Format window sizes (e.g., 128000 -> 128K)
  const formatWindow = (size: number) => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`
    if (size >= 1000) return `${(size / 1000).toFixed(0)}K`
    return size.toString()
  }

  return (
    <Flex
      gap="xs"
      align="center"
      style={{
        padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
        border: '1px solid rgb(55, 65, 81)', // gray-700
        borderRadius: 'var(--mantine-radius-md)',
        background: 'rgba(31, 41, 55, 0.5)', // gray-800/50
        transition: 'all 0.2s ease',
        minHeight: '72px',
      }}
      className="hover:bg-[rgb(31,41,55)] active:scale-[0.98]"
    >
      {/* Model Info */}
      <Stack gap="xs" style={{ flex: '1 1 auto', minWidth: 0 }}>
        {/* Model Name */}
        <Flex gap="xs" align="center">
          <Text
            size="sm"
            style={{
              fontWeight: 500,
              color: 'rgb(229, 231, 235)', // gray-200
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={metadata?.displayName || model.name}
          >
            {metadata?.displayName || model.name}
          </Text>
          {model.isActive && (
            <Badge
              color="green"
              size="xs"
              style={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              活跃
            </Badge>
          )}
        </Flex>

        {/* Capabilities and Metadata */}
        <Flex gap="xs" align="center" style={{ flexWrap: 'wrap' }}>
          {/* Capability Icons */}
          {capabilities?.vision && (
            <Flex align="center" gap={2} style={{ opacity: 0.7, color: 'rgb(59, 130, 246)' }}> {/* blue */}
              <IconEye size={14} />
            </Flex>
          )}
          {capabilities?.tools && (
            <Flex align="center" gap={2} style={{ opacity: 0.7, color: 'rgb(34, 197, 94)' }}> {/* green */}
              <IconTool size={14} />
            </Flex>
          )}
          {metadata?.isReasoning && (
            <Flex align="center" gap={2} style={{ opacity: 0.7, color: 'rgb(251, 191, 36)' }}> {/* amber */}
              <IconBulb size={14} />
            </Flex>
          )}

          {/* Context Windows */}
          {metadata?.inputWindow && (
            <Flex
              align="center"
              gap={2}
              style={{
                opacity: 0.8,
                flexShrink: 0,
                color: 'rgb(156, 163, 175)', // gray-400
              }}
            >
              <IconDatabase size={12} />
              <Text size="xs" style={{ whiteSpace: 'nowrap', color: 'rgb(229, 231, 235)' }}>
                {formatWindow(metadata.inputWindow)}
              </Text>
            </Flex>
          )}
          {metadata?.outputWindow && (
            <Flex
              align="center"
              gap={2}
              style={{
                opacity: 0.8,
                flexShrink: 0,
                color: 'rgb(156, 163, 175)', // gray-400
              }}
            >
              <IconLogout size={12} />
              <Text size="xs" style={{ whiteSpace: 'nowrap', color: 'rgb(229, 231, 235)' }}>
                {formatWindow(metadata.outputWindow)}
              </Text>
            </Flex>
          )}
        </Flex>
      </Stack>

      {/* Actions */}
      <Flex gap="xs" align="center" style={{ flex: '0 0 auto', marginLeft: 'auto' }}>
        {!model.isActive && onSetActive && (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={() => onSetActive(model)}
            title="启用"
            style={{ 
              color: 'rgb(156, 163, 175)',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <IconPower size={20} />
          </ActionIcon>
        )}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={() => onEdit(model)}
          title="设置"
          style={{ 
            color: 'rgb(156, 163, 175)',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <IconSettings size={22} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          size="lg"
          onClick={() => onDelete(model)}
          title="删除"
          style={{ 
            color: 'rgb(239, 68, 68)',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <IconCircleMinus size={22} />
        </ActionIcon>
      </Flex>
    </Flex>
  )
}

