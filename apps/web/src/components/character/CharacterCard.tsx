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
        className="character-card group"
        onClick={handleClick}
      >
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
          
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <div className="w-full space-y-2">
              {onSelect && (
                <Button
                  onClick={(e) => handleAction(e, () => onSelect(character))}
                  className="w-full tavern-button"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  开始对话
                </Button>
              )}
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    onClick={(e) => handleAction(e, () => onEdit(character))}
                    variant="outline"
                    size="sm"
                    className="flex-1 tavern-button-secondary"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                )}
                {onExport && (
                  <Button
                    onClick={(e) => handleAction(e, () => onExport(character.id))}
                    variant="outline"
                    size="sm"
                    className="flex-1 tavern-button-secondary"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    导出
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={(e) => handleAction(e, () => onDelete(character.id))}
                    variant="destructive"
                    size="sm"
                    className="tavern-button-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
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

          {character.tags && character.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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

          {messageCount !== undefined && messageCount > 0 && (
            <div className="flex items-center text-xs text-gray-500 pt-1">
              <MessageSquare className="w-3 h-3 mr-1" />
              {messageCount} 条消息
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

