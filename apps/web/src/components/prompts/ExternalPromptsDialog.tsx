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
  Star, 
  Copy, 
  Check,
  FileText,
  Sparkles 
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PromptTemplate {
  id: string
  name: string
  content: string
  category: string
  description?: string
  isBuiltin: boolean
  isFavorite: boolean
  usageCount: number
}

interface ExternalPromptsDialogProps {
  isOpen: boolean
  onClose: () => void
  onApply?: (content: string) => void
}

export default function ExternalPromptsDialog({
  isOpen,
  onClose,
  onApply,
}: ExternalPromptsDialogProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('category', 'external')
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/prompt-templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('加载提示词模板失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (template: PromptTemplate) => {
    navigator.clipboard.writeText(template.content)
    setCopiedId(template.id)
    toast.success('已复制到剪贴板')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleApply = (template: PromptTemplate) => {
    if (onApply) {
      onApply(template.content)
      toast.success('提示词已应用')
      onClose()
    } else {
      handleCopy(template)
    }
  }

  const handleToggleFavorite = async (template: PromptTemplate) => {
    try {
      const response = await fetch(`/api/prompt-templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !template.isFavorite })
      })

      if (!response.ok) throw new Error('Failed to toggle favorite')

      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t
      ))

      toast.success(template.isFavorite ? '已取消收藏' : '已添加到收藏')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败')
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchTemplates()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900/95 backdrop-blur-xl rounded-lg border border-gray-700/50 flex flex-col shadow-2xl overflow-y-auto tavern-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            外部提示词库
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            选择一个提示词模板来增强AI的回复效果
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索提示词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 tavern-input"
          />
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto tavern-scrollbar pr-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="mt-4 text-gray-400">加载中...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>没有找到匹配的提示词</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        {template.name}
                        {template.isBuiltin && (
                          <span className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded">
                            官方
                          </span>
                        )}
                      </h4>
                      {template.description && (
                        <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(template)
                      }}
                      className={`ml-2 p-1.5 rounded-lg transition-colors ${
                        template.isFavorite
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-gray-500 hover:text-yellow-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${template.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {selectedTemplate?.id === template.id && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">
                        {template.content}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApply(template)
                          }}
                          className="flex-1 tavern-button"
                          size="sm"
                        >
                          应用提示词
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(template)
                          }}
                          variant="outline"
                          className="tavern-button-secondary"
                          size="sm"
                        >
                          {copiedId === template.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-500">
            共 {templates.length} 个提示词模板
          </div>
          <Button variant="ghost" onClick={onClose}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

