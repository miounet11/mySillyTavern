/**
 * Chat page with settings panel
 */

'use client'

import { Suspense, useState } from 'react'
import ExternalPromptsDialog from '@/components/prompts/ExternalPromptsDialog'
import TemplateVariablePicker from '@/components/prompts/TemplateVariablePicker'
import ChatList from '@/components/chat/ChatList'
import ChatInterface from '@/components/chat/ChatInterface'
import ChatSettingsPanel from '@/components/chat/ChatSettingsPanel'
import WorldInfoPanel from '@/components/chat/WorldInfoPanel'
import RegexScriptEditor from '@/components/chat/RegexScriptEditor'
import PresetEditor from '@/components/chat/PresetEditor'
import ChatBranchVisualization from '@/components/chat/ChatBranchVisualization'
import ChatNodeEditor from '@/components/chat/ChatNodeEditor'
import { Loader2 } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import toast from 'react-hot-toast'

export default function ChatPage() {
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
    <div className="flex h-full relative">
      {/* Settings Panel */}
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
      />

      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-800/50 flex flex-col bg-gray-900/40 backdrop-blur-sm">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
          <ChatList />
        </Suspense>
      </div>

      {/* Main chat interface */}
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
          <ChatInterface />
        </Suspense>
      </div>

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