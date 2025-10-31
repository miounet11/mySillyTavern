/**
 * Chat page with settings panel
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ExternalPromptsDialog from '@/components/prompts/ExternalPromptsDialog'
import TemplateVariablePicker from '@/components/prompts/TemplateVariablePicker'
import ChatInterface from '@/components/chat/ChatInterface'
import ChatSettingsPanel from '@/components/chat/ChatSettingsPanel'
import WorldInfoPanel from '@/components/chat/WorldInfoPanel'
import RegexScriptEditor from '@/components/chat/RegexScriptEditor'
import PresetEditor from '@/components/chat/PresetEditor'
import ChatBranchVisualization from '@/components/chat/ChatBranchVisualization'
import ChatNodeEditor from '@/components/chat/ChatNodeEditor'
import { Loader2 } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsUIStore } from '@/stores/settingsUIStore'
import SettingsDrawer from '@/components/settings/SettingsDrawer'
import toast from 'react-hot-toast'

function ChatPageContent() {
  const searchParams = useSearchParams()
  const characterId = searchParams.get('characterId')
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false)  // 初始为false，根据屏幕尺寸动态设置
  const [isWorldInfoOpen, setIsWorldInfoOpen] = useState(false)
  const [isExternalPromptsOpen, setIsExternalPromptsOpen] = useState(false)
  const [isTemplateVarsOpen, setIsTemplateVarsOpen] = useState(false)
  const [isRegexEditorOpen, setIsRegexEditorOpen] = useState(false)
  const [isPresetEditorOpen, setIsPresetEditorOpen] = useState(false)
  const [isBranchViewOpen, setIsBranchViewOpen] = useState(false)
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { character } = useChatStore()
  const { isOpen: isSettingsDrawerOpen } = useSettingsUIStore()

  // Track screen size for responsive behavior
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const desktop = width >= 640 // sm breakpoint
      setIsDesktop(desktop)
      setIsMobile(width < 640)
      
      // 桌面端默认展开，移动端默认收起
      setIsSettingsPanelOpen(desktop)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 注意：全局 SettingsDrawer 已监听 open-settings 并处理模型配置，
  // 这里不再重复监听以避免重复弹出。

  const handleSelectNode = (nodeId: string) => {
    toast.success(`跳转到节点: ${nodeId}`)
    setIsBranchViewOpen(false)
  }

  const handleEditNode = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    setIsNodeEditorOpen(true)
  }

  const handleDeleteNode = (nodeId: string) => {
    toast.success(`删除节点: ${nodeId}`)
  }

  const handleSaveNode = (nodeId: string, data: any) => {
    toast.success('节点已保存')
    console.log('保存节点:', nodeId, data)
  }

  return (
    <div className="h-[calc(100vh-60px)] bg-gray-950 flex overflow-hidden">
      {/* Left Column - Chat Settings Panel (Fixed Sidebar) */}
      {isDesktop && (
        <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          isSettingsPanelOpen ? 'w-[260px]' : 'w-0'
        } overflow-hidden`}>
          <ChatSettingsPanel
            isOpen={isSettingsPanelOpen}
            onToggle={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
            onOpenWorldInfo={() => setIsWorldInfoOpen(true)}
            onOpenExternalPrompts={() => setIsExternalPromptsOpen(true)}
            onOpenTemplateVariables={() => setIsTemplateVarsOpen(true)}
            onOpenRegexEditor={() => setIsRegexEditorOpen(true)}
            onOpenPresetEditor={() => setIsPresetEditorOpen(true)}
            onOpenBranchView={() => setIsBranchViewOpen(true)}
            characterName={character?.name}
            isMobile={isMobile}
            isDesktop={isDesktop}
          />
        </div>
      )}

      {/* Mobile: Chat Settings Panel as Drawer */}
      {!isDesktop && (
        <ChatSettingsPanel
          isOpen={isSettingsPanelOpen}
          onToggle={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
          onOpenWorldInfo={() => setIsWorldInfoOpen(true)}
          onOpenExternalPrompts={() => setIsExternalPromptsOpen(true)}
          onOpenTemplateVariables={() => setIsTemplateVarsOpen(true)}
          onOpenRegexEditor={() => setIsRegexEditorOpen(true)}
          onOpenPresetEditor={() => setIsPresetEditorOpen(true)}
          onOpenBranchView={() => setIsBranchViewOpen(true)}
          characterName={character?.name}
          isMobile={isMobile}
          isDesktop={isDesktop}
        />
      )}

      {/* Middle Column - Chat Interface (Flexible) */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-teal-400" /></div>}>
          <ChatInterface characterId={characterId} />
        </Suspense>
      </div>

      {/* Right Column - Settings Drawer (Fixed Sidebar) */}
      {isDesktop && (
        <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          isSettingsDrawerOpen ? 'w-[380px]' : 'w-0'
        } overflow-hidden`}>
          {isSettingsDrawerOpen && <SettingsDrawer />}
        </div>
      )}

      {/* Modals */}
      <WorldInfoPanel
        isOpen={isWorldInfoOpen}
        onClose={() => setIsWorldInfoOpen(false)}
        characterId={character?.id}
      />

      {/* Prompts Modals - match World Info open/close flow */}
      <ExternalPromptsDialog
        isOpen={isExternalPromptsOpen}
        onClose={() => setIsExternalPromptsOpen(false)}
      />
      <TemplateVariablePicker
        isOpen={isTemplateVarsOpen}
        onClose={() => setIsTemplateVarsOpen(false)}
      />

      <RegexScriptEditor
        isOpen={isRegexEditorOpen}
        onClose={() => setIsRegexEditorOpen(false)}
      />

      <PresetEditor
        isOpen={isPresetEditorOpen}
        onClose={() => setIsPresetEditorOpen(false)}
      />

      {/* 模型配置由全局 SettingsDrawer 负责，避免重复抽屉 */}

      <ChatBranchVisualization
        isOpen={isBranchViewOpen}
        onClose={() => setIsBranchViewOpen(false)}
        onSelectNode={handleSelectNode}
        onEditNode={handleEditNode}
        onDeleteNode={handleDeleteNode}
      />

      <ChatNodeEditor
        isOpen={isNodeEditorOpen}
        onClose={() => setIsNodeEditorOpen(false)}
        nodeId={selectedNodeId}
        onSave={handleSaveNode}
      />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ChatPageContent />
    </Suspense>
  )
}