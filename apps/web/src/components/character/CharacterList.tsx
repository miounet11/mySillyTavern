/**
 * Character list component
 */

import { useState, useEffect } from 'react'
import { Plus, Search, Users, Filter, Grid, List } from 'lucide-react'
import { Character } from '@sillytavern-clone/shared'
import { useCharacterStore } from '@/stores/characterStore'
import { useChatStore } from '@/stores/chatStore'
import CharacterCard from './CharacterCard'
import CharacterModal from './CharacterModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CharacterList() {
  const {
    characters,
    selectedCharacter,
    isLoading,
    error,
    searchCharacters,
    refreshCharacters
  } = useCharacterStore()

  const { setCurrentChat, setCharacter } = useChatStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Filter and sort characters
  const filteredCharacters = searchQuery
    ? searchCharacters(searchQuery)
    : characters

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'created_at':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'updated_at':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
      case 'message_count':
        comparison = (a.messageCount || 0) - (b.messageCount || 0)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Load characters on mount
  useEffect(() => {
    refreshCharacters()
  }, [])

  const handleCreateCharacter = () => {
    setIsModalOpen(true)
  }

  const handleSelectCharacter = (character: Character) => {
    setCharacter(character)
    setCurrentChat(null) // Clear current chat to start fresh
  }

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
    setSortBy('updated_at')
    setSortOrder('desc')
  }

  const allTags = Array.from(
    new Set(characters.flatMap(char => char.tags || []))
  )

  const filteredTagsCount = allTags.filter(tag =>
    selectedTags.includes(tag)
  ).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Characters ({characters.length})
          </h2>

          <Button
            onClick={handleCreateCharacter}
            className="tavern-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Character
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 tavern-input"
            />
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="tavern-button-secondary">
                Sort by {sortBy}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleSortChange('name', sortOrder)}>
                Name ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('created_at', sortOrder)}>
                Created ({sortOrder === 'asc' ? 'Oldest' : 'Newest'})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('updated_at', sortOrder)}>
                Updated ({sortOrder === 'asc' ? 'Oldest' : 'Recent'})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('message_count', sortOrder)}>
                Messages ({sortOrder === 'asc' ? 'Least' : 'Most'})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="flex border border-gray-700 rounded-lg">
            <button
              className={`px-3 py-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              className={`px-3 py-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        {(searchQuery || filteredTagsCount > 0) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                  "{searchQuery}"
                </span>
              )}
              {filteredTagsCount > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() =>
                          setSelectedTags(prev => prev.filter(t => t !== tag))
                        }
                        className="ml-1 text-gray-400 hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Popular Tags */}
        {!searchQuery && selectedTags.length === 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 mr-2">Popular tags:</span>
            {['assistant', 'storyteller', 'teacher', 'friend', 'creative', 'professional'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTags([...selectedTags, tag])}
                className="inline-flex items-center px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 p-3 bg-red-900/20 border border-red-800 text-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => useCharacterStore.getState().clearError()}
              className="text-red-400 hover:text-red-300 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Character Grid/List */}
      <div className="flex-1 overflow-y-auto tavern-scrollbar p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading characters...</div>
          </div>
        ) : sortedCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Users className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No characters found</h3>
            <p className="text-sm mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first character to get started'}
            </p>
            <Button onClick={handleCreateCharacter}>
              <Plus className="w-4 h-4 mr-2" />
              Create Character
            </Button>
          </div>
        ) : (
          <div
            className={`
              grid gap-4 h-fit
              ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}
            `}
          >
            {sortedCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                messageCount={character.messageCount || 0}
                onClick={handleSelectCharacter}
              />
            ))}
          </div>
        )}
      </div>

      {/* Character Creation Modal */}
      <CharacterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCharacterCreated={(character) => {
          setCharacter(character)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}