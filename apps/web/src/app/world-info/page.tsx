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
    <div className="min-h-screen bg-gray-950 noise-texture">
      <div className="container mx-auto px-6 py-8 max-w-7xl page-transition">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="sm"
              className="glass-light hover:bg-white/10 text-gray-300 hover:text-white border border-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
          
          <div className="page-header">
            <div className="relative z-10 flex items-center gap-4">
              <Globe className="w-10 h-10 text-teal-400 animate-pulse-glow" />
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">
                  世界信息管理
                </h1>
                <p className="text-gray-300 text-lg">
                  管理角色的背景知识和世界观设定
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="glass-card border border-gray-700/50 rounded-2xl p-6">
          <WorldInfoManager />
        </div>
      </div>
    </div>
  )
}