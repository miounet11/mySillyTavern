"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Heart, Eye, MessageSquare } from 'lucide-react'

interface CommunityCharacter {
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
      <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {character.avatar ? (
          <img
            src={character.avatar}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-600">
            {character.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-teal-500/90 text-white border-0 backdrop-blur-sm">
            {character.category}
          </Badge>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-3">
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
        </div>
        
        {/* Hover overlay with download button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
        <h3 className="text-lg font-bold text-gray-100 truncate">{character.name}</h3>
        
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
          <div className="flex flex-wrap gap-1 pt-1">
            {character.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs bg-gray-700/50 text-gray-300 border-gray-600/50"
              >
                {tag}
              </Badge>
            ))}
            {character.tags.length > 3 && (
              <Badge 
                variant="secondary"
                className="text-xs bg-gray-700/50 text-gray-300 border-gray-600/50"
              >
                +{character.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

