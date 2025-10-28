"use client"

import { Character } from '@sillytavern-clone/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Edit, Trash2, Download } from 'lucide-react'
import Image from 'next/image'

interface CharacterCardProps {
  character: Character
  messageCount?: number
  onClick?: (character: Character) => void
  onSelect?: (character: Character) => void
  onEdit?: (character: Character) => void
  onDelete?: (id: string) => void
  onExport?: (id: string) => void
  variant?: 'default' | 'large'
}

export default function CharacterCard({
  character,
  messageCount,
  onClick,
  onSelect,
  onEdit,
  onDelete,
  onExport,
  variant = 'large'
}: CharacterCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    
    if (onClick) {
      onClick(character)
    } else if (onSelect) {
      onSelect(character)
    }
  }

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  if (variant === 'large') {
    return (
      <div 
        className="character-card group stagger-item animate-fade-in"
        onClick={handleClick}
      >
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
          
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 backdrop-blur-sm">
            <div className="w-full space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {onSelect && (
                <Button
                  onClick={(e) => handleAction(e, () => onSelect(character))}
                  className="w-full gradient-btn-primary text-sm py-2.5 shadow-lg"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  开始对话
                </Button>
              )}
              <div className="grid grid-cols-3 gap-2">
                {onEdit && (
                  <Button
                    onClick={(e) => handleAction(e, () => onEdit(character))}
                    variant="outline"
                    size="sm"
                    className="glass-light hover:bg-white/10 text-white border-white/20 text-xs px-2 py-2"
                    title="编辑"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onExport && (
                  <Button
                    onClick={(e) => handleAction(e, () => onExport(character.id))}
                    variant="outline"
                    size="sm"
                    className="glass-light hover:bg-white/10 text-white border-white/20 text-xs px-2 py-2"
                    title="导出"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={(e) => handleAction(e, () => onDelete(character.id))}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600/80 hover:bg-red-700 text-white text-xs px-2 py-2"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Character Info */}
        <div className="p-4 space-y-2.5">
          <h3 className="text-base font-semibold text-gray-100 truncate group-hover:text-blue-400 transition-colors">
            {character.name}
          </h3>
          
          {character.description && (
            <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
              {character.description}
            </p>
          )}

          {character.tags && character.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {character.tags.slice(0, 3).map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="tag-chip text-xs"
                >
                  {tag}
                </span>
              ))}
              {character.tags.length > 3 && (
                <span className="tag-chip text-xs">
                  +{character.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {messageCount !== undefined && messageCount > 0 && (
            <div className="flex items-center text-xs text-gray-500 pt-1.5 border-t border-gray-700/50">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              <span>{messageCount} 条消息</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default compact variant (for backward compatibility)
  return (
    <div 
      className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-blue-600 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{character.name}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 mt-1">{character.description}</p>
        </div>
      </div>

      {character.tags && character.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {character.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {onSelect && (
          <Button
            onClick={(e) => handleAction(e, () => onSelect(character))}
            variant="default"
            size="sm"
            className="flex-1"
          >
            选择
          </Button>
        )}
        {onEdit && (
          <Button
            onClick={(e) => handleAction(e, () => onEdit(character))}
            variant="outline"
            size="sm"
          >
            编辑
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={(e) => handleAction(e, () => onDelete(character.id))}
            variant="destructive"
            size="sm"
          >
            删除
          </Button>
        )}
      </div>
    </div>
  )
}

