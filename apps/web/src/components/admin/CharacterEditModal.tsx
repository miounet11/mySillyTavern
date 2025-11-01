'use client'

import { useState, useEffect } from 'react'
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
  Image as MantineImage,
  Alert,
  ActionIcon,
  Select,
  MultiSelect,
  Loader
} from '@mantine/core'
import {
  IconX,
  IconDeviceFloppy,
  IconPhoto,
  IconUpload,
  IconSparkles,
  IconPlus,
  IconTrash,
  IconAlertCircle
} from '@tabler/icons-react'
import toast from 'react-hot-toast'

interface CharacterEditModalProps {
  isOpen: boolean
  onClose: () => void
  character: any | null
  onSaved?: () => void
}

export default function CharacterEditModal({
  isOpen,
  onClose,
  character,
  onSaved
}: CharacterEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    author: '',
    category: '',
    tags: [] as string[],
    avatar: '',
    personality: '',
    scenario: '',
    firstMessage: '',
    exampleMessages: '',
    systemPrompt: '',
    creatorNotes: '',
    alternateGreetings: [] as string[],
    characterVersion: '1.0.0'
  })

  // 图片相关状态
  const [avatarUrl, setAvatarUrl] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newGreeting, setNewGreeting] = useState('')

  const isEditable = character?.type === 'community'

  // 加载角色数据
  useEffect(() => {
    if (isOpen && character) {
      setFormData({
        name: character.name || '',
        description: character.description || '',
        author: character.author || '',
        category: character.category || '',
        tags: character.tags || [],
        avatar: character.avatar || '',
        personality: character.personality || '',
        scenario: character.scenario || '',
        firstMessage: character.firstMessage || character.first_mes || '',
        exampleMessages: character.exampleMessages || character.mes_example || '',
        systemPrompt: character.systemPrompt || character.system_prompt || '',
        creatorNotes: character.creatorNotes || character.creator_notes || '',
        alternateGreetings: character.alternateGreetings || character.alternate_greetings || [],
        characterVersion: character.characterVersion || character.character_version || '1.0.0'
      })
      setAvatarUrl(character.avatar || '')
    }
  }, [isOpen, character])

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      author: '',
      category: '',
      tags: [],
      avatar: '',
      personality: '',
      scenario: '',
      firstMessage: '',
      exampleMessages: '',
      systemPrompt: '',
      creatorNotes: '',
      alternateGreetings: [],
      characterVersion: '1.0.0'
    })
    setAvatarUrl('')
    setImagePrompt('')
    setNewTag('')
    setNewGreeting('')
  }

  // URL方式设置头像
  const handleUrlChange = (url: string) => {
    setAvatarUrl(url)
    setFormData(prev => ({ ...prev, avatar: url }))
  }

  // 文件上传
  const handleFileUpload = async (file: File | null) => {
    if (!file) return

    setIsUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('uploadedBy', 'admin')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()
      if (data.url) {
        setAvatarUrl(data.url)
        setFormData(prev => ({ ...prev, avatar: data.url }))
        toast.success('图片上传成功！')
      } else {
        toast.error(data.error || '上传失败')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('上传失败')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // AI生成图片
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('请输入图片描述')
      return
    }

    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/admin/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          characterName: formData.name
        })
      })

      const data = await response.json()
      if (data.success && data.url) {
        setAvatarUrl(data.url)
        setFormData(prev => ({ ...prev, avatar: data.url }))
        toast.success('图片生成成功！')
      } else {
        toast.error(data.error || '生成失败')
      }
    } catch (error) {
      console.error('Generate image error:', error)
      toast.error('生成失败')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 添加备用问候语
  const handleAddGreeting = () => {
    if (newGreeting.trim()) {
      setFormData(prev => ({
        ...prev,
        alternateGreetings: [...prev.alternateGreetings, newGreeting.trim()]
      }))
      setNewGreeting('')
    }
  }

  // 移除备用问候语
  const handleRemoveGreeting = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alternateGreetings: prev.alternateGreetings.filter((_, i) => i !== index)
    }))
  }

  // 表单验证
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('角色名称不能为空')
      return false
    }
    if (!formData.description.trim()) {
      toast.error('角色描述不能为空')
      return false
    }
    if (!formData.firstMessage.trim()) {
      toast.error('首条消息不能为空')
      return false
    }
    return true
  }

  // 保存角色
  const handleSave = async () => {
    if (!isEditable) {
      toast.error('用户角色不可编辑')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success('保存成功！')
        onSaved?.()
        onClose()
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text size="lg" fw={600}>
            {isEditable ? '编辑角色' : '查看角色详情'}
          </Text>
          {!isEditable && (
            <Badge color="blue" variant="light">
              只读模式
            </Badge>
          )}
        </Group>
      }
      size="xl"
      styles={{
        content: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(12px)',
        },
        header: {
          backgroundColor: 'transparent',
        },
        body: {
          maxHeight: '80vh',
          overflowY: 'auto',
        }
      }}
    >
      {!isEditable && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="blue"
          mb="md"
        >
          用户私有角色仅供查看，不可编辑
        </Alert>
      )}

      <Tabs defaultValue="basic" variant="pills">
        <Tabs.List mb="md">
          <Tabs.Tab value="basic">基础信息</Tabs.Tab>
          <Tabs.Tab value="advanced">高级参数</Tabs.Tab>
          <Tabs.Tab value="avatar">封面图</Tabs.Tab>
        </Tabs.List>

        {/* 基础信息标签页 */}
        <Tabs.Panel value="basic">
          <Stack gap="md">
            <TextInput
              label="角色名称"
              placeholder="输入角色名称"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={!isEditable}
            />

            <Textarea
              label="角色描述"
              placeholder="简要描述这个角色"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              minRows={3}
              required
              disabled={!isEditable}
            />

            <TextInput
              label="作者"
              placeholder="角色创作者名称"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              disabled={!isEditable}
            />

            <Select
              label="分类"
              placeholder="选择分类"
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value || '' }))}
              data={[
                { value: 'cards', label: '角色卡' },
                { value: 'scenarios', label: '场景' },
                { value: 'other', label: '其他' }
              ]}
              disabled={!isEditable}
            />

            <div>
              <Text size="sm" fw={500} mb="xs">
                标签
              </Text>
              <Group gap="xs" mb="xs">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="light"
                    color="cyan"
                    pr={isEditable ? 3 : undefined}
                    rightSection={
                      isEditable ? (
                        <ActionIcon
                          size="xs"
                          color="red"
                          variant="transparent"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <IconX size={10} />
                        </ActionIcon>
                      ) : undefined
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </Group>
              {isEditable && (
                <Group gap="xs">
                  <TextInput
                    placeholder="添加标签"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    style={{ flex: 1 }}
                  />
                  <Button
                    size="sm"
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddTag}
                  >
                    添加
                  </Button>
                </Group>
              )}
            </div>

            <Textarea
              label="性格特点"
              placeholder="描述角色的性格特征"
              value={formData.personality}
              onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
              minRows={3}
              disabled={!isEditable}
            />

            <Textarea
              label="场景设定"
              placeholder="描述角色所处的场景背景"
              value={formData.scenario}
              onChange={(e) => setFormData(prev => ({ ...prev, scenario: e.target.value }))}
              minRows={3}
              disabled={!isEditable}
            />

            <Textarea
              label="首条消息"
              placeholder="角色的第一句话"
              value={formData.firstMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, firstMessage: e.target.value }))}
              minRows={3}
              required
              disabled={!isEditable}
            />

            <Textarea
              label="示例对话"
              placeholder="角色的对话示例"
              value={formData.exampleMessages}
              onChange={(e) => setFormData(prev => ({ ...prev, exampleMessages: e.target.value }))}
              minRows={5}
              disabled={!isEditable}
            />
          </Stack>
        </Tabs.Panel>

        {/* 高级参数标签页 */}
        <Tabs.Panel value="advanced">
          <Stack gap="md">
            <Textarea
              label="系统提示词"
              placeholder="为AI提供的系统级提示"
              value={formData.systemPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
              minRows={4}
              disabled={!isEditable}
            />

            <Textarea
              label="创作者备注"
              placeholder="关于这个角色的额外说明"
              value={formData.creatorNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, creatorNotes: e.target.value }))}
              minRows={3}
              disabled={!isEditable}
            />

            <TextInput
              label="角色版本"
              placeholder="1.0.0"
              value={formData.characterVersion}
              onChange={(e) => setFormData(prev => ({ ...prev, characterVersion: e.target.value }))}
              disabled={!isEditable}
            />

            <div>
              <Text size="sm" fw={500} mb="xs">
                备用问候语
              </Text>
              <Stack gap="xs">
                {formData.alternateGreetings.map((greeting, index) => (
                  <Group key={index} gap="xs" align="flex-start">
                    <Textarea
                      value={greeting}
                      readOnly
                      minRows={2}
                      style={{ flex: 1 }}
                      disabled={!isEditable}
                    />
                    {isEditable && (
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleRemoveGreeting(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                ))}
              </Stack>
              {isEditable && (
                <Group gap="xs" mt="xs">
                  <Textarea
                    placeholder="添加备用问候语"
                    value={newGreeting}
                    onChange={(e) => setNewGreeting(e.target.value)}
                    minRows={2}
                    style={{ flex: 1 }}
                  />
                  <Button
                    size="sm"
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddGreeting}
                  >
                    添加
                  </Button>
                </Group>
              )}
            </div>
          </Stack>
        </Tabs.Panel>

        {/* 封面图标签页 */}
        <Tabs.Panel value="avatar">
          <Stack gap="md">
            {avatarUrl && (
              <div style={{ textAlign: 'center' }}>
                <Text size="sm" c="dimmed" mb="xs">
                  当前封面
                </Text>
                <MantineImage
                  src={avatarUrl}
                  alt="角色封面"
                  w={300}
                  h={300}
                  fit="cover"
                  radius="md"
                  style={{ margin: '0 auto' }}
                />
              </div>
            )}

            {isEditable && (
              <Tabs defaultValue="url" variant="pills">
                <Tabs.List>
                  <Tabs.Tab value="url" leftSection={<IconPhoto size={16} />}>
                    URL 输入
                  </Tabs.Tab>
                  <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
                    本地上传
                  </Tabs.Tab>
                  <Tabs.Tab value="generate" leftSection={<IconSparkles size={16} />}>
                    AI 生成
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="url" pt="md">
                  <TextInput
                    label="图片URL"
                    placeholder="https://example.com/image.jpg"
                    value={avatarUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="upload" pt="md">
                  <FileButton
                    accept="image/*"
                    onChange={handleFileUpload}
                  >
                    {(props) => (
                      <Button
                        {...props}
                        fullWidth
                        leftSection={<IconUpload size={16} />}
                        loading={isUploadingImage}
                      >
                        选择图片文件
                      </Button>
                    )}
                  </FileButton>
                </Tabs.Panel>

                <Tabs.Panel value="generate" pt="md">
                  <Stack gap="sm">
                    <Textarea
                      label="图片描述（Prompt）"
                      placeholder="描述角色的外观、服装、风格、场景等..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      minRows={4}
                    />
                    <Button
                      onClick={handleGenerateImage}
                      loading={isGeneratingImage}
                      leftSection={<IconSparkles size={16} />}
                      fullWidth
                    >
                      生成图片
                    </Button>
                    <Alert color="blue" icon={<IconAlertCircle size={16} />}>
                      需要先在LLM配置中设置图像生成服务
                    </Alert>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" onClick={onClose}>
          {isEditable ? '取消' : '关闭'}
        </Button>
        {isEditable && (
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
            loading={isSaving}
          >
            保存更改
          </Button>
        )}
      </Group>
    </Modal>
  )
}

