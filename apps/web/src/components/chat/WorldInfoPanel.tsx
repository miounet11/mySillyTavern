"use client"

import { useState } from 'react'
import { 
  Drawer, 
  Button, 
  TextInput, 
  NumberInput, 
  Textarea, 
  Badge, 
  SegmentedControl, 
  Switch, 
  Checkbox, 
  ActionIcon, 
  Stack, 
  Group, 
  Text,
  ScrollArea,
  Box
} from '@mantine/core'
import WorldInfoTableView from './WorldInfoTableView'
import { 
  IconX, 
  IconPlus, 
  IconSearch, 
  IconEdit, 
  IconTrash, 
  IconChevronDown,
  IconChevronUp,
  IconBook,
  IconTable,
  IconLayoutGrid
} from '@tabler/icons-react'
import { useTranslation } from '@/lib/i18n'

interface WorldInfoEntry {
  id: string
  name: string
  keywords: string[]
  content: string
  enabled: boolean
  position: number
  depth: number
  priority: number
}

interface WorldInfoPanelProps {
  isOpen: boolean
  onClose: () => void
  characterId?: string
}

export default function WorldInfoPanel({
  isOpen,
  onClose,
  characterId
}: WorldInfoPanelProps) {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<WorldInfoEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingEntry, setEditingEntry] = useState<WorldInfoEntry | null>(null)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    content: '',
    enabled: true,
    position: 4,
    depth: 4,
    priority: 100
  })

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = () => {
    setIsCreating(true)
    setEditingEntry(null)
    setFormData({ name: '', keywords: '', content: '', enabled: true, position: 4, depth: 4, priority: 100 })
  }

  const handleSave = () => {
    const newEntry: WorldInfoEntry = {
      id: editingEntry?.id || Date.now().toString(),
      name: formData.name,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      content: formData.content,
      enabled: formData.enabled,
      position: formData.position,
      depth: formData.depth,
      priority: formData.priority
    }

    if (editingEntry) {
      setEntries(entries.map(e => e.id === editingEntry.id ? newEntry : e))
    } else {
      setEntries([...entries, newEntry])
    }

    setIsCreating(false)
    setEditingEntry(null)
    setFormData({ name: '', keywords: '', content: '', enabled: true, position: 4, depth: 4, priority: 100 })
  }

  const handleEdit = (entry: WorldInfoEntry) => {
    setEditingEntry(entry)
    setIsCreating(true)
    setFormData({
      name: entry.name,
      keywords: entry.keywords.join(', '),
      content: entry.content,
      enabled: entry.enabled,
      position: entry.position,
      depth: entry.depth,
      priority: entry.priority
    })
  }

  const handleUpdate = (id: string, updates: Partial<WorldInfoEntry>) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, ...updates } : e
    ))
  }

  const handleDelete = (id: string) => {
    if (confirm(t('chat.worldInfo.deleteConfirm'))) {
      setEntries(entries.filter(e => e.id !== id))
    }
  }

  const toggleEntry = (id: string) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ))
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedEntries(newExpanded)
  }

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      size="xl"
      position="right"
      title={
        <Group gap="xs">
          <IconBook size={24} color="var(--mantine-color-teal-4)" />
          <Text size="xl" fw={700}>{t('chat.worldInfo.title')}</Text>
        </Group>
      }
    >
      <Stack style={{ height: '100%' }} gap="md">
        {!isCreating ? (
          <>
            {/* Search and Add */}
            <Group gap="xs" wrap="nowrap">
              <TextInput
                placeholder={t('chat.worldInfo.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                style={{ flex: 1 }}
              />
              
              {/* View Mode Toggle */}
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as 'table' | 'card')}
                data={[
                  { value: 'table', label: <IconTable size={16} /> },
                  { value: 'card', label: <IconLayoutGrid size={16} /> }
                ]}
              />
              
              <Button
                onClick={handleCreate}
                leftSection={<IconPlus size={16} />}
                gradient={{ from: 'teal', to: 'cyan' }}
                variant="gradient"
              >
                {t('chat.worldInfo.addEntry')}
              </Button>
            </Group>

            {/* Entries List/Table */}
            <ScrollArea style={{ flex: 1 }}>
              {filteredEntries.length === 0 ? (
                <Stack align="center" gap="md" py={60}>
                  <IconBook size={64} opacity={0.3} />
                  <Text c="dimmed">
                    {searchQuery ? t('chat.worldInfo.noMatchingEntries') : t('chat.worldInfo.noEntries')}
                  </Text>
                  {!searchQuery && (
                    <Button
                      onClick={handleCreate}
                      variant="light"
                      leftSection={<IconPlus size={16} />}
                    >
                      {t('chat.worldInfo.createFirstEntry')}
                    </Button>
                  )}
                </Stack>
              ) : viewMode === 'table' ? (
                <WorldInfoTableView
                  entries={filteredEntries}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={toggleEntry}
                  onUpdate={handleUpdate}
                />
              ) : (
                <Stack gap="xs">
                  {filteredEntries.map((entry) => (
                    <Box
                      key={entry.id}
                      p="md"
                      style={{
                        borderRadius: 'var(--mantine-radius-md)',
                        backgroundColor: 'var(--mantine-color-dark-7)',
                        border: '1px solid var(--mantine-color-dark-5)'
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text fw={600}>{entry.name}</Text>
                            <Switch
                              checked={entry.enabled}
                              onChange={() => toggleEntry(entry.id)}
                              color="teal"
                              size="sm"
                            />
                          </Group>
                          
                          <Group gap={4}>
                            {entry.keywords.map((keyword, i) => (
                              <Badge
                                key={i}
                                size="sm"
                                variant="light"
                                color="teal"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </Group>

                          {expandedEntries.has(entry.id) && (
                            <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                              {entry.content}
                            </Text>
                          )}
                        </Stack>

                        <Group gap={4}>
                          <ActionIcon
                            onClick={() => toggleExpand(entry.id)}
                            variant="subtle"
                            color="gray"
                          >
                            {expandedEntries.has(entry.id) ? (
                              <IconChevronUp size={16} />
                            ) : (
                              <IconChevronDown size={16} />
                            )}
                          </ActionIcon>
                          <ActionIcon
                            onClick={() => handleEdit(entry)}
                            variant="subtle"
                            color="gray"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            onClick={() => handleDelete(entry.id)}
                            variant="subtle"
                            color="red"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              )}
            </ScrollArea>
          </>
          ) : (
            /* Create/Edit Form */
            <Stack gap="md">
              <TextInput
                label={t('chat.worldInfo.entryName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                placeholder="例如: 魔法系统"
                required
              />

              <TextInput
                label="关键词（用逗号分隔）"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.currentTarget.value })}
                placeholder="例如: 魔法, 法术, 咒语"
                description={t('chat.worldInfo.keywordsHelp')}
              />

              <Textarea
                label={t('chat.worldInfo.entryContent')}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
                placeholder={t('chat.worldInfo.contentPlaceholder')}
                minRows={8}
                required
              />

              <Group grow>
                <NumberInput
                  label="位置"
                  value={formData.position}
                  onChange={(value) => setFormData({ ...formData, position: Number(value) || 0 })}
                  min={0}
                  max={100}
                  description="插入位置 (0-100)"
                />

                <NumberInput
                  label="深度"
                  value={formData.depth}
                  onChange={(value) => setFormData({ ...formData, depth: Number(value) || 0 })}
                  min={0}
                  description="扫描深度"
                />

                <NumberInput
                  label="优先级"
                  value={formData.priority}
                  onChange={(value) => setFormData({ ...formData, priority: Number(value) || 0 })}
                  min={0}
                  description="数值越高越优先"
                />
              </Group>

              <Checkbox
                label={t('chat.worldInfo.enableEntry')}
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.currentTarget.checked })}
              />

              <Group grow>
                <Button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.content}
                >
                  {t('chat.worldInfo.save')}
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setEditingEntry(null)
                  }}
                  variant="default"
                >
                  {t('chat.worldInfo.cancel')}
                </Button>
              </Group>
            </Stack>
          )}
      </Stack>
    </Drawer>
  )
}

