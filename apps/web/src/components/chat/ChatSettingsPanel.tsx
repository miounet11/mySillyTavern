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
import { useTranslation } from '@/lib/i18n'

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
  const { t } = useTranslation()
  const router = useRouter()

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-30 p-2 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all shadow-lg"
        title={t('chat.settingsPanel.expandSidebar')}
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
          <h3 className="text-sm font-semibold text-gray-300">{t('chat.settingsPanel.title')}</h3>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title={t('chat.settingsPanel.collapseSidebar')}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {characterName && (
          <div className="text-xs text-gray-500 mb-2">
            {t('chat.settingsPanel.currentCharacter')}: <span className="text-teal-400">{characterName}</span>
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
          {t('chat.settingsPanel.backToCharacters')}
        </Button>

        <div className="pt-4 pb-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t('chat.settingsPanel.sections.plot')}
          </h4>
        </div>

        <Button
          onClick={onOpenBranchView}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title={t('chat.settingsPanel.branches.tooltip')}
        >
          <GitBranch className="w-4 h-4" />
          {t('chat.settingsPanel.branches.title')}
        </Button>

        <div className="pt-4 pb-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t('chat.settingsPanel.sections.settings')}
          </h4>
        </div>

        <Button
          onClick={onOpenExternalPrompts}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title={t('chat.settingsPanel.externalPrompts.tooltip')}
        >
          <FileText className="w-4 h-4" />
          {t('chat.settingsPanel.externalPrompts.title')}
        </Button>

        <Button
          onClick={onOpenWorldInfo}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title={t('chat.settingsPanel.worldInfo.tooltip')}
        >
          <BookOpen className="w-4 h-4" />
          {t('chat.settingsPanel.worldInfo.title')}
        </Button>

        <Button
          onClick={onOpenTemplateVariables}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title={t('chat.settingsPanel.templateVars.tooltip')}
        >
          <Wand2 className="w-4 h-4" />
          {t('chat.settingsPanel.templateVars.title')}
        </Button>

        <Button
          onClick={onOpenRegexEditor}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title={t('chat.settingsPanel.regex.tooltip')}
        >
          <Code className="w-4 h-4" />
          {t('chat.settingsPanel.regex.title')}
        </Button>

        <Button
          onClick={onOpenPresetEditor}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title={t('chat.settingsPanel.presets.tooltip')}
        >
          <FileJson className="w-4 h-4" />
          {t('chat.settingsPanel.presets.title')}
        </Button>

        <div className="pt-4 pb-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t('chat.settingsPanel.sections.advanced')}
          </h4>
        </div>

        <Button
          onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
          variant="outline"
          className="w-full justify-start tavern-button-secondary gap-3"
          title={t('chat.settingsPanel.advancedSettings.tooltip')}
        >
          <Settings className="w-4 h-4" />
          {t('chat.settingsPanel.advancedSettings.title')}
        </Button>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>{t('chat.settingsPanel.stats.messageCount')}:</span>
            <span className="text-gray-400">--</span>
          </div>
          <div className="flex justify-between">
            <span>{t('chat.settingsPanel.stats.tokenUsage')}:</span>
            <span className="text-gray-400">--</span>
          </div>
        </div>
      </div>

      {/* Dialogs moved to chat/page to match World Info open behavior */}
    </div>
  )
}

