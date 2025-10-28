/**
 * Tag Input Component - Chips style input for tags
 */

"use client"

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Badge } from './badge'
import { Input } from './input'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
}

export function TagInput({
  tags,
  onChange,
  placeholder = '输入标签后按 Enter...',
  maxTags = 10,
  className = ''
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < maxTags) {
      onChange([...tags, tag])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className={`glass-input min-h-[60px] p-2 flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="tag-chip flex items-center gap-1 pr-1 group"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      {tags.length < maxTags && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 text-sm"
        />
      )}
    </div>
  )
}

