/**
 * Character creation/editing modal
 */

import { useState, useEffect } from 'react'
import {
  IconX,
  IconUpload,
  IconPhoto,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { Character, CreateCharacterParams } from '@sillytavern-clone/shared'
import { useCharacterStore } from '@/stores/characterStore'
import toast from 'react-hot-toast'
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Tabs,
  FileButton,
  Badge,
  Group,
  Stack,
  Text,
  NumberInput,
  Slider,
  ActionIcon,
  Image,
} from '@mantine/core'

interface CharacterModalProps {
  isOpen: boolean
  onClose: () => void
  onCharacterCreated?: (character: Character) => void
  onCharacterUpdated?: (character: Character) => void
  editingCharacter?: Character | null
}

export default function CharacterModal({
  isOpen,
  onClose,
  onCharacterCreated,
  onCharacterUpdated,
  editingCharacter
}: CharacterModalProps) {
  const { createCharacter, updateCharacter } = useCharacterStore()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [newTag, setNewTag] = useState('')

  // Form state
  const [formData, setFormData] = useState<CreateCharacterParams>({
    name: '',
    description: '',
    personality: '',
    firstMessage: '',
    background: '',
    exampleMessages: [],
    tags: [],
    settings: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      promptTemplate: '',
      jailbreakPrompt: '',
    }
  })

  // Reset form when modal opens/closes or editing character changes
  useEffect(() => {
    if (isOpen) {
      if (editingCharacter) {
        setFormData({
          name: editingCharacter.name,
          description: editingCharacter.description,
          personality: editingCharacter.personality || '',
          firstMessage: editingCharacter.firstMessage,
          background: editingCharacter.background || '',
          exampleMessages: editingCharacter.exampleMessages || [],
          tags: editingCharacter.tags || [],
          settings: editingCharacter.settings || {
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
            frequencyPenalty: 0,
            presencePenalty: 0,
            promptTemplate: '',
            jailbreakPrompt: '',
          }
        })
        setAvatarPreview(editingCharacter.avatar || '')
      } else {
        resetForm()
      }
    }
  }, [isOpen, editingCharacter])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      personality: '',
      firstMessage: '',
      background: '',
      exampleMessages: [],
      tags: [],
      settings: {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        promptTemplate: '',
        jailbreakPrompt: '',
      }
    })
    setAvatarPreview('')
    setNewTag('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('角色名称是必填项')
      return
    }

    if (!formData.firstMessage.trim()) {
      toast.error('第一条消息是必填项')
      return
    }

    setIsLoading(true)

    try {
      const submitData = {
        ...formData,
        avatar: avatarPreview,
      }

      if (editingCharacter) {
        const updatedCharacter = await updateCharacter(editingCharacter.id, submitData)
        if (updatedCharacter) {
          toast.success('角色更新成功')
          onCharacterUpdated?.(updatedCharacter)
          onClose()
        }
      } else {
        const newCharacter = await createCharacter(submitData)
        if (newCharacter) {
          toast.success('角色创建成功')
          onCharacterCreated?.(newCharacter)
          onClose()
        }
      }
    } catch (error) {
      console.error('Error saving character:', error)
      toast.error(editingCharacter ? '更新角色失败' : '创建角色失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('头像文件大小不能超过5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUrl = (url: string) => {
    setAvatarPreview(url)
  }

  const addExampleMessage = () => {
    setFormData((prev: CreateCharacterParams) => ({
      ...prev,
      exampleMessages: [...(prev.exampleMessages || []), '']
    }))
  }

  const updateExampleMessage = (index: number, value: string) => {
    setFormData((prev: CreateCharacterParams) => ({
      ...prev,
      exampleMessages: prev.exampleMessages?.map((msg: string, i: number) => i === index ? value : msg) || []
    }))
  }

  const removeExampleMessage = (index: number) => {
    setFormData((prev: CreateCharacterParams) => ({
      ...prev,
      exampleMessages: prev.exampleMessages?.filter((_: string, i: number) => i !== index) || []
    }))
  }

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData((prev: CreateCharacterParams) => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: CreateCharacterParams) => ({
      ...prev,
      tags: prev.tags?.filter((tag: string) => tag !== tagToRemove) || []
    }))
  }

  const updateSetting = (key: string, value: any) => {
    setFormData((prev: CreateCharacterParams) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }))
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={editingCharacter ? '编辑角色' : '创建新角色'}
      size="xl"
      centered
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic">
          <Tabs.List grow>
            <Tabs.Tab value="basic">基本信息</Tabs.Tab>
            <Tabs.Tab value="personality">个性设定</Tabs.Tab>
            <Tabs.Tab value="examples">示例对话</Tabs.Tab>
            <Tabs.Tab value="settings">高级设置</Tabs.Tab>
          </Tabs.List>

          {/* Basic Information */}
          <Tabs.Panel value="basic" pt="md">
            <Stack gap="md">
              <Group align="flex-start" grow>
                {/* Avatar Upload */}
                <Stack gap="sm">
                  <Text size="sm" fw={500}>
                    角色头像
                  </Text>
                  <Group gap="md">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        width={80}
                        height={80}
                        radius="md"
                        fit="cover"
                      />
                    ) : (
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          backgroundColor: 'rgb(55, 65, 81)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconPhoto size={32} color="rgb(156, 163, 175)" />
                      </div>
                    )}
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <FileButton
                        onChange={(file) => {
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('头像文件大小不能超过5MB')
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              setAvatarPreview(event.target?.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        accept="image/*"
                      >
                        {(props) => (
                          <Button
                            {...props}
                            variant="light"
                            size="sm"
                            leftSection={<IconUpload size={16} />}
                          >
                            上传图片
                          </Button>
                        )}
                      </FileButton>
                      <Text size="xs" c="dimmed">
                        或使用图片URL
                      </Text>
                    </Stack>
                  </Group>
                  <TextInput
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarPreview}
                    onChange={(e) => handleAvatarUrl(e.currentTarget.value)}
                  />
                </Stack>

                {/* Basic Fields */}
                <Stack gap="sm">
                  <TextInput
                    label="角色名称"
                    placeholder="输入角色名称"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev: CreateCharacterParams) => ({
                        ...prev,
                        name: e.currentTarget.value,
                      }))
                    }
                    maxLength={50}
                    required
                    withAsterisk
                  />

                  <Textarea
                    label="角色描述"
                    placeholder="简要描述这个角色..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev: CreateCharacterParams) => ({
                        ...prev,
                        description: e.currentTarget.value,
                      }))
                    }
                    minRows={3}
                    maxLength={500}
                  />

                  <Textarea
                    label="第一条消息"
                    placeholder="角色的开场白或问候语..."
                    value={formData.firstMessage}
                    onChange={(e) =>
                      setFormData((prev: CreateCharacterParams) => ({
                        ...prev,
                        firstMessage: e.currentTarget.value,
                      }))
                    }
                    minRows={4}
                    maxLength={500}
                    required
                    withAsterisk
                  />
                </Stack>
              </Group>

              {/* Tags */}
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  标签
                </Text>
                {formData.tags && formData.tags.length > 0 && (
                  <Group gap="xs">
                    {formData.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="light"
                        rightSection={
                          <ActionIcon
                            size="xs"
                            color="gray"
                            radius="xl"
                            variant="transparent"
                            onClick={() => removeTag(tag)}
                          >
                            <IconX size={10} />
                          </ActionIcon>
                        }
                        styles={{
                          root: {
                            paddingRight: '4px',
                          },
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                )}
                <Group gap="xs">
                  <TextInput
                    placeholder="添加标签..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={addTag}
                  >
                    <IconPlus size={18} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Stack>
          </Tabs.Panel>

          {/* Personality Settings */}
          <Tabs.Panel value="personality" pt="md">
            <Stack gap="md">
              <Textarea
                label="个性描述"
                placeholder="详细描述角色的性格特点、说话方式、行为模式等..."
                value={formData.personality}
                onChange={(e) =>
                  setFormData((prev: CreateCharacterParams) => ({
                    ...prev,
                    personality: e.currentTarget.value,
                  }))
                }
                minRows={6}
                maxLength={1000}
              />

              <Textarea
                label="背景故事"
                placeholder="角色的背景故事、经历、世界观等..."
                value={formData.background}
                onChange={(e) =>
                  setFormData((prev: CreateCharacterParams) => ({
                    ...prev,
                    background: e.currentTarget.value,
                  }))
                }
                minRows={6}
                maxLength={2000}
              />
            </Stack>
          </Tabs.Panel>

          {/* Example Messages */}
          <Tabs.Panel value="examples" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  示例对话
                </Text>
                <Button
                  variant="light"
                  size="sm"
                  onClick={addExampleMessage}
                  leftSection={<IconPlus size={16} />}
                >
                  添加示例
                </Button>
              </Group>

              {formData.exampleMessages && formData.exampleMessages.length > 0 ? (
                <Stack gap="sm">
                  {formData.exampleMessages.map((message: string, index: number) => (
                    <Stack key={index} gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          示例 {index + 1}
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => removeExampleMessage(index)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                      <Textarea
                        value={message}
                        onChange={(e) =>
                          updateExampleMessage(index, e.currentTarget.value)
                        }
                        placeholder={`示例对话 ${index + 1}...`}
                        minRows={3}
                        maxLength={1000}
                      />
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Stack align="center" justify="center" py="xl">
                  <IconPhoto size={48} opacity={0.5} color="gray" />
                  <Text size="sm" c="dimmed">
                    还没有示例对话
                  </Text>
                  <Text size="xs" c="dimmed">
                    添加示例对话可以帮助AI更好地理解角色
                  </Text>
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Advanced Settings */}
          <Tabs.Panel value="settings" pt="md">
            <Stack gap="md">
              <Group align="flex-start" grow>
                <Stack gap="md">
                  <div>
                    <Text size="sm" mb="xs">
                      创造性 (Temperature)
                    </Text>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={formData.settings?.temperature || 0.7}
                      onChange={(value) => updateSetting('temperature', value)}
                      marks={[
                        { value: 0, label: '保守' },
                        { value: 2, label: '创新' },
                      ]}
                      label={(value) => value.toFixed(1)}
                    />
                  </div>

                  <NumberInput
                    label="最大令牌数 (Max Tokens)"
                    min={1}
                    max={4000}
                    value={formData.settings?.maxTokens || 2048}
                    onChange={(value) =>
                      updateSetting('maxTokens', typeof value === 'number' ? value : 2048)
                    }
                  />

                  <div>
                    <Text size="sm" mb="xs">
                      Top P
                    </Text>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={formData.settings?.topP || 0.9}
                      onChange={(value) => updateSetting('topP', value)}
                      label={(value) => value.toFixed(1)}
                    />
                  </div>
                </Stack>

                <Stack gap="md">
                  <div>
                    <Text size="sm" mb="xs">
                      频率惩罚
                    </Text>
                    <Slider
                      min={-2}
                      max={2}
                      step={0.1}
                      value={formData.settings?.frequencyPenalty || 0}
                      onChange={(value) => updateSetting('frequencyPenalty', value)}
                      marks={[
                        { value: -2, label: '-2' },
                        { value: 0, label: '0' },
                        { value: 2, label: '2' },
                      ]}
                      label={(value) => value.toFixed(1)}
                    />
                  </div>

                  <div>
                    <Text size="sm" mb="xs">
                      存在惩罚
                    </Text>
                    <Slider
                      min={-2}
                      max={2}
                      step={0.1}
                      value={formData.settings?.presencePenalty || 0}
                      onChange={(value) => updateSetting('presencePenalty', value)}
                      marks={[
                        { value: -2, label: '-2' },
                        { value: 0, label: '0' },
                        { value: 2, label: '2' },
                      ]}
                      label={(value) => value.toFixed(1)}
                    />
                  </div>
                </Stack>
              </Group>

              <Textarea
                label="提示词模板"
                placeholder="自定义提示词模板 (可选)..."
                value={formData.settings?.promptTemplate || ''}
                onChange={(e) => updateSetting('promptTemplate', e.currentTarget.value)}
                minRows={4}
              />

              <Textarea
                label="越狱提示词"
                placeholder="越狱提示词 (可选)..."
                value={formData.settings?.jailbreakPrompt || ''}
                onChange={(e) => updateSetting('jailbreakPrompt', e.currentTarget.value)}
                minRows={4}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Form Actions */}
        <Group justify="flex-end" mt="xl" pt="md" style={{ borderTop: '1px solid rgb(55, 65, 81)' }}>
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            leftSection={!isLoading && <IconDeviceFloppy size={16} />}
            variant="gradient"
            gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
          >
            {editingCharacter ? '更新角色' : '创建角色'}
          </Button>
        </Group>
      </form>
    </Modal>
  )
}