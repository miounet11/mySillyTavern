"use client"

import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  PanelLeftClose, 
  PanelLeftOpen,
  GitBranch, 
  FileText, 
  BookOpen,
  Settings,
  Wand2,
  Code,
  FileJson
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ChatSettingsPanelProps {
  isOpen: boolean
  onToggle: () => void
  onOpenWorldInfo: () => void
  onOpenExternalPrompts?: () => void
  onOpenTemplateVariables?: () => void
  onOpenRegexEditor?: () => void
  onOpenPresetEditor?: () => void
  onOpenBranchView?: () => void
  characterName?: string
}

export default function ChatSettingsPanel({
  isOpen,
  onToggle,
  onOpenWorldInfo,
  onOpenExternalPrompts,
  onOpenTemplateVariables,
  onOpenRegexEditor,
  onOpenPresetEditor,
  onOpenBranchView,
  characterName
}: ChatSettingsPanelProps) {
  const router = useRouter()

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-24 z-30 p-2 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all"
        title="展开侧边栏"
      >
        <PanelLeftOpen className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="w-64 h-full border-r border-gray-800/50 bg-gray-900/60 backdrop-blur-sm flex flex-col relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">对话设置</h3>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="收起侧边栏"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {characterName && (
          <div className="text-xs text-gray-500 mb-2">
            当前角色: <span className="text-teal-400">{characterName}</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <Button
          onClick={() => router.push('/characters')}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
        >
          <ArrowLeft className="w-4 h-4" />
          返回角色列表
        </Button>

        <div className="pt-4 pb-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            剧情
          </h4>
        </div>

        <Button
          onClick={onOpenBranchView}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title="管理对话分支"
        >
          <GitBranch className="w-4 h-4" />
          剧情分支管理
        </Button>

        <div className="pt-4 pb-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            设置
          </h4>
        </div>

        <Button
          onClick={onOpenExternalPrompts}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title="外部提示词"
        >
          <FileText className="w-4 h-4" />
          外部提示词
        </Button>

        <Button
          onClick={onOpenWorldInfo}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title="世界书设置"
        >
          <BookOpen className="w-4 h-4" />
          世界书
        </Button>

        <Button
          onClick={onOpenTemplateVariables}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title="模板词选择器"
        >
          <Wand2 className="w-4 h-4" />
          模板词选择
        </Button>

        <Button
          onClick={onOpenRegexEditor}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title="正则脚本编辑器"
        >
          <Code className="w-4 h-4" />
          正则脚本
        </Button>

        <Button
          onClick={onOpenPresetEditor}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title="预设编辑器"
        >
          <FileJson className="w-4 h-4" />
          预设管理
        </Button>

        <div className="pt-4 pb-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            高级
          </h4>
        </div>

        <Button
          onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title="高级设置"
        >
          <Settings className="w-4 h-4" />
          高级设置
        </Button>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>消息数:</span>
            <span className="text-gray-400">--</span>
          </div>
          <div className="flex justify-between">
            <span>Token 使用:</span>
            <span className="text-gray-400">--</span>
          </div>
        </div>
      </div>

      {/* Dialogs moved to chat/page to match World Info open behavior */}
    </div>
  )
}

