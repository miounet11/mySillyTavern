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
  return (
    <div className="character-card group">
      {/* Character Image */}
      <div className="relative w-full aspect-[3/4] bg-gray-900 overflow-hidden">
        {character.avatar ? (
          <img
            src={character.avatar}
            alt={character.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className="w-full h-full flex items-center justify-center text-6xl font-bold text-gray-600"
          style={{ display: character.avatar ? 'none' : 'flex' }}
        >
          {character.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Stats badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge className="bg-teal-500 text-white border-0 text-xs">
            {character.category}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {character.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {character.likes}
            </span>
          </div>
        </div>
        
        {/* Hover overlay with download button */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center p-4">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onDownload(character)
            }}
            className="w-full tavern-button"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            下载导入
          </Button>
        </div>
      </div>

      {/* Character Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-base font-semibold text-gray-100 truncate">{character.name}</h3>
        
        {character.description && (
          <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem]">
            {character.description}
          </p>
        )}

        {character.author && (
          <p className="text-xs text-gray-500">
            作者: {character.author}
          </p>
        )}

        {character.tags && character.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {character.tags.slice(0, 2).map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs bg-gray-700 text-gray-300 border-0"
              >
                {tag}
              </Badge>
            ))}
            {character.tags.length > 2 && (
              <Badge 
                variant="secondary"
                className="text-xs bg-gray-700 text-gray-300 border-0"
              >
                +{character.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

