/**
 * Main chat page with sidebar and chat interface
 */

'use client'

import { useEffect, useState } from 'react'
import { Character, Chat } from '@sillytavern-clone/shared'
import { useChatStore } from '@/stores/chatStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useAIModelStore } from '@/stores/aiModelStore'
import Sidebar from '@/components/layout/Sidebar'
import ChatInterface from '@/components/chat/ChatInterface'
import CharacterList from '@/components/character/CharacterList'
import CharacterModal from '@/components/character/CharacterModal'
import AIModelModal from '@/components/ai/AIModelModal'
import toast from 'react-hot-toast'

type ViewMode = 'chat' | 'characters' | 'settings'

export default function ChatPage() {
  const { setCurrentChat, setSelectedCharacter } = useChatStore()
  const { selectedCharacter, setSelectedCharacter: setCharacter } = useCharacterStore()
  const { activeModel, fetchModels } = useAIModelStore()

  const [viewMode, setViewMode] = useState<ViewMode>('chat')
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false)
  const [isAIModelModalOpen, setIsAIModelModalOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Initialize data on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Fetch AI models
        await fetchModels()

        // TODO: Fetch characters and recent chats
        // await refreshCharacters()
        // await refreshChats()

      } catch (error) {
        console.error('Error initializing app:', error)
        toast.error('应用初始化失败')
      }
    }

    initializeApp()
  }, [fetchModels])

  const handleNewChat = () => {
    setCurrentChat(null)
    if (!selectedCharacter) {
      setIsCharacterModalOpen(true)
    }
    setViewMode('chat')
  }

  const handleCharacterSelect = (character: Character) => {
    setCharacter(character)
    setSelectedCharacter(character)
    setViewMode('chat')
    setMobileSidebarOpen(false)
  }

  const handleChatSelect = (chat: Chat) => {
    setCurrentChat(chat)
    setViewMode('chat')
    setMobileSidebarOpen(false)
  }

  const handleCharacterCreated = (character: Character) => {
    setCharacter(character)
    setSelectedCharacter(character)
    setIsCharacterModalOpen(false)
    setEditingCharacter(null)
    setViewMode('chat')
  }

  const handleCharacterUpdated = (character: Character) => {
    if (selectedCharacter?.id === character.id) {
      setCharacter(character)
      setSelectedCharacter(character)
    }
    setIsCharacterModalOpen(false)
    setEditingCharacter(null)
  }

  const handleSettings = () => {
    setViewMode('settings')
    setMobileSidebarOpen(false)
  }

  const handleAIModelConfig = () => {
    setIsAIModelModalOpen(true)
    setMobileSidebarOpen(false)
  }

  const renderMainContent = () => {
    switch (viewMode) {
      case 'characters':
        return (
          <div className="h-full">
            <CharacterList />
          </div>
        )

      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">设置</h2>
              <p className="text-gray-400 mb-6">配置您的SillyTavern体验</p>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-100 mb-4">AI模型配置</h3>
                  <p className="text-gray-400 mb-4">
                    当前活跃模型: {activeModel?.name || '未配置'}
                  </p>
                  <button
                    onClick={handleAIModelConfig}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    配置AI模型
                  </button>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-100 mb-4">其他设置</h3>
                  <p className="text-gray-400">更多设置功能即将推出...</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'chat':
      default:
        return <ChatInterface />
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          onNewChat={handleNewChat}
          onCharacterSelect={handleCharacterSelect}
          onChatSelect={handleChatSelect}
          onSettings={handleSettings}
          className="h-full"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-lg font-semibold text-gray-100">
            {viewMode === 'chat' ? '聊天' : viewMode === 'characters' ? '角色' : '设置'}
          </h1>

          <div className="w-10" />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
      </div>

      {/* Modals */}
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => {
          setIsCharacterModalOpen(false)
          setEditingCharacter(null)
        }}
        onCharacterCreated={handleCharacterCreated}
        onCharacterUpdated={handleCharacterUpdated}
        editingCharacter={editingCharacter}
      />

      <AIModelModal
        isOpen={isAIModelModalOpen}
        onClose={() => setIsAIModelModalOpen(false)}
        onModelCreated={(model) => {
          toast.success(`AI模型 "${model.name}" 已添加`)
          setIsAIModelModalOpen(false)
        }}
        onModelUpdated={(model) => {
          toast.success(`AI模型 "${model.name}" 已更新`)
          setIsAIModelModalOpen(false)
        }}
      />

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50" />
    </div>
  )
}