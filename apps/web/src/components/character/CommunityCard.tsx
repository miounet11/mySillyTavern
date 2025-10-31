"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Heart, Eye, MessageSquare } from 'lucide-react'

export interface CommunityCharacter {
  id: string
  name: string
  description: string
  avatar?: string
  author: string
  tags: string[]
  downloads: number
  likes: number
  category: string
}

interface CommunityCardProps {
  character: CommunityCharacter
  onDownload: (character: CommunityCharacter) => void
}

export default function CommunityCard({
  character,
  onDownload
}: CommunityCardProps) {
  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="character-card group stagger-item animate-fade-in">
      {/* Character Image */}
      <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-gray-900 to-gray-950 overflow-hidden">
        {character.avatar ? (
          <img
            src={character.avatar}
            alt={character.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className="w-full h-full flex items-center justify-center text-6xl font-bold"
          style={{ 
            display: character.avatar ? 'none' : 'flex',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))'
          }}
        >
          <span className="gradient-text text-7xl">{character.name.charAt(0).toUpperCase()}</span>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60"></div>
        
        {/* Stats badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between z-10">
          <span className="glass-light px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-teal-400 border border-teal-500/30">
            {character.category}
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="glass-light flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs text-white border border-white/10">
              <Download className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-400" />
              <span className="font-medium">{formatNumber(character.downloads)}</span>
            </span>
            <span className="glass-light flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs text-white border border-white/10">
              <Heart className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-pink-400" />
              <span className="font-medium">{formatNumber(character.likes)}</span>
            </span>
          </div>
        </div>
        
        {/* Hover overlay with download button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 backdrop-blur-sm">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onDownload(character)
            }}
            className="w-full gradient-btn-teal text-sm py-2.5 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            下载导入
          </Button>
        </div>
      </div>

      {/* Character Info */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
        <h3 className="text-sm sm:text-base font-semibold text-gray-100 truncate group-hover:text-blue-400 transition-colors">
          {character.name}
        </h3>
        
        {character.description && (
          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {character.description}
          </p>
        )}

        {character.author && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">
              {character.author.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] sm:text-xs">作者: <span className="text-gray-400">{character.author}</span></span>
          </div>
        )}

        {character.tags && character.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1">
            {character.tags.slice(0, 2).map((tag: string, index: number) => (
              <span 
                key={index}
                className="tag-chip text-[10px] sm:text-xs px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
            {character.tags.length > 2 && (
              <span className="tag-chip text-[10px] sm:text-xs px-2 py-0.5">
                +{character.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

