"use client"

import { useState } from 'react'
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
  ChevronDown,
  ChevronUp,
  Code,
  Upload,
  Download,
  Play
} from 'lucide-react'

interface RegexScript {
  id: string
  name: string
  enabled: boolean
  findRegex: string
  replaceWith: string
  priority: number
  scriptType: 'input' | 'output' | 'display' | 'all'
}

interface RegexScriptEditorProps {
  isOpen: boolean
  onClose: () => void
}

export default function RegexScriptEditor({
  isOpen,
  onClose
}: RegexScriptEditorProps) {
  const [scripts, setScripts] = useState<RegexScript[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingScript, setEditingScript] = useState<RegexScript | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [testInput, setTestInput] = useState('')
  const [testOutput, setTestOutput] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    findRegex: '',
    replaceWith: '',
    priority: 100,
    scriptType: 'all' as RegexScript['scriptType'],
    enabled: true
  })

  if (!isOpen) return null

  const filteredScripts = scripts
    .filter(script =>
      script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.findRegex.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const comparison = a.priority - b.priority
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleCreate = () => {
    setIsEditing(true)
    setEditingScript(null)
    setFormData({
      name: '',
      findRegex: '',
      replaceWith: '',
      priority: 100,
      scriptType: 'all',
      enabled: true
    })
    setTestInput('')
    setTestOutput('')
  }

  const handleSave = () => {
    // Validate regex
    try {
      new RegExp(formData.findRegex)
    } catch (e) {
      alert('正则表达式格式错误')
      return
    }

    const newScript: RegexScript = {
      id: editingScript?.id || Date.now().toString(),
      name: formData.name,
      enabled: formData.enabled,
      findRegex: formData.findRegex,
      replaceWith: formData.replaceWith,
      priority: formData.priority,
      scriptType: formData.scriptType
    }

    if (editingScript) {
      setScripts(scripts.map(s => s.id === editingScript.id ? newScript : s))
    } else {
      setScripts([...scripts, newScript])
    }

    setIsEditing(false)
    setEditingScript(null)
  }

  const handleEdit = (script: RegexScript) => {
    setEditingScript(script)
    setIsEditing(true)
    setFormData({
      name: script.name,
      findRegex: script.findRegex,
      replaceWith: script.replaceWith,
      priority: script.priority,
      scriptType: script.scriptType,
      enabled: script.enabled
    })
    setTestInput('')
    setTestOutput('')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个脚本吗？')) {
      setScripts(scripts.filter(s => s.id !== id))
    }
  }

  const toggleScript = (id: string) => {
    setScripts(scripts.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const handleTest = () => {
    if (!formData.findRegex) {
      setTestOutput('请输入正则表达式')
      return
    }

    try {
      const regex = new RegExp(formData.findRegex, 'g')
      const result = testInput.replace(regex, formData.replaceWith)
      setTestOutput(result)
    } catch (e) {
      setTestOutput(`错误: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(scripts, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'regex-scripts.json'
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
          setScripts([...scripts, ...imported])
          alert('导入成功')
        }
      } catch (error) {
        alert('导入失败：文件格式错误')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[85vh] bg-gray-900/95 backdrop-blur-xl rounded-lg border border-gray-700/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-100">正则脚本编辑器</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex p-6 gap-6">
          {!isEditing ? (
            <>
              {/* Scripts List */}
              <div className="flex-1 flex flex-col">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索脚本..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 tavern-input"
                    />
                  </div>

                  <Button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    variant="outline"
                    className="tavern-button-secondary gap-2"
                  >
                    优先级 {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  <label htmlFor="import-script">
                    <Button
                      type="button"
                      variant="outline"
                      className="tavern-button-secondary gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      导入
                    </Button>
                    <input
                      id="import-script"
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>

                  <Button
                    onClick={handleExport}
                    disabled={scripts.length === 0}
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
                    添加脚本
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 tavern-scrollbar">
                  {filteredScripts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Code className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="mb-2">
                        {searchQuery ? '未找到匹配的脚本' : '还没有正则脚本'}
                      </p>
                      {!searchQuery && (
                        <Button
                          onClick={handleCreate}
                          variant="outline"
                          className="tavern-button-secondary gap-2 mt-4"
                        >
                          <Plus className="w-4 h-4" />
                          创建第一个脚本
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredScripts.map((script) => (
                      <div
                        key={script.id}
                        className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={script.enabled}
                                  onChange={() => toggleScript(script.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                              </label>
                              <h3 className="font-semibold text-gray-100">{script.name}</h3>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gray-700/50 text-gray-300"
                              >
                                {script.scriptType}
                              </Badge>
                            </div>

                            <div className="space-y-1 mb-2">
                              <div className="flex items-start gap-2">
                                <span className="text-xs text-gray-500 min-w-[60px]">查找:</span>
                                <code className="text-xs text-orange-300 bg-gray-900/50 px-2 py-0.5 rounded flex-1 break-all">
                                  {script.findRegex}
                                </code>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs text-gray-500 min-w-[60px]">替换:</span>
                                <code className="text-xs text-teal-300 bg-gray-900/50 px-2 py-0.5 rounded flex-1 break-all">
                                  {script.replaceWith}
                                </code>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>优先级: {script.priority}</span>
                            </div>
                          </div>

                          <div className="flex gap-1 ml-4">
                            <button
                              onClick={() => handleEdit(script)}
                              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(script.id)}
                              className="p-2 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Editor Form */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto tavern-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="tavern-label">脚本名称</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例如: CG描图、状态栏美化"
                      className="tavern-input"
                    />
                  </div>

                  <div>
                    <label className="tavern-label">查找（正则表达式）</label>
                    <Textarea
                      value={formData.findRegex}
                      onChange={(e) => setFormData({ ...formData, findRegex: e.target.value })}
                      placeholder="例如: /=<CG\|(\s\$)/g"
                      className="tavern-textarea min-h-[80px] font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="tavern-label">替换为</label>
                    <Textarea
                      value={formData.replaceWith}
                      onChange={(e) => setFormData({ ...formData, replaceWith: e.target.value })}
                      placeholder="例如: $1"
                      className="tavern-textarea min-h-[80px] font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="tavern-label">脚本类型</label>
                      <select
                        value={formData.scriptType}
                        onChange={(e) => setFormData({ ...formData, scriptType: e.target.value as RegexScript['scriptType'] })}
                        className="tavern-input"
                      >
                        <option value="all">全部</option>
                        <option value="input">输入</option>
                        <option value="output">输出</option>
                        <option value="display">显示</option>
                      </select>
                    </div>

                    <div>
                      <label className="tavern-label">优先级</label>
                      <Input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                        className="tavern-input"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enabled-edit"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="tavern-checkbox"
                    />
                    <label htmlFor="enabled-edit" className="text-sm text-gray-300 cursor-pointer">
                      启用此脚本
                    </label>
                  </div>

                  {/* Test Section */}
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="tavern-label mb-3">测试脚本</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">测试输入</label>
                        <Textarea
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          placeholder="输入要测试的文本..."
                          className="tavern-textarea min-h-[80px] font-mono text-sm"
                        />
                      </div>

                      <Button
                        onClick={handleTest}
                        variant="outline"
                        className="tavern-button-secondary gap-2"
                      >
                        <Play className="w-4 h-4" />
                        运行测试
                      </Button>

                      {testOutput && (
                        <div>
                          <label className="text-sm text-gray-400 mb-1 block">输出结果</label>
                          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/50 font-mono text-sm text-gray-300 whitespace-pre-wrap break-all max-h-[120px] overflow-y-auto tavern-scrollbar">
                            {testOutput}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={!formData.name || !formData.findRegex}
                      className="tavern-button flex-1"
                    >
                      保存
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false)
                        setEditingScript(null)
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

