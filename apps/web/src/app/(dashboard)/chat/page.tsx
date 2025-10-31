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
import toast from 'react-hot-toast'

function ChatPageContent() {
  const searchParams = useSearchParams()
  const characterId = searchParams.get('characterId')
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(true)
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
      setIsDesktop(width >= 640) // sm breakpoint
      setIsMobile(width < 640)
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
    <div className="min-h-screen bg-gray-950">
      {/* Chat Settings Panel - Now a drawer */}
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
        hideOverlay={isDesktop}
        isMobile={isMobile}
      />

      {/* Main chat area - Dynamic width based on drawer states */}
      <div 
        className="container mx-auto max-w-6xl px-4 py-6 transition-all duration-500 ease-in-out"
        style={{
          marginLeft: isSettingsPanelOpen ? 'var(--left-drawer-width, 0px)' : '0',
          marginRight: isSettingsDrawerOpen ? 'var(--right-drawer-width, 0px)' : '0',
        }}
      >
        {/* Main chat interface */}
        <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-teal-400" /></div>}>
          <ChatInterface characterId={characterId} />
        </Suspense>
      </div>

      {/* CSS Variables for responsive drawer widths */}
      <style jsx>{`
        :global(:root) {
          /* Mobile: drawers overlay, no margin */
          --left-drawer-width: 0px;
          --right-drawer-width: 0px;
        }
        
        /* Tablet and up: drawers push content */
        @media (min-width: 640px) {
          :global(:root) {
            --left-drawer-width: 320px;
            --right-drawer-width: 500px;
          }
        }
        
        /* Desktop: larger drawers */
        @media (min-width: 768px) {
          :global(:root) {
            --left-drawer-width: 340px;
          }
        }
        
        @media (min-width: 1024px) {
          :global(:root) {
            --right-drawer-width: 600px;
          }
        }
      `}</style>

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