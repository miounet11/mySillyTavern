/**
 * Character state management using Zustand
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Character, CreateCharacterParams } from '@sillytavern-clone/shared'

interface CharacterState {
  // State
  characters: Character[]
  selectedCharacter: Character | null
  isLoading: boolean
  error: string | null

  // Actions
  setCharacters: (characters: Character[]) => void
  setSelectedCharacter: (character: Character | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // CRUD operations
  createCharacter: (params: CreateCharacterParams) => Promise<Character | null>
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<Character | null>
  deleteCharacter: (id: string) => Promise<boolean>
  refreshCharacters: () => Promise<void>

  // Utility
  getCharacterById: (id: string) => Character | undefined
  searchCharacters: (query: string) => Character[]
}

export const useCharacterStore = create<CharacterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      characters: [],
      selectedCharacter: null,
      isLoading: false,
      error: null,

      // Actions
      setCharacters: (characters) => set({ characters }),
      setSelectedCharacter: (character) => set({ selectedCharacter: character }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // CRUD operations
      createCharacter: async (params) => {
        try {
          set({ isLoading: true, error: null })

          // TODO: Implement API call
          const response = await fetch('/api/characters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          })

          if (!response.ok) {
            throw new Error('Failed to create character')
          }

          const character = await response.json()
          set((state) => ({
            characters: [...state.characters, character],
            selectedCharacter: character
          }))

          return character
        } catch (error) {
          console.error('Error creating character:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to create character' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      updateCharacter: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          // TODO: Implement API call
          const response = await fetch(`/api/characters/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          })

          if (!response.ok) {
            throw new Error('Failed to update character')
          }

          const character = await response.json()
          set((state) => ({
            characters: state.characters.map(char =>
              char.id === id ? character : char
            ),
            selectedCharacter: state.selectedCharacter?.id === id ? character : state.selectedCharacter
          }))

          return character
        } catch (error) {
          console.error('Error updating character:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to update character' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      deleteCharacter: async (id) => {
        try {
          set({ isLoading: true, error: null })

          // TODO: Implement API call
          const response = await fetch(`/api/characters/${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('Failed to delete character')
          }

          set((state) => ({
            characters: state.characters.filter(char => char.id !== id),
            selectedCharacter: state.selectedCharacter?.id === id ? null : state.selectedCharacter
          }))

          return true
        } catch (error) {
          console.error('Error deleting character:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to delete character' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      refreshCharacters: async () => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch('/api/characters')

          if (!response.ok) {
            throw new Error('Failed to fetch characters')
          }

          const data = await response.json()
          // API returns { characters: Character[], pagination: {...} }
          set({ characters: data.characters || [] })
        } catch (error) {
          console.error('Error fetching characters:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to fetch characters' })
        } finally {
          set({ isLoading: false })
        }
      },

      // Utility
      getCharacterById: (id) => {
        return get().characters.find(char => char.id === id)
      },

      searchCharacters: (query) => {
        const { characters } = get()
        const lowerQuery = query.toLowerCase()

        return characters.filter(char =>
          char.name.toLowerCase().includes(lowerQuery) ||
          char.description.toLowerCase().includes(lowerQuery) ||
          char.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
      },
    }),
    {
      name: 'character-store',
    }
  )
)