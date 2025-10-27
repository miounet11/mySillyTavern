"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  X,
  GitBranch,
  Edit,
  Trash2,
  MoreVertical,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

interface ChatBranchNode {
  id: string
  parentId: string | null
  content: string
  role: 'user' | 'assistant'
  children: string[]
  isCurrent: boolean
  timestamp: string
}

interface ChatBranchVisualizationProps {
  isOpen: boolean
  onClose: () => void
  onSelectNode?: (nodeId: string) => void
  onEditNode?: (nodeId: string) => void
  onDeleteNode?: (nodeId: string) => void
}

// Mock data for demonstration
const MOCK_TREE: ChatBranchNode[] = [
  {
    id: 'root',
    parentId: null,
    content: '开始对话',
    role: 'user',
    children: ['1_path_1', '1_path_2'],
    isCurrent: false,
    timestamp: '2024-01-01T10:00:00Z'
  },
  {
    id: '1_path_1',
    parentId: 'root',
    content: '分支1：你好！',
    role: 'user',
    children: ['2_path_1a'],
    isCurrent: false,
    timestamp: '2024-01-01T10:01:00Z'
  },
  {
    id: '1_path_2',
    parentId: 'root',
    content: '分支2：早上好！',
    role: 'user',
    children: ['2_path_2a', '2_path_2b'],
    isCurrent: true,
    timestamp: '2024-01-01T10:01:30Z'
  },
  {
    id: '2_path_1a',
    parentId: '1_path_1',
    content: '你好！很高兴见到你。',
    role: 'assistant',
    children: [],
    isCurrent: false,
    timestamp: '2024-01-01T10:02:00Z'
  },
  {
    id: '2_path_2a',
    parentId: '1_path_2',
    content: '早上好！今天过得怎么样？',
    role: 'assistant',
    children: [],
    isCurrent: false,
    timestamp: '2024-01-01T10:02:30Z'
  },
  {
    id: '2_path_2b',
    parentId: '1_path_2',
    content: '早上好！需要我帮你什么吗？',
    role: 'assistant',
    children: [],
    isCurrent: true,
    timestamp: '2024-01-01T10:03:00Z'
  },
]

export default function ChatBranchVisualization({
  isOpen,
  onClose,
  onSelectNode,
  onEditNode,
  onDeleteNode
}: ChatBranchVisualizationProps) {
  const [nodes] = useState<ChatBranchNode[]>(MOCK_TREE)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', '1_path_1', '1_path_2']))
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  if (!isOpen) return null

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleSelectNode = (nodeId: string) => {
    setSelectedNode(nodeId)
    onSelectNode?.(nodeId)
  }

  const renderNode = (node: ChatBranchNode, level: number = 0): React.ReactNode => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNode === node.id

    return (
      <div key={node.id} className="relative">
        {/* Node */}
        <div
          className={`flex items-start gap-2 mb-2 transition-all ${
            level > 0 ? `ml-${Math.min(level * 8, 32)}` : ''
          }`}
          style={{ marginLeft: `${level * 2}rem` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="mt-2 p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Node Card */}
          <div
            className={`flex-1 rounded-lg border-2 transition-all cursor-pointer ${
              node.isCurrent
                ? 'border-teal-500 bg-teal-500/10'
                : isSelected
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => handleSelectNode(node.id)}
          >
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      node.role === 'user'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {node.role === 'user' ? '用户' : 'AI'}
                  </span>
                  {node.isCurrent && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      当前
                    </span>
                  )}
                  {hasChildren && (
                    <span className="text-xs text-gray-500">
                      {node.children.length} 分支
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditNode?.(node.id)
                    }}
                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-teal-400 transition-colors"
                    title="编辑节点"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  {node.id !== 'root' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('确定要删除此节点及其所有子节点吗？')) {
                          onDeleteNode?.(node.id)
                        }
                      }}
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                      title="删除节点"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-300 line-clamp-2">
                {node.content}
              </p>

              <div className="text-xs text-gray-500 mt-2">
                {new Date(node.timestamp).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-gray-700"
              style={{ left: `${(level + 1) * 2 + 0.5}rem` }}
            />
            
            {node.children.map((childId) => {
              const childNode = nodes.find(n => n.id === childId)
              return childNode ? renderNode(childNode, level + 1) : null
            })}
          </div>
        )}
      </div>
    )
  }

  const rootNode = nodes.find(n => n.id === 'root')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[85vh] bg-gray-900/95 backdrop-blur-xl rounded-lg border border-gray-700/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-100">剧情分支管理</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Tree View */}
          <div className="flex-1 overflow-y-auto p-6 tavern-scrollbar">
            <div className="max-w-4xl">
              <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
                <p className="mb-1">💡 <strong>提示：</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>点击节点可查看详情</li>
                  <li>使用折叠按钮展开或收起分支</li>
                  <li>当前分支以青色高亮显示</li>
                  <li>悬停节点可显示编辑和删除按钮</li>
                </ul>
              </div>

              {rootNode ? (
                renderNode(rootNode)
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>暂无对话分支</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel - Node Details */}
          {selectedNode && (
            <div className="w-80 border-l border-gray-800 p-6 overflow-y-auto tavern-scrollbar">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">节点详情</h3>
              
              {(() => {
                const node = nodes.find(n => n.id === selectedNode)
                if (!node) return null

                return (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">ID</label>
                      <p className="text-sm text-gray-300 font-mono">{node.id}</p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">角色</label>
                      <p className="text-sm text-gray-300">
                        {node.role === 'user' ? '用户' : 'AI 助手'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">内容</label>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {node.content}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">子分支数</label>
                      <p className="text-sm text-gray-300">{node.children.length}</p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">时间戳</label>
                      <p className="text-sm text-gray-300">
                        {new Date(node.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button
                        onClick={() => onSelectNode?.(node.id)}
                        className="w-full tavern-button"
                      >
                        跳转到此节点
                      </Button>
                      <Button
                        onClick={() => onEditNode?.(node.id)}
                        variant="outline"
                        className="w-full tavern-button-secondary"
                      >
                        编辑节点
                      </Button>
                      {node.id !== 'root' && (
                        <Button
                          onClick={() => {
                            if (confirm('确定要删除此节点及其所有子节点吗？')) {
                              onDeleteNode?.(node.id)
                            }
                          }}
                          variant="outline"
                          className="w-full tavern-button-danger"
                        >
                          删除节点
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

