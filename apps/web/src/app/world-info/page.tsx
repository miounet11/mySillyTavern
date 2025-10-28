/**
 * World Information management page
 */

'use client'

import { useEffect } from 'react'
import { ArrowLeft, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCharacterStore } from '@/stores/characterStore'
import WorldInfoManager from '@/components/world-info/WorldInfoManager'
import { Button } from '@/components/ui/button'

export default function WorldInfoPage() {
  const router = useRouter()
  const { refreshCharacters } = useCharacterStore()

  useEffect(() => {
    refreshCharacters()
  }, [refreshCharacters])

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-teal-400" />
            <h1 className="text-3xl font-bold text-gray-100">
              世界信息管理
            </h1>
          </div>
          <p className="text-gray-400">
            管理角色的背景知识和世界观设定
          </p>
        </div>

        {/* Main Content Area */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <WorldInfoManager />
        </div>
      </div>
    </div>
  )
}