"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Save } from 'lucide-react'

interface ChatNode {
  id: string
  content: string
  role: 'user' | 'assistant'
  memorySummary?: string
  timestamp: string
}

interface ChatNodeEditorProps {
  isOpen: boolean
  onClose: () => void
  nodeId: string | null
  onSave?: (nodeId: string, data: { content: string; memorySummary?: string }) => void
}

export default function ChatNodeEditor({
  isOpen,
  onClose,
  nodeId,
  onSave
}: ChatNodeEditorProps) {
  const [content, setContent] = useState('')
  const [memorySummary, setMemorySummary] = useState('')
  const [originalNode, setOriginalNode] = useState<ChatNode | null>(null)

  // Mock: Load node data
  useEffect(() => {
    if (isOpen && nodeId) {
      // In production, fetch from API
      const mockNode: ChatNode = {
        id: nodeId,
        content: '这是一条示例消息内容，可以在这里编辑。你可以修改消息的内容，以及与之关联的记忆摘要。',
        role: 'assistant',
        memorySummary: '## 记忆摘要\n\n### 关键信息\n- 用户询问了关于项目的信息\n- AI 提供了详细的解释\n- 讨论了未来的计划\n\n### 重要细节\n- 项目名称: SillyTavern\n- 开发语言: TypeScript\n- 框架: Next.js\n\n### 后续行动\n- 继续完善功能\n- 优化用户体验',
        timestamp: new Date().toISOString()
      }
      
      setOriginalNode(mockNode)
      setContent(mockNode.content)
      setMemorySummary(mockNode.memorySummary || '')
    }
  }, [isOpen, nodeId])

  const handleSave = () => {
    if (!nodeId) return

    onSave?.(nodeId, {
      content,
      memorySummary
    })

    onClose()
  }

  const handleCancel = () => {
    // Reset to original values
    if (originalNode) {
      setContent(originalNode.content)
      setMemorySummary(originalNode.memorySummary || '')
    }
    onClose()
  }

  if (!isOpen || !nodeId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[85vh] bg-gray-900/95 backdrop-blur-xl rounded-lg border border-gray-700/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">编辑节点</h2>
            <p className="text-sm text-gray-400 mt-1">节点 ID: {nodeId}</p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Memory Summary */}
          <div className="flex-1 border-r border-gray-800 p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">记忆摘要</h3>
              <p className="text-sm text-gray-400">
                编辑与此节点关联的记忆摘要，这些信息将作为上下文提供给 AI。
              </p>
            </div>

            <Textarea
              value={memorySummary}
              onChange={(e) => setMemorySummary(e.target.value)}
              className="flex-1 tavern-textarea font-mono text-sm resize-none"
              placeholder="输入记忆摘要...&#10;&#10;支持 Markdown 格式：&#10;&#10;## 章节标题&#10;### 小节标题&#10;- 列表项 1&#10;- 列表项 2&#10;&#10;**加粗文本**&#10;*斜体文本*"
            />

            <div className="mt-4 text-xs text-gray-500">
              <p>💡 提示：使用 Markdown 格式组织记忆摘要</p>
              <p>- 使用 ## 和 ### 创建章节</p>
              <p>- 使用 - 或 * 创建列表</p>
              <p>- 使用 **文本** 加粗，*文本* 斜体</p>
            </div>
          </div>

          {/* Right Panel - Message Content */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">回复内容</h3>
              <p className="text-sm text-gray-400">
                查看和编辑此节点的完整消息内容。
              </p>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 tavern-textarea resize-none"
              placeholder="输入消息内容..."
            />

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div>
                <p>字符数: {content.length}</p>
                {originalNode && (
                  <p className="mt-1">
                    时间: {new Date(originalNode.timestamp).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
              
              {originalNode && (
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      originalNode.role === 'user'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {originalNode.role === 'user' ? '用户消息' : 'AI 回复'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800/50 flex justify-end gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="tavern-button-secondary"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="tavern-button gap-2"
          >
            <Save className="w-4 h-4" />
            保存更改
          </Button>
        </div>
      </div>
    </div>
  )
}

