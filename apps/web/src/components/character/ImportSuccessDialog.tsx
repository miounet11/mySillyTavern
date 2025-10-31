'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageCircle, Download } from 'lucide-react'

interface ImportSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  characterId: string
  characterName: string
  characterDescription?: string
}

export default function ImportSuccessDialog({
  isOpen,
  onClose,
  characterId,
  characterName,
  characterDescription
}: ImportSuccessDialogProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleStartChat = () => {
    router.push(`/chat?characterId=${characterId}`)
  }

  const handleContinueImport = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/10">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-400/30 mb-4 animate-pulse-glow">
            <svg 
              className="w-8 h-8 text-teal-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">
            ✨ 角色导入成功！
          </h2>
        </div>

        {/* Character Info */}
        <div className="glass-light rounded-lg p-4 mb-6 border border-white/10">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            {characterName}
          </h3>
          {characterDescription && (
            <p className="text-sm text-gray-400 line-clamp-2">
              {characterDescription}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleStartChat}
            className="gradient-btn-primary gap-2 h-12 w-full hover-lift"
          >
            <MessageCircle className="w-5 h-5" />
            <span>立即开始聊天</span>
          </Button>
          
          <Button
            onClick={handleContinueImport}
            variant="outline"
            className="glass-light hover:bg-white/10 text-white border-white/20 gap-2 h-12 w-full hover-lift"
          >
            <Download className="w-5 h-5" />
            <span>继续导入其他</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

