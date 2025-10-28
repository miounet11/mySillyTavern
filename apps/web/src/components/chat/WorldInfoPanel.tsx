"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import WorldInfoTableView from './WorldInfoTableView'
import { 
  X, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  BookOpen,
  Table,
  LayoutGrid
} from 'lucide-react'
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

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[80vh] bg-gray-900/95 backdrop-blur-xl rounded-lg border border-gray-700/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-100">{t('chat.worldInfo.title')}</h2>
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
        {!isCreating ? (
          <>
            {/* Search and Add */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('chat.worldInfo.searchPlaceholder')}
                value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 tavern-input"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 flex items-center gap-2 transition-colors ${
                    viewMode === 'table'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="表格视图"
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-2 flex items-center gap-2 transition-colors ${
                    viewMode === 'card'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="卡片视图"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              
              <Button
                onClick={handleCreate}
                className="tavern-button gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('chat.worldInfo.addEntry')}
              </Button>
            </div>

            {/* Entries List/Table */}
            <div className="flex-1 overflow-y-auto tavern-scrollbar">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="mb-2">
                    {searchQuery ? t('chat.worldInfo.noMatchingEntries') : t('chat.worldInfo.noEntries')}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={handleCreate}
                      variant="outline"
                      className="tavern-button-secondary gap-2 mt-4"
                    >
                      <Plus className="w-4 h-4" />
                      {t('chat.worldInfo.createFirstEntry')}
                    </Button>
                  )}
                </div>
              ) : viewMode === 'table' ? (
                <WorldInfoTableView
                  entries={filteredEntries}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={toggleEntry}
                  onUpdate={handleUpdate}
                />
              ) : (
                <div className="space-y-2">{
                  filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-100">{entry.name}</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={entry.enabled}
                                onChange={() => toggleEntry(entry.id)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                            </label>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {entry.keywords.map((keyword, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs bg-teal-500/20 text-teal-300 border-teal-500/30"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>

                          {expandedEntries.has(entry.id) && (
                            <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">
                              {entry.content}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-1 ml-4">
                          <button
                            onClick={() => toggleExpand(entry.id)}
                            className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            {expandedEntries.has(entry.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                  </div>
                ))}
                </div>
              )}
            </div>
            </>
          ) : (
            /* Create/Edit Form */
            <div className="space-y-4">
            <div>
              <label className="tavern-label">{t('chat.worldInfo.entryName')}</label>
              <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: 魔法系统"
                  className="tavern-input"
                />
              </div>

              <div>
                <label className="tavern-label">关键词（用逗号分隔）</label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="例如: 魔法, 法术, 咒语"
                  className="tavern-input"
                />
              <p className="text-xs text-gray-500 mt-1">
                {t('chat.worldInfo.keywordsHelp')}
              </p>
              </div>

            <div>
              <label className="tavern-label">{t('chat.worldInfo.entryContent')}</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={t('chat.worldInfo.contentPlaceholder')}
                className="tavern-textarea min-h-[200px]"
              />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="tavern-label">位置</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                    className="tavern-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">插入位置 (0-100)</p>
                </div>

                <div>
                  <label className="tavern-label">深度</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.depth}
                    onChange={(e) => setFormData({ ...formData, depth: parseInt(e.target.value) || 0 })}
                    className="tavern-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">扫描深度</p>
                </div>

                <div>
                  <label className="tavern-label">优先级</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="tavern-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">数值越高越优先</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="tavern-checkbox"
                />
              <label htmlFor="enabled" className="text-sm text-gray-300 cursor-pointer">
                {t('chat.worldInfo.enableEntry')}
              </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.content}
                  className="tavern-button flex-1"
                >
                  {t('chat.worldInfo.save')}
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setEditingEntry(null)
                  }}
                  variant="outline"
                  className="tavern-button-secondary flex-1"
                >
                  {t('chat.worldInfo.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

