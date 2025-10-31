'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  TextInput,
  Stack,
  Group,
  Text,
  Badge,
  ActionIcon,
  Loader,
  ScrollArea,
  Box,
  Code as CodeBlock,
  Tabs
} from '@mantine/core'
import {
  IconSearch,
  IconWand,
  IconTag,
  IconCopy,
  IconCheck
} from '@tabler/icons-react'
import toast from 'react-hot-toast'

interface TemplateVariable {
  id: string
  name: string
  variable: string
  description: string
  example: string
  category: string
}

interface TemplateVariablePickerProps {
  isOpen: boolean
  onClose: () => void
  onInsert?: (variable: string) => void
}

export default function TemplateVariablePicker({
  isOpen,
  onClose,
  onInsert,
}: TemplateVariablePickerProps) {
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchVariables()
    }
  }, [isOpen])

  const fetchVariables = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/template-variables?${params}`)
      if (!response.ok) throw new Error('Failed to fetch variables')

      const data = await response.json()
      setVariables(data.variables)
      setCategories(['all', ...data.categories])
    } catch (error) {
      console.error('Error fetching variables:', error)
      toast.error('加载模板变量失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchVariables()
    }
  }, [selectedCategory, isOpen])

  const handleCopy = (variable: TemplateVariable) => {
    navigator.clipboard.writeText(variable.variable)
    setCopiedId(variable.id)
    toast.success('已复制到剪贴板')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleInsert = (variable: TemplateVariable) => {
    if (onInsert) {
      onInsert(variable.variable)
      toast.success(`已插入 ${variable.variable}`)
    } else {
      handleCopy(variable)
    }
  }

  const filteredVariables = variables.filter(v =>
    !searchQuery ||
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      all: '全部',
      basic: '基础',
      character: '角色',
      dynamic: '动态',
      context: '上下文',
      utility: '工具'
    }
    return labels[cat] || cat
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="xs">
          <IconWand size={24} color="hsl(var(--primary-rose))" />
          <Text size="xl" fw={700}>模板变量选择器</Text>
        </Group>
      }
      styles={{
        content: { height: '85vh' },
        body: { height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <Stack style={{ flex: 1, overflow: 'hidden' }} gap="md">
        <Text size="sm" c="dimmed">
          点击变量来插入到你的消息或提示词中
        </Text>

        {/* Search Bar */}
        <TextInput
          placeholder="搜索变量..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<IconSearch size={16} />}
        />

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onChange={(value) => setSelectedCategory(value || 'all')}>
          <Tabs.List>
            {categories.map((cat) => (
              <Tabs.Tab key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        {/* Variables List */}
        <ScrollArea style={{ flex: 1 }}>
          {isLoading ? (
            <Stack align="center" gap="md" py={60}>
              <Loader color="brand" />
              <Text c="dimmed">加载中...</Text>
            </Stack>
          ) : filteredVariables.length === 0 ? (
            <Stack align="center" gap="md" py={60}>
              <IconTag size={64} opacity={0.3} />
              <Text c="dimmed">没有找到匹配的变量</Text>
            </Stack>
          ) : (
            <Stack gap="xs">
              {filteredVariables.map((variable) => (
                <Box
                  key={variable.id}
                  p="md"
                  style={{
                    borderRadius: 'var(--mantine-radius-md)',
                    border: '1px solid hsl(var(--primary-rose) / 0.3)',
                    backgroundColor: 'hsl(var(--bg-card))',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'hsl(var(--primary-rose) / 0.5)'
                    e.currentTarget.style.backgroundColor = 'hsl(var(--bg-overlay))'
                    const actionGroup = e.currentTarget.querySelector('[data-action-group]') as HTMLElement
                    if (actionGroup) actionGroup.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'hsl(var(--primary-rose) / 0.3)'
                    e.currentTarget.style.backgroundColor = 'hsl(var(--bg-card))'
                    const actionGroup = e.currentTarget.querySelector('[data-action-group]') as HTMLElement
                    if (actionGroup) actionGroup.style.opacity = '0'
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group gap="xs">
                        <CodeBlock
                          style={{
                            fontSize: 'var(--font-sm)',
                            backgroundColor: 'hsl(var(--bg-base-start))',
                            color: 'hsl(var(--primary-rose-light))',
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          {variable.variable}
                        </CodeBlock>
                        <Badge
                          variant="light"
                          color="brand"
                          size="sm"
                        >
                          {getCategoryLabel(variable.category)}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed">{variable.description}</Text>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">示例：</Text>
                        <CodeBlock
                          style={{
                            fontSize: 'var(--font-xs)',
                            backgroundColor: 'hsl(var(--bg-base-start))',
                            color: 'hsl(var(--text-secondary))',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          {variable.example}
                        </CodeBlock>
                      </Group>
                    </Stack>
                    
                    <Group 
                      gap="xs" 
                      data-action-group
                      style={{ opacity: 0, transition: 'opacity 0.2s' }}
                    >
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleInsert(variable)
                        }}
                        size="sm"
                        color="brand"
                        variant="gradient"
                      >
                        插入
                      </Button>
                      <ActionIcon
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(variable)
                        }}
                        variant="default"
                        size="lg"
                        color="brand"
                      >
                        {copiedId === variable.id ? (
                          <IconCheck size={18} />
                        ) : (
                          <IconCopy size={18} />
                        )}
                      </ActionIcon>
                    </Group>
                  </Group>
                </Box>
              ))}
            </Stack>
          )}
        </ScrollArea>

        {/* Footer */}
        <Group justify="space-between" pt="md" style={{ borderTop: '1px solid hsl(var(--primary-rose) / 0.3)' }}>
          <Text size="sm" c="dimmed">
            共 {filteredVariables.length} 个变量
          </Text>
          <Button variant="subtle" onClick={onClose}>
            关闭
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
