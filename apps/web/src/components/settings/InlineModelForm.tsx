/**
 * Inline Model Form - Form for adding new models inline
 */

'use client'

import { useState } from 'react'
import { Stack, Flex, Button, TextInput, NumberInput, Accordion, Text, Select } from '@mantine/core'
import { IconCheck, IconX, IconSparkles } from '@tabler/icons-react'
import { AIProvider } from '@sillytavern-clone/shared'

// 常用模型预设
const MODEL_PRESETS: Partial<Record<AIProvider, Array<{ value: string; label: string; description: string }>>> = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o', description: '最新多模态模型，性能最强' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: '推荐 - 快速且经济' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: '高性能，支持更长上下文' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: '经济实惠的选择' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', description: '推荐 - 最强思维能力' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', description: '最高质量输出' },
    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', description: '平衡性能与成本' },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', description: '快速响应' },
  ],
  google: [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', description: '推荐 - 最新实验版' },
    { value: 'gemini-pro', label: 'Gemini Pro', description: '通用高性能模型' },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision', description: '支持图像理解' },
  ],
  zhipu: [
    { value: 'glm-4-plus', label: 'GLM-4 Plus', description: '推荐 - 最强性能' },
    { value: 'glm-4', label: 'GLM-4', description: '通用模型' },
    { value: 'glm-3-turbo', label: 'GLM-3 Turbo', description: '快速响应' },
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek Chat', description: '推荐 - 对话优化' },
    { value: 'deepseek-coder', label: 'DeepSeek Coder', description: '代码专用' },
  ],
}

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
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [temperature, setTemperature] = useState<number | string>(0.7)
  const [maxTokens, setMaxTokens] = useState<number | string>(2048)
  const [topP, setTopP] = useState<number | string>(1.0)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})
  
  const availablePresets = MODEL_PRESETS[provider] || []
  
  const handlePresetSelect = (value: string | null) => {
    setSelectedPreset(value)
    if (value) {
      setName(value)
    }
  }

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

      {/* 快速选择预设（如果有） */}
      {availablePresets.length > 0 && (
        <div>
          <Select
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <IconSparkles size={14} />
                快速选择常用模型
              </span>
            }
            placeholder="选择一个预设模型..."
            value={selectedPreset}
            onChange={handlePresetSelect}
            data={availablePresets.map(preset => ({
              value: preset.value,
              label: `${preset.label} - ${preset.description}`,
            }))}
            clearable
            styles={{
              label: { color: 'rgb(209, 213, 219)', fontSize: '0.875rem', marginBottom: 4 },
              input: {
                backgroundColor: 'rgb(17, 24, 39)',
                borderColor: 'rgb(59, 130, 246, 0.5)',
                color: 'rgb(243, 244, 246)',
              },
            }}
          />
          <Text size="xs" style={{ color: 'rgb(107, 114, 128)', marginTop: 4 }}>
            或者在下方手动输入自定义模型名称
          </Text>
        </div>
      )}

      {/* 必填字段 */}
      <TextInput
        label="模型名称"
        placeholder="例如: gpt-4, claude-3-opus-20240229, glm-4"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          // 如果手动输入，清除预设选择
          if (selectedPreset) setSelectedPreset(null)
        }}
        required
        error={errors.name}
        description={availablePresets.length > 0 ? "已选择预设或自定义输入" : "输入模型的完整名称"}
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

