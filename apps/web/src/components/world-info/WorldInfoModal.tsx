/**
 * World Information creation/editing modal
 */

import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, Globe, Users, Key, Hash } from 'lucide-react'
import { WorldInfo, Character } from '@sillytavern-clone/shared'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

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
          description: editingWorldInfo.description,
          isGlobal: editingWorldInfo.isGlobal,
          isActive: editingWorldInfo.isActive,
        })
        setSelectedCharacterIds(editingWorldInfo.characterIds || [])
        setEntries(editingWorldInfo.entries.length > 0 ? editingWorldInfo.entries : [createNewEntry()])
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto tavern-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            {editingWorldInfo ? '编辑世界信息' : '创建世界信息'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="entries">条目管理</TabsTrigger>
              <TabsTrigger value="settings">高级设置</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                    名称 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如: 魔法世界的设定"
                    className="tavern-input"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                    描述
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述这个世界信息的用途和内容..."
                    className="tavern-input min-h-[100px]"
                    maxLength={500}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isGlobal"
                    checked={formData.isGlobal}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGlobal: !!checked }))}
                  />
                  <Label htmlFor="isGlobal" className="text-sm text-gray-300">
                    全局世界信息（适用于所有角色）
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                  />
                  <Label htmlFor="isActive" className="text-sm text-gray-300">
                    启用这个世界信息
                  </Label>
                </div>
              </div>

              {/* Character Selection */}
              {!formData.isGlobal && (
                <div>
                  <Label className="text-sm font-medium text-gray-300">关联角色</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {characters.length === 0 ? (
                      <p className="text-sm text-gray-500">还没有创建任何角色</p>
                    ) : (
                      characters.map((character) => (
                        <div key={character.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`character-${character.id}`}
                            checked={selectedCharacterIds.includes(character.id)}
                            onCheckedChange={() => toggleCharacterSelection(character.id)}
                          />
                          <Label
                            htmlFor={`character-${character.id}`}
                            className="text-sm text-gray-300 cursor-pointer flex-1"
                          >
                            {character.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    选择可以使用这个世界信息的角色，留空则适用于所有角色
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Entries Management */}
            <TabsContent value="entries" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-300">世界信息条目</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEntry}
                  className="tavern-button-secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加条目
                </Button>
              </div>

              <div className="space-y-6">
                {entries.map((entry, entryIndex) => (
                  <div key={entryIndex} className="border border-gray-700 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-300">条目 {entryIndex + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={entry.enabled}
                          onCheckedChange={(checked) => updateEntry(entryIndex, { enabled: !!checked })}
                        />
                        <Label className="text-xs text-gray-400">启用</Label>
                        {entries.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(entryIndex)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Keywords */}
                      <div>
                        <Label className="text-sm font-medium text-gray-300">触发关键词</Label>
                        <div className="space-y-2 mt-2">
                          {entry.keywords.map((keyword, keywordIndex) => (
                            <div key={keywordIndex} className="flex space-x-2">
                              <Input
                                value={keyword}
                                onChange={(e) => updateKeyword(entryIndex, keywordIndex, e.target.value)}
                                placeholder="关键词..."
                                className="tavern-input flex-1"
                              />
                              {entry.keywords.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeKeyword(entryIndex, keywordIndex)}
                                  className="tavern-button-secondary"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addKeyword(entryIndex)}
                            className="tavern-button-secondary"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            添加关键词
                          </Button>
                        </div>
                      </div>

                      {/* Category and Priority */}
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`category-${entryIndex}`} className="text-sm font-medium text-gray-300">
                            分类 (可选)
                          </Label>
                          <Input
                            id={`category-${entryIndex}`}
                            value={entry.category || ''}
                            onChange={(e) => updateEntry(entryIndex, { category: e.target.value })}
                            placeholder="例如: 人物、地点、魔法..."
                            className="tavern-input"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`priority-${entryIndex}`} className="text-sm font-medium text-gray-300">
                            优先级: {entry.priority}
                          </Label>
                          <input
                            type="range"
                            id={`priority-${entryIndex}`}
                            min="0"
                            max="100"
                            value={entry.priority}
                            onChange={(e) => updateEntry(entryIndex, { priority: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-1"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>低</span>
                            <span>高</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <Label htmlFor={`content-${entryIndex}`} className="text-sm font-medium text-gray-300">
                        内容 <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`content-${entryIndex}`}
                        value={entry.content}
                        onChange={(e) => updateEntry(entryIndex, { content: e.target.value })}
                        placeholder="输入世界信息内容，当触发关键词出现时会将这些信息提供给AI..."
                        className="tavern-input min-h-[120px]"
                        required
                      />
                    </div>

                    {/* Advanced Options */}
                    <div className="border-t border-gray-700 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={entry.caseSensitive}
                              onCheckedChange={(checked) => updateEntry(entryIndex, { caseSensitive: !!checked })}
                            />
                            <Label className="text-sm text-gray-400">区分大小写</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={entry.matchWholeWords}
                              onCheckedChange={(checked) => updateEntry(entryIndex, { matchWholeWords: !!checked })}
                            />
                            <Label className="text-sm text-gray-400">匹配完整单词</Label>
                          </div>
                        </div>

                        {/* Activation Keys */}
                        <div>
                          <Label className="text-sm font-medium text-gray-300">激活密钥 (可选)</Label>
                          <div className="space-y-2 mt-2">
                            {entry.activationKeys.map((key, keyIndex) => (
                              <div key={keyIndex} className="flex space-x-2">
                                <Input
                                  value={key}
                                  onChange={(e) => updateActivationKey(entryIndex, keyIndex, e.target.value)}
                                  placeholder="激活密钥..."
                                  className="tavern-input flex-1"
                                />
                                {entry.activationKeys.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeActivationKey(entryIndex, keyIndex)}
                                    className="tavern-button-secondary"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addActivationKey(entryIndex)}
                              className="tavern-button-secondary"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              添加激活密钥
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            只有当激活密钥也出现在对话中时，这个条目才会被触发
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="settings" className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-gray-100 mb-4">使用说明</h3>
                <div className="space-y-4 text-sm text-gray-300">
                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">关键词匹配</h4>
                    <p>当用户消息中包含设置的关键词时，对应的世界信息条目会被自动激活并添加到AI的上下文中。</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">优先级</h4>
                    <p>优先级高的条目会优先被激活，数值范围为0-100，数字越大优先级越高。</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">激活密钥</h4>
                    <p>可选的额外条件，只有当关键词和激活密钥同时出现在对话中时，条目才会被激活。</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">全局 vs 角色专用</h4>
                    <p>全局世界信息适用于所有角色，角色专用的世界信息只在关联角色的对话中使用。</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">性能提示</h4>
                    <p>过多的世界信息条目可能会影响响应速度，建议定期清理不常用的条目。</p>
                  </div>
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
              {isLoading ? '保存中...' : (editingWorldInfo ? '更新世界信息' : '创建世界信息')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}