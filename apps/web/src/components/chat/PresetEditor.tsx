"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Upload,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Preset {
  id: string
  name: string
  enabled: boolean
  content: string
  category: string
  updatedAt: string
}

interface PresetEditorProps {
  isOpen: boolean
  onClose: () => void
}

export default function PresetEditor({
  isOpen,
  onClose
}: PresetEditorProps) {
  const router = useRouter()
  const [presets, setPresets] = useState<Preset[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'updated'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: '',
    enabled: true
  })

  if (!isOpen) return null

  const filteredPresets = presets
    .filter(preset =>
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleCreate = () => {
    setIsEditing(true)
    setEditingPreset(null)
    setFormData({
      name: '',
      content: '',
      category: '',
      enabled: true
    })
  }

  const handleSave = () => {
    const newPreset: Preset = {
      id: editingPreset?.id || Date.now().toString(),
      name: formData.name,
      enabled: formData.enabled,
      content: formData.content,
      category: formData.category,
      updatedAt: new Date().toISOString()
    }

    if (editingPreset) {
      setPresets(presets.map(p => p.id === editingPreset.id ? newPreset : p))
    } else {
      setPresets([...presets, newPreset])
    }

    setIsEditing(false)
    setEditingPreset(null)
  }

  const handleEdit = (preset: Preset) => {
    setEditingPreset(preset)
    setIsEditing(true)
    setFormData({
      name: preset.name,
      content: preset.content,
      category: preset.category,
      enabled: preset.enabled
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个预设吗？')) {
      setPresets(presets.filter(p => p.id !== id))
    }
  }

  const handleDuplicate = (preset: Preset) => {
    const newPreset: Preset = {
      ...preset,
      id: Date.now().toString(),
      name: `${preset.name} (副本)`,
      updatedAt: new Date().toISOString()
    }
    setPresets([...presets, newPreset])
  }

  const togglePreset = (id: string) => {
    setPresets(presets.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ))
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(presets, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'presets.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        if (Array.isArray(imported)) {
          setPresets([...presets, ...imported])
          alert('导入成功')
        }
      } catch (error) {
        alert('导入失败：文件格式错误')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handlePresetClick = (preset: Preset) => {
    if (confirm(`是否应用预设"${preset.name}"并进入对话？`)) {
      // Apply preset (this would typically save to settings/state)
      toast.success(`已应用预设: ${preset.name}`)
      
      // Close the preset editor
      onClose()
      
      // Navigate to chat if not already there
      if (window.location.pathname !== '/chat') {
        router.push('/chat')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[85vh] bg-gray-900/95 backdrop-blur-xl rounded-lg border border-gray-700/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-100">预设编辑器</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {!isEditing ? (
            <>
              {/* Search and Actions */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索预设..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 tavern-input"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'updated')}
                  className="tavern-input w-32"
                >
                  <option value="name">名称</option>
                  <option value="updated">更新时间</option>
                </select>

                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  className="tavern-button-secondary"
                >
                  {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                <label htmlFor="import-preset">
                  <Button
                    type="button"
                    variant="outline"
                    className="tavern-button-secondary gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    导入
                  </Button>
                  <input
                    id="import-preset"
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>

                <Button
                  onClick={handleExport}
                  disabled={presets.length === 0}
                  variant="outline"
                  className="tavern-button-secondary gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出
                </Button>

                <Button
                  onClick={handleCreate}
                  className="tavern-button gap-2"
                >
                  <Plus className="w-4 h-4" />
                  创建预设
                </Button>
              </div>

              {/* Hint */}
              {filteredPresets.length > 0 && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <p className="text-sm text-teal-300">
                    点击预设行可应用并进入对话
                  </p>
                </div>
              )}

              {/* Presets Table */}
              <div className="flex-1 overflow-y-auto tavern-scrollbar">
                {filteredPresets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="mb-2">
                      {searchQuery ? '未找到匹配的预设' : '还没有预设'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={handleCreate}
                        variant="outline"
                        className="tavern-button-secondary gap-2 mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        创建第一个预设
                      </Button>
                    )}
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase">开关</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase">状态</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase">名称</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase">分类</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase">更新时间</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPresets.map((preset) => (
                        <tr
                          key={preset.id}
                          onClick={(e) => {
                            // Don't trigger row click if clicking on buttons or toggles
                            const target = e.target as HTMLElement
                            if (!target.closest('button') && !target.closest('input[type="checkbox"]')) {
                              handlePresetClick(preset)
                            }
                          }}
                          className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer"
                        >
                          <td className="px-3 py-3">
                            <label 
                              className="relative inline-flex items-center cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={preset.enabled}
                                onChange={() => togglePreset(preset.id)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                            </label>
                          </td>

                          <td className="px-3 py-3">
                            <Badge
                              variant={preset.enabled ? "default" : "secondary"}
                              className={preset.enabled
                                ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                                : "bg-gray-700/50 text-gray-400 border-gray-600/50"
                              }
                            >
                              {preset.enabled ? '启用' : '禁用'}
                            </Badge>
                          </td>

                          <td className="px-3 py-3">
                            <div className="text-sm text-gray-200 font-medium">
                              {preset.name}
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            {preset.category && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gray-700/50 text-gray-300"
                              >
                                {preset.category}
                              </Badge>
                            )}
                          </td>

                          <td className="px-3 py-3">
                            <div className="text-sm text-gray-400">
                              {new Date(preset.updatedAt).toLocaleString('zh-CN')}
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(preset)
                                }}
                                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-teal-400 transition-colors"
                                title="编辑"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDuplicate(preset)
                                }}
                                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-400 transition-colors"
                                title="复制"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(preset.id)
                                }}
                                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            /* Edit Form */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto tavern-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="tavern-label">预设名称</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例如: 标准对话、创意写作"
                      className="tavern-input"
                    />
                  </div>

                  <div>
                    <label className="tavern-label">分类</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="例如: 对话、写作、编程"
                      className="tavern-input"
                    />
                  </div>

                  <div>
                    <label className="tavern-label">预设内容</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="输入预设的内容和参数..."
                      className="tavern-textarea min-h-[300px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enabled-preset"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="tavern-checkbox"
                    />
                    <label htmlFor="enabled-preset" className="text-sm text-gray-300 cursor-pointer">
                      启用此预设
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={!formData.name || !formData.content}
                      className="tavern-button flex-1"
                    >
                      保存
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false)
                        setEditingPreset(null)
                      }}
                      variant="outline"
                      className="tavern-button-secondary flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

