'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Copy, 
  Check,
  Wand2,
  Tag
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TemplateVariable {
  id: string
  name: string
  variable: string
  description: string
  example: string
  category: string
}

interface TemplateVariablePickerProps {
  isOpen: boolean
  onClose: () => void
  onInsert?: (variable: string) => void
}

export default function TemplateVariablePicker({
  isOpen,
  onClose,
  onInsert,
}: TemplateVariablePickerProps) {
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchVariables()
    }
  }, [isOpen])

  const fetchVariables = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/template-variables?${params}`)
      if (!response.ok) throw new Error('Failed to fetch variables')

      const data = await response.json()
      setVariables(data.variables)
      setCategories(['all', ...data.categories])
    } catch (error) {
      console.error('Error fetching variables:', error)
      toast.error('加载模板变量失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchVariables()
    }
  }, [selectedCategory, isOpen])

  const handleCopy = (variable: TemplateVariable) => {
    navigator.clipboard.writeText(variable.variable)
    setCopiedId(variable.id)
    toast.success('已复制到剪贴板')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleInsert = (variable: TemplateVariable) => {
    if (onInsert) {
      onInsert(variable.variable)
      toast.success(`已插入 ${variable.variable}`)
    } else {
      handleCopy(variable)
    }
  }

  const filteredVariables = variables.filter(v =>
    !searchQuery ||
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      all: '全部',
      basic: '基础',
      character: '角色',
      dynamic: '动态',
      context: '上下文',
      utility: '工具'
    }
    return labels[cat] || cat
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900/95 backdrop-blur-xl rounded-lg border border-gray-700/50 flex flex-col shadow-2xl overflow-y-auto tavern-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            模板变量选择器
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            点击变量来插入到你的消息或提示词中
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索变量..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 tavern-input"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Variables List */}
        <div className="flex-1 overflow-y-auto tavern-scrollbar pr-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="mt-4 text-gray-400">加载中...</p>
            </div>
          ) : filteredVariables.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>没有找到匹配的变量</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVariables.map((variable) => (
                <div
                  key={variable.id}
                  className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono px-2 py-1 bg-gray-900 text-purple-300 rounded">
                          {variable.variable}
                        </code>
                        <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                          {getCategoryLabel(variable.category)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{variable.description}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">示例：</span>
                        <code className="ml-1 px-1.5 py-0.5 bg-gray-900 text-gray-400 rounded">
                          {variable.example}
                        </code>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => handleInsert(variable)}
                        size="sm"
                        className="tavern-button h-8"
                      >
                        插入
                      </Button>
                      <Button
                        onClick={() => handleCopy(variable)}
                        size="sm"
                        variant="outline"
                        className="tavern-button-secondary h-8 w-8 p-0"
                      >
                        {copiedId === variable.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-500">
            共 {filteredVariables.length} 个变量
          </div>
          <Button variant="ghost" onClick={onClose}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

