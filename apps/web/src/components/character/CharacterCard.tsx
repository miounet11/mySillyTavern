"use client"

import { Character } from '@sillytavern-clone/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CharacterCardProps {
  character: Character
  messageCount?: number
  onClick?: (character: Character) => void
  onSelect?: (character: Character) => void
  onEdit?: (character: Character) => void
  onDelete?: (id: string) => void
}

export default function CharacterCard({
  character,
  messageCount,
  onClick,
  onSelect,
  onEdit,
  onDelete
}: CharacterCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(character)
    } else if (onSelect) {
      onSelect(character)
    }
  }

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
            onClick={() => onSelect(character)}
            variant="default"
            size="sm"
            className="flex-1"
          >
            选择
          </Button>
        )}
        {onEdit && (
          <Button
            onClick={() => onEdit(character)}
            variant="outline"
            size="sm"
          >
            编辑
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={() => onDelete(character.id)}
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

