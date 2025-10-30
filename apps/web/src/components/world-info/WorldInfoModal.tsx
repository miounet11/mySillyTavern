/**
 * World Information creation/editing modal
 */

import { useState, useEffect } from 'react'
import { 
  IconDeviceFloppy, 
  IconPlus, 
  IconTrash, 
  IconWorld, 
  IconUsers, 
  IconKey, 
  IconHash 
} from '@tabler/icons-react'
import { WorldInfo, Character } from '@sillytavern-clone/shared'
import toast from 'react-hot-toast'
import { 
  Modal, 
  Button, 
  TextInput, 
  Textarea, 
  Checkbox, 
  Tabs, 
  Stack, 
  Group, 
  Text, 
  ActionIcon, 
  Slider, 
  Box, 
  Divider,
  ScrollArea
} from '@mantine/core'

interface WorldInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onWorldInfoSaved: (worldInfo: WorldInfo) => void
  editingWorldInfo?: WorldInfo | null
  characters: Character[]
}

interface WorldInfoEntry {
  id?: string
  keywords: string[]
  content: string
  priority: number
  enabled: boolean
  caseSensitive: boolean
  matchWholeWords: boolean
  activationKeys: string[]
  category?: string
}

export default function WorldInfoModal({
  isOpen,
  onClose,
  onWorldInfoSaved,
  editingWorldInfo,
  characters
}: WorldInfoModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isGlobal: false,
    isActive: true,
  })

  const [entries, setEntries] = useState<WorldInfoEntry[]>([
    {
      keywords: [''],
      content: '',
      priority: 50,
      enabled: true,
      caseSensitive: false,
      matchWholeWords: false,
      activationKeys: [],
      category: '',
    }
  ])

  // Reset form when modal opens/closes or editing world info changes
  useEffect(() => {
    if (isOpen) {
      if (editingWorldInfo) {
        setFormData({
          name: editingWorldInfo.name,
          description: editingWorldInfo.description || '',
          isGlobal: editingWorldInfo.isGlobal || false,
          isActive: editingWorldInfo.isActive || true,
        })
        setSelectedCharacterIds(editingWorldInfo.characterIds || [])
        setEntries(editingWorldInfo.entries && editingWorldInfo.entries.length > 0 ? editingWorldInfo.entries : [createNewEntry()])
      } else {
        resetForm()
      }
    }
  }, [isOpen, editingWorldInfo])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isGlobal: false,
      isActive: true,
    })
    setSelectedCharacterIds([])
    setEntries([createNewEntry()])
  }

  const createNewEntry = (): WorldInfoEntry => ({
    keywords: [''],
    content: '',
    priority: 50,
    enabled: true,
    caseSensitive: false,
    matchWholeWords: false,
    activationKeys: [],
    category: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('世界信息名称是必填项')
      return
    }

    if (entries.length === 0 || entries.every(entry => !entry.content.trim())) {
      toast.error('至少需要一个有效的条目内容')
      return
    }

    setIsLoading(true)

    try {
      // Validate and clean entries
      const validEntries = entries
        .filter(entry => entry.content.trim() && entry.keywords.some(keyword => keyword.trim()))
        .map(entry => ({
          ...entry,
          keywords: entry.keywords.filter(keyword => keyword.trim()),
          activationKeys: entry.activationKeys.filter(key => key.trim()),
        }))

      if (validEntries.length === 0) {
        throw new Error('至少需要一个有效的条目（包含关键词和内容）')
      }

      const submitData = {
        ...formData,
        entries: validEntries,
        characterIds: formData.isGlobal ? [] : selectedCharacterIds,
      }

      const url = editingWorldInfo ? `/api/world-info/${editingWorldInfo.id}` : '/api/world-info'
      const method = editingWorldInfo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        throw new Error(editingWorldInfo ? 'Failed to update world info' : 'Failed to create world info')
      }

      const worldInfo = await response.json()
      onWorldInfoSaved(worldInfo)

    } catch (error) {
      console.error('Error saving world info:', error)
      toast.error(editingWorldInfo ? '更新世界信息失败' : '创建世界信息失败')
    } finally {
      setIsLoading(false)
    }
  }

  const addEntry = () => {
    setEntries(prev => [...prev, createNewEntry()])
  }

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index))
  }

  const updateEntry = (index: number, updates: Partial<WorldInfoEntry>) => {
    setEntries(prev => prev.map((entry, i) => i === index ? { ...entry, ...updates } : entry))
  }

  const addKeyword = (entryIndex: number) => {
    const entry = entries[entryIndex]
    updateEntry(entryIndex, { keywords: [...entry.keywords, ''] })
  }

  const updateKeyword = (entryIndex: number, keywordIndex: number, value: string) => {
    const entry = entries[entryIndex]
    const newKeywords = [...entry.keywords]
    newKeywords[keywordIndex] = value
    updateEntry(entryIndex, { keywords: newKeywords })
  }

  const removeKeyword = (entryIndex: number, keywordIndex: number) => {
    const entry = entries[entryIndex]
    const newKeywords = entry.keywords.filter((_, i) => i !== keywordIndex)
    updateEntry(entryIndex, { keywords: newKeywords })
  }

  const addActivationKey = (entryIndex: number) => {
    const entry = entries[entryIndex]
    updateEntry(entryIndex, { activationKeys: [...entry.activationKeys, ''] })
  }

  const updateActivationKey = (entryIndex: number, keyIndex: number, value: string) => {
    const entry = entries[entryIndex]
    const newKeys = [...entry.activationKeys]
    newKeys[keyIndex] = value
    updateEntry(entryIndex, { activationKeys: newKeys })
  }

  const removeActivationKey = (entryIndex: number, keyIndex: number) => {
    const entry = entries[entryIndex]
    const newKeys = entry.activationKeys.filter((_, i) => i !== keyIndex)
    updateEntry(entryIndex, { activationKeys: newKeys })
  }

  const toggleCharacterSelection = (characterId: string) => {
    setSelectedCharacterIds(prev =>
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    )
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <Text size="xl" fw={700}>
          {editingWorldInfo ? '编辑世界信息' : '创建世界信息'}
        </Text>
      }
      styles={{
        content: { maxHeight: '90vh' },
        body: { height: 'calc(90vh - 60px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs defaultValue="basic" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Tabs.List grow>
            <Tabs.Tab value="basic">基本信息</Tabs.Tab>
            <Tabs.Tab value="entries">条目管理</Tabs.Tab>
            <Tabs.Tab value="settings">高级设置</Tabs.Tab>
          </Tabs.List>

          {/* Basic Information */}
          <Tabs.Panel value="basic" pt="md">
            <ScrollArea style={{ height: 'calc(90vh - 200px)' }}>
              <Stack gap="md">
                <TextInput
                  label={<><Text component="span">名称</Text> <Text component="span" c="red">*</Text></>}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.currentTarget.value }))}
                  placeholder="例如: 魔法世界的设定"
                  maxLength={100}
                  required
                />

                <Textarea
                  label="描述"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.currentTarget.value }))}
                  placeholder="描述这个世界信息的用途和内容..."
                  minRows={4}
                  maxLength={500}
                />

                <Group gap="xl">
                  <Checkbox
                    label="全局世界信息（适用于所有角色）"
                    checked={formData.isGlobal}
                    onChange={(e) => setFormData(prev => ({ ...prev, isGlobal: e.currentTarget.checked }))}
                  />
                  <Checkbox
                    label="启用这个世界信息"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                  />
                </Group>

                {/* Character Selection */}
                {!formData.isGlobal && (
                  <Box>
                    <Text size="sm" fw={500} mb="xs">关联角色</Text>
                    <Stack gap="xs" style={{ maxHeight: 160, overflowY: 'auto' }}>
                      {characters.length === 0 ? (
                        <Text size="sm" c="dimmed">还没有创建任何角色</Text>
                      ) : (
                        characters.map((character) => (
                          <Checkbox
                            key={character.id}
                            label={character.name}
                            checked={selectedCharacterIds.includes(character.id)}
                            onChange={() => toggleCharacterSelection(character.id)}
                          />
                        ))
                      )}
                    </Stack>
                    <Text size="xs" c="dimmed" mt="xs">
                      选择可以使用这个世界信息的角色，留空则适用于所有角色
                    </Text>
                  </Box>
                )}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

            {/* Entries Management */}
          <Tabs.Panel value="entries" pt="md">
            <ScrollArea style={{ height: 'calc(90vh - 200px)' }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>世界信息条目</Text>
                  <Button
                    type="button"
                    variant="light"
                    size="compact-sm"
                    onClick={addEntry}
                    leftSection={<IconPlus size={16} />}
                  >
                    添加条目
                  </Button>
                </Group>

                <Stack gap="lg">
                {entries.map((entry, entryIndex) => (
                  <Box key={entryIndex} p="md" style={{ border: '1px solid var(--mantine-color-dark-5)', borderRadius: 'var(--mantine-radius-md)' }}>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>条目 {entryIndex + 1}</Text>
                        <Group gap="xs">
                          <Checkbox
                            label="启用"
                            checked={entry.enabled}
                            onChange={(e) => updateEntry(entryIndex, { enabled: e.currentTarget.checked })}
                          />
                          {entries.length > 1 && (
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => removeEntry(entryIndex)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      </Group>

                      <Group align="flex-start" grow>
                        {/* Keywords */}
                        <Box>
                          <Text size="sm" fw={500} mb="xs">触发关键词</Text>
                          <Stack gap="xs">
                            {entry.keywords.map((keyword, keywordIndex) => (
                              <Group key={keywordIndex} gap="xs" wrap="nowrap">
                                <TextInput
                                  value={keyword}
                                  onChange={(e) => updateKeyword(entryIndex, keywordIndex, e.currentTarget.value)}
                                  placeholder="关键词..."
                                  style={{ flex: 1 }}
                                />
                                {entry.keywords.length > 1 && (
                                  <ActionIcon
                                    variant="light"
                                    color="red"
                                    onClick={() => removeKeyword(entryIndex, keywordIndex)}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                )}
                              </Group>
                            ))}
                            <Button
                              type="button"
                              variant="light"
                              size="compact-xs"
                              onClick={() => addKeyword(entryIndex)}
                              leftSection={<IconPlus size={14} />}
                            >
                              添加关键词
                            </Button>
                          </Stack>
                        </Box>

                        {/* Category and Priority */}
                        <Stack gap="xs">
                          <TextInput
                            label="分类 (可选)"
                            value={entry.category || ''}
                            onChange={(e) => updateEntry(entryIndex, { category: e.currentTarget.value })}
                            placeholder="例如: 人物、地点、魔法..."
                          />

                          <Box>
                            <Text size="sm" fw={500} mb="xs">优先级: {entry.priority}</Text>
                            <Slider
                              value={entry.priority}
                              onChange={(value) => updateEntry(entryIndex, { priority: value })}
                              min={0}
                              max={100}
                              marks={[
                                { value: 0, label: '低' },
                                { value: 100, label: '高' }
                              ]}
                            />
                          </Box>
                        </Stack>
                      </Group>

                      {/* Content */}
                      <Textarea
                        label={<><Text component="span">内容</Text> <Text component="span" c="red">*</Text></>}
                        value={entry.content}
                        onChange={(e) => updateEntry(entryIndex, { content: e.currentTarget.value })}
                        placeholder="输入世界信息内容，当触发关键词出现时会将这些信息提供给AI..."
                        minRows={4}
                        required
                      />

                      {/* Advanced Options */}
                      <Divider />
                      <Group align="flex-start" grow>
                        <Stack gap="xs">
                          <Checkbox
                            label="区分大小写"
                            checked={entry.caseSensitive}
                            onChange={(e) => updateEntry(entryIndex, { caseSensitive: e.currentTarget.checked })}
                          />
                          <Checkbox
                            label="匹配完整单词"
                            checked={entry.matchWholeWords}
                            onChange={(e) => updateEntry(entryIndex, { matchWholeWords: e.currentTarget.checked })}
                          />
                        </Stack>

                        {/* Activation Keys */}
                        <Box>
                          <Text size="sm" fw={500} mb="xs">激活密钥 (可选)</Text>
                          <Stack gap="xs">
                            {entry.activationKeys.map((key, keyIndex) => (
                              <Group key={keyIndex} gap="xs" wrap="nowrap">
                                <TextInput
                                  value={key}
                                  onChange={(e) => updateActivationKey(entryIndex, keyIndex, e.currentTarget.value)}
                                  placeholder="激活密钥..."
                                  style={{ flex: 1 }}
                                />
                                {entry.activationKeys.length > 1 && (
                                  <ActionIcon
                                    variant="light"
                                    color="red"
                                    onClick={() => removeActivationKey(entryIndex, keyIndex)}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                )}
                              </Group>
                            ))}
                            <Button
                              type="button"
                              variant="light"
                              size="compact-xs"
                              onClick={() => addActivationKey(entryIndex)}
                              leftSection={<IconPlus size={14} />}
                            >
                              添加激活密钥
                            </Button>
                          </Stack>
                          <Text size="xs" c="dimmed" mt="xs">
                            只有当激活密钥也出现在对话中时，这个条目才会被触发
                          </Text>
                        </Box>
                      </Group>
                    </Stack>
                  </Box>
                ))}
                </Stack>
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* Advanced Settings */}
          <Tabs.Panel value="settings" pt="md">
            <ScrollArea style={{ height: 'calc(90vh - 200px)' }}>
              <Box p="lg" style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-dark-5)' }}>
                <Text size="lg" fw={600} mb="md">使用说明</Text>
                <Stack gap="md">
                  <Box>
                    <Text fw={500} mb="xs">关键词匹配</Text>
                    <Text size="sm" c="dimmed">当用户消息中包含设置的关键词时，对应的世界信息条目会被自动激活并添加到AI的上下文中。</Text>
                  </Box>

                  <Box>
                    <Text fw={500} mb="xs">优先级</Text>
                    <Text size="sm" c="dimmed">优先级高的条目会优先被激活，数值范围为0-100，数字越大优先级越高。</Text>
                  </Box>

                  <Box>
                    <Text fw={500} mb="xs">激活密钥</Text>
                    <Text size="sm" c="dimmed">可选的额外条件，只有当关键词和激活密钥同时出现在对话中时，条目才会被激活。</Text>
                  </Box>

                  <Box>
                    <Text fw={500} mb="xs">全局 vs 角色专用</Text>
                    <Text size="sm" c="dimmed">全局世界信息适用于所有角色，角色专用的世界信息只在关联角色的对话中使用。</Text>
                  </Box>

                  <Box>
                    <Text fw={500} mb="xs">性能提示</Text>
                    <Text size="sm" c="dimmed">过多的世界信息条目可能会影响响应速度，建议定期清理不常用的条目。</Text>
                  </Box>
                </Stack>
              </Box>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>

        {/* Form Actions */}
        <Group justify="flex-end" pt="md" mt="md" style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}>
          <Button
            type="button"
            variant="default"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            leftSection={<IconDeviceFloppy size={16} />}
          >
            {editingWorldInfo ? '更新世界信息' : '创建世界信息'}
          </Button>
        </Group>
      </form>
    </Modal>
  )
}