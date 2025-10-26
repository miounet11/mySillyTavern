/**
 * World Information management page
 */

'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Settings, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Character } from '@sillytavern-clone/shared'
import { useCharacterStore } from '@/stores/characterStore'
import Sidebar from '@/components/layout/Sidebar'
import WorldInfoManager from '@/components/world-info/WorldInfoManager'
import { Button } from '@/components/ui/button'

export default function WorldInfoPage() {
  const router = useRouter()
  const { characters, refreshCharacters } = useCharacterStore()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    refreshCharacters()
  }, [refreshCharacters])

  const handleBack = () => {
    router.push('/chat')
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
          onNewChat={() => router.push('/chat')}
          onCharacterSelect={(character: Character) => {
            router.push('/chat')
          }}
          onChatSelect={() => router.push('/chat')}
          onSettings={() => router.push('/chat')}
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

          <h1 className="text-lg font-semibold text-gray-100">世界信息管理</h1>

          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Globe className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-semibold text-gray-100">世界信息管理</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/chat')}
              className="tavern-button-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回聊天
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden p-6">
          <WorldInfoManager />
        </main>
      </div>
    </div>
  )
}