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
  Box
} from '@mantine/core'
import { 
  IconSearch, 
  IconStar, 
  IconStarFilled,
  IconCopy, 
  IconCheck,
  IconFileText,
  IconSparkles 
} from '@tabler/icons-react'
import toast from 'react-hot-toast'

interface PromptTemplate {
  id: string
  name: string
  content: string
  category: string
  description?: string
  isBuiltin: boolean
  isFavorite: boolean
  usageCount: number
}

interface ExternalPromptsDialogProps {
  isOpen: boolean
  onClose: () => void
  onApply?: (content: string) => void
}

export default function ExternalPromptsDialog({
  isOpen,
  onClose,
  onApply,
}: ExternalPromptsDialogProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('category', 'external')
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/prompt-templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('加载提示词模板失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (template: PromptTemplate) => {
    navigator.clipboard.writeText(template.content)
    setCopiedId(template.id)
    toast.success('已复制到剪贴板')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleApply = (template: PromptTemplate) => {
    if (onApply) {
      onApply(template.content)
      toast.success('提示词已应用')
      onClose()
    } else {
      handleCopy(template)
    }
  }

  const handleToggleFavorite = async (template: PromptTemplate) => {
    try {
      const response = await fetch(`/api/prompt-templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !template.isFavorite })
      })

      if (!response.ok) throw new Error('Failed to toggle favorite')

      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t
      ))

      toast.success(template.isFavorite ? '已取消收藏' : '已添加到收藏')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败')
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchTemplates()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, isOpen])

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="xs">
          <IconFileText size={24} color="hsl(var(--primary-rose))" />
          <Text size="xl" fw={700}>外部提示词库</Text>
        </Group>
      }
      styles={{
        content: { height: '85vh' },
        body: { height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <Stack style={{ flex: 1, overflow: 'hidden' }} gap="md">
        <Text size="sm" c="dimmed">
          选择一个提示词模板来增强AI的回复效果
        </Text>

        {/* Search Bar */}
        <TextInput
          placeholder="搜索提示词..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
        />

        {/* Templates List */}
        <ScrollArea style={{ flex: 1 }}>
          {isLoading ? (
            <Stack align="center" gap="md" py={60}>
              <Loader color="brand" />
              <Text c="dimmed">加载中...</Text>
            </Stack>
          ) : templates.length === 0 ? (
            <Stack align="center" gap="md" py={60}>
              <IconSparkles size={64} opacity={0.3} />
              <Text c="dimmed">没有找到匹配的提示词</Text>
            </Stack>
          ) : (
            <Stack gap="xs">
              {templates.map((template) => (
                <Box
                  key={template.id}
                  p="md"
                  style={{
                    borderRadius: 'var(--mantine-radius-md)',
                    border: selectedTemplate?.id === template.id 
                      ? '1px solid hsl(var(--primary-rose))' 
                      : '1px solid hsl(var(--primary-rose) / 0.3)',
                    backgroundColor: selectedTemplate?.id === template.id
                      ? 'hsl(var(--primary-rose) / 0.1)'
                      : 'hsl(var(--bg-card))',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <Group justify="space-between" align="flex-start" mb={selectedTemplate?.id === template.id ? "sm" : 0}>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text fw={600}>{template.name}</Text>
                        {template.isBuiltin && (
                          <Badge size="sm" variant="light" color="brand">官方</Badge>
                        )}
                      </Group>
                      {template.description && (
                        <Text size="sm" c="dimmed">{template.description}</Text>
                      )}
                    </Stack>
                    
                    <ActionIcon
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(template)
                      }}
                      variant="subtle"
                      color="yellow"
                    >
                      {template.isFavorite ? (
                        <IconStarFilled size={16} />
                      ) : (
                        <IconStar size={16} />
                      )}
                    </ActionIcon>
                  </Group>

                  {selectedTemplate?.id === template.id && (
                    <Stack gap="sm" mt="md" pt="md" style={{ borderTop: '1px solid hsl(var(--primary-rose) / 0.3)' }}>
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {template.content}
                      </Text>
                      <Group gap="xs">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApply(template)
                          }}
                          style={{ flex: 1 }}
                          size="sm"
                          color="brand"
                          variant="gradient"
                        >
                          应用提示词
                        </Button>
                        <ActionIcon
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(template)
                          }}
                          variant="default"
                          size="lg"
                        >
                          {copiedId === template.id ? (
                            <IconCheck size={18} />
                          ) : (
                            <IconCopy size={18} />
                          )}
                        </ActionIcon>
                      </Group>
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </ScrollArea>

        {/* Footer */}
        <Group justify="space-between" pt="md" style={{ borderTop: '1px solid hsl(var(--primary-rose) / 0.3)' }}>
          <Text size="sm" c="dimmed">
            共 {templates.length} 个提示词模板
          </Text>
          <Button variant="subtle" onClick={onClose}>
            关闭
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

