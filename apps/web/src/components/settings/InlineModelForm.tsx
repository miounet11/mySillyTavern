/**
 * Inline Model Form - Form for adding new models inline
 */

'use client'

import { useState } from 'react'
import { Stack, Flex, Button, TextInput, NumberInput, Accordion, Text } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { AIProvider } from '@sillytavern-clone/shared'

interface InlineModelFormProps {
  provider: AIProvider
  onSave: (modelData: {
    name: string
    settings?: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  }) => Promise<void>
  onCancel: () => void
}

export function InlineModelForm({
  provider,
  onSave,
  onCancel,
}: InlineModelFormProps) {
  const [name, setName] = useState('')
  const [temperature, setTemperature] = useState<number | string>(0.7)
  const [maxTokens, setMaxTokens] = useState<number | string>(2048)
  const [topP, setTopP] = useState<number | string>(1.0)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})

  const validateForm = () => {
    const newErrors: { name?: string } = {}
    
    if (!name.trim()) {
      newErrors.name = '模型名称不能为空'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        name: name.trim(),
        settings: {
          temperature: typeof temperature === 'number' ? temperature : parseFloat(temperature.toString()),
          maxTokens: typeof maxTokens === 'number' ? maxTokens : parseInt(maxTokens.toString()),
          topP: typeof topP === 'number' ? topP : parseFloat(topP.toString()),
        },
      })
    } catch (error) {
      console.error('Error saving model:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Stack
      gap="md"
      style={{
        padding: '1rem',
        border: '2px solid rgb(59, 130, 246)', // blue-500
        borderRadius: '0.5rem',
        backgroundColor: 'rgb(31, 41, 55)', // gray-800
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
        添加新模型
      </Text>

      {/* 必填字段 */}
      <TextInput
        label="模型名称"
        placeholder="例如: gpt-4, claude-3-opus-20240229, glm-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        error={errors.name}
        description="输入模型的完整名称，如 gpt-4、claude-3-opus-20240229"
        styles={{
          label: { color: 'rgb(209, 213, 219)', fontSize: '0.875rem', marginBottom: 4 },
          description: { color: 'rgb(107, 114, 128)', fontSize: '0.75rem' },
          input: {
            backgroundColor: 'rgb(17, 24, 39)',
            borderColor: errors.name ? 'rgb(239, 68, 68)' : 'rgb(75, 85, 99)',
            color: 'rgb(243, 244, 246)',
          },
        }}
      />

      {/* 可选配置（可折叠） */}
      <Accordion
        variant="contained"
        styles={{
          control: {
            backgroundColor: 'rgb(17, 24, 39)',
            color: 'rgb(209, 213, 219)',
            '&:hover': {
              backgroundColor: 'rgb(31, 41, 55)',
            },
          },
          item: {
            backgroundColor: 'rgb(17, 24, 39)',
            border: '1px solid rgb(75, 85, 99)',
          },
          panel: {
            backgroundColor: 'rgb(17, 24, 39)',
          },
        }}
      >
        <Accordion.Item value="advanced">
          <Accordion.Control>
            <Text size="sm" style={{ color: 'rgb(209, 213, 219)' }}>
              高级配置（可选）
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <NumberInput
                label="Temperature"
                description="控制输出的随机性，范围 0-2"
                value={temperature}
                onChange={(val) => setTemperature(val || 0.7)}
                min={0}
                max={2}
                step={0.1}
                decimalScale={2}
                styles={{
                  label: { color: 'rgb(209, 213, 219)', fontSize: '0.875rem', marginBottom: 4 },
                  description: { color: 'rgb(107, 114, 128)', fontSize: '0.75rem' },
                  input: {
                    backgroundColor: 'rgb(17, 24, 39)',
                    borderColor: 'rgb(75, 85, 99)',
                    color: 'rgb(243, 244, 246)',
                  },
                }}
              />

              <NumberInput
                label="Max Tokens"
                description="最大输出令牌数"
                value={maxTokens}
                onChange={(val) => setMaxTokens(val || 2048)}
                min={1}
                max={100000}
                step={256}
                styles={{
                  label: { color: 'rgb(209, 213, 219)', fontSize: '0.875rem', marginBottom: 4 },
                  description: { color: 'rgb(107, 114, 128)', fontSize: '0.75rem' },
                  input: {
                    backgroundColor: 'rgb(17, 24, 39)',
                    borderColor: 'rgb(75, 85, 99)',
                    color: 'rgb(243, 244, 246)',
                  },
                }}
              />

              <NumberInput
                label="Top P"
                description="核采样参数，范围 0-1"
                value={topP}
                onChange={(val) => setTopP(val || 1.0)}
                min={0}
                max={1}
                step={0.05}
                decimalScale={2}
                styles={{
                  label: { color: 'rgb(209, 213, 219)', fontSize: '0.875rem', marginBottom: 4 },
                  description: { color: 'rgb(107, 114, 128)', fontSize: '0.75rem' },
                  input: {
                    backgroundColor: 'rgb(17, 24, 39)',
                    borderColor: 'rgb(75, 85, 99)',
                    color: 'rgb(243, 244, 246)',
                  },
                }}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* 操作按钮 */}
      <Flex gap="sm" justify="flex-end">
        <Button
          variant="subtle"
          onClick={onCancel}
          leftSection={<IconX size={16} />}
          disabled={isSaving}
          style={{
            color: 'rgb(156, 163, 175)',
          }}
        >
          取消
        </Button>
        <Button
          onClick={handleSave}
          leftSection={<IconCheck size={16} />}
          loading={isSaving}
          style={{
            backgroundColor: 'rgb(59, 130, 246)',
            color: 'white',
          }}
        >
          保存
        </Button>
      </Flex>
    </Stack>
  )
}

