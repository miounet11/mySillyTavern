/**
 * Character creation/editing modal
 */

import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Save, Plus, Trash2 } from 'lucide-react'
import { Character, CreateCharacterParams } from '@sillytavern-clone/shared'
import { useCharacterStore } from '@/stores/characterStore'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    setFormData(prev => ({
      ...prev,
      exampleMessages: [...(prev.exampleMessages || []), '']
    }))
  }

  const updateExampleMessage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      exampleMessages: prev.exampleMessages?.map((msg, i) => i === index ? value : msg) || []
    }))
  }

  const removeExampleMessage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exampleMessages: prev.exampleMessages?.filter((_, i) => i !== index) || []
    }))
  }

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const updateSetting = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto tavern-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            {editingCharacter ? '编辑角色' : '创建新角色'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="personality">个性设定</TabsTrigger>
              <TabsTrigger value="examples">示例对话</TabsTrigger>
              <TabsTrigger value="settings">高级设置</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">角色头像</Label>
                  <div className="flex items-center space-x-4">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          className="tavern-button-secondary"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          上传图片
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        或使用图片URL
                      </div>
                    </div>
                  </div>
                  <Input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarPreview}
                    onChange={(e) => handleAvatarUrl(e.target.value)}
                    className="tavern-input"
                  />
                </div>

                {/* Basic Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                      角色名称 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="输入角色名称"
                      className="tavern-input"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                      角色描述
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="简要描述这个角色..."
                      className="tavern-input min-h-[80px]"
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <Label htmlFor="firstMessage" className="text-sm font-medium text-gray-300">
                      第一条消息 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="firstMessage"
                      value={formData.firstMessage}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstMessage: e.target.value }))}
                      placeholder="角色的开场白或问候语..."
                      className="tavern-input min-h-[100px]"
                      maxLength={500}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm font-medium text-gray-300">标签</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {formData.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-400 hover:text-gray-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="添加标签..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="tavern-input flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    className="tavern-button-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Personality Settings */}
            <TabsContent value="personality" className="space-y-4">
              <div>
                <Label htmlFor="personality" className="text-sm font-medium text-gray-300">
                  个性描述
                </Label>
                <Textarea
                  id="personality"
                  value={formData.personality}
                  onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                  placeholder="详细描述角色的性格特点、说话方式、行为模式等..."
                  className="tavern-input min-h-[150px]"
                  maxLength={1000}
                />
              </div>

              <div>
                <Label htmlFor="background" className="text-sm font-medium text-gray-300">
                  背景故事
                </Label>
                <Textarea
                  id="background"
                  value={formData.background}
                  onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                  placeholder="角色的背景故事、经历、世界观等..."
                  className="tavern-input min-h-[150px]"
                  maxLength={2000}
                />
              </div>
            </TabsContent>

            {/* Example Messages */}
            <TabsContent value="examples" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-300">示例对话</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExampleMessage}
                  className="tavern-button-secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加示例
                </Button>
              </div>

              <div className="space-y-3">
                {formData.exampleMessages?.map((message, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-400">示例 {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExampleMessage(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={message}
                      onChange={(e) => updateExampleMessage(index, e.target.value)}
                      placeholder={`示例对话 ${index + 1}...`}
                      className="tavern-input min-h-[80px]"
                      maxLength={1000}
                    />
                  </div>
                ))}

                {(!formData.exampleMessages || formData.exampleMessages.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>还没有示例对话</p>
                    <p className="text-sm">添加示例对话可以帮助AI更好地理解角色</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="temperature" className="text-sm font-medium text-gray-300">
                      创造性 (Temperature): {formData.settings?.temperature}
                    </Label>
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.settings?.temperature || 0.7}
                      onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>保守</span>
                      <span>创新</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxTokens" className="text-sm font-medium text-gray-300">
                      最大令牌数 (Max Tokens)
                    </Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="1"
                      max="4000"
                      value={formData.settings?.maxTokens || 2048}
                      onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                      className="tavern-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="topP" className="text-sm font-medium text-gray-300">
                      Top P: {formData.settings?.topP}
                    </Label>
                    <input
                      type="range"
                      id="topP"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.settings?.topP || 0.9}
                      onChange={(e) => updateSetting('topP', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="frequencyPenalty" className="text-sm font-medium text-gray-300">
                      频率惩罚: {formData.settings?.frequencyPenalty}
                    </Label>
                    <input
                      type="range"
                      id="frequencyPenalty"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={formData.settings?.frequencyPenalty || 0}
                      onChange={(e) => updateSetting('frequencyPenalty', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="presencePenalty" className="text-sm font-medium text-gray-300">
                      存在惩罚: {formData.settings?.presencePenalty}
                    </Label>
                    <input
                      type="range"
                      id="presencePenalty"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={formData.settings?.presencePenalty || 0}
                      onChange={(e) => updateSetting('presencePenalty', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="promptTemplate" className="text-sm font-medium text-gray-300">
                    提示词模板
                  </Label>
                  <Textarea
                    id="promptTemplate"
                    value={formData.settings?.promptTemplate || ''}
                    onChange={(e) => updateSetting('promptTemplate', e.target.value)}
                    placeholder="自定义提示词模板 (可选)..."
                    className="tavern-input min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="jailbreakPrompt" className="text-sm font-medium text-gray-300">
                    越狱提示词
                  </Label>
                  <Textarea
                    id="jailbreakPrompt"
                    value={formData.settings?.jailbreakPrompt || ''}
                    onChange={(e) => updateSetting('jailbreakPrompt', e.target.value)}
                    placeholder="越狱提示词 (可选)..."
                    className="tavern-input min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="tavern-button-secondary"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="tavern-button"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? '保存中...' : (editingCharacter ? '更新角色' : '创建角色')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}