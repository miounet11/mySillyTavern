/**
 * Character list component
 */

import { useState, useEffect } from 'react'
import {
  IconPlus,
  IconSearch,
  IconUsers,
  IconFilter,
  IconLayoutGrid,
  IconLayoutList,
  IconUpload,
  IconX,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react'
import { Character } from '@sillytavern-clone/shared'
import { useCharacterStore } from '@/stores/characterStore'
import { useChatStore } from '@/stores/chatStore'
import CharacterCard from './CharacterCard'
import CharacterModal from './CharacterModal'
import CharacterImportDialog from './CharacterImportDialog'
import {
  Box,
  Button,
  TextInput,
  Menu,
  Group,
  Stack,
  Text,
  Badge,
  Alert,
  Loader,
  SimpleGrid,
  SegmentedControl,
  ActionIcon,
  CloseButton,
} from '@mantine/core'
import toast from 'react-hot-toast'

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
  const [isImportOpen, setIsImportOpen] = useState(false)
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

  const handleImportCharacter = () => setIsImportOpen(true)

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
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box
        p="md"
        style={{
          borderBottom: '1px solid rgb(55, 65, 81)',
        }}
      >
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <IconUsers size={20} />
            <Text size="xl" fw={600} c="gray.1">
              Characters ({characters.length})
            </Text>
          </Group>

          <Group gap="xs">
            <Button
              onClick={handleImportCharacter}
              variant="light"
              leftSection={<IconUpload size={16} />}
            >
              Import
            </Button>
            <Button
              onClick={handleCreateCharacter}
              variant="gradient"
              gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
              leftSection={<IconPlus size={16} />}
            >
              Create Character
            </Button>
          </Group>
        </Group>

        {/* Search and Filters */}
        <Group gap="sm" align="flex-start">
          {/* Search */}
          <TextInput
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery && (
                <CloseButton
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                />
              )
            }
            style={{ flex: 1 }}
          />

          {/* Sort Menu */}
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <Button
                variant="light"
                leftSection={
                  sortOrder === 'asc' ? (
                    <IconSortAscending size={16} />
                  ) : (
                    <IconSortDescending size={16} />
                  )
                }
              >
                Sort
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Sort by</Menu.Label>
              <Menu.Item onClick={() => handleSortChange('name', sortOrder)}>
                Name ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
              </Menu.Item>
              <Menu.Item onClick={() => handleSortChange('created_at', sortOrder)}>
                Created ({sortOrder === 'asc' ? 'Oldest' : 'Newest'})
              </Menu.Item>
              <Menu.Item onClick={() => handleSortChange('updated_at', sortOrder)}>
                Updated ({sortOrder === 'asc' ? 'Oldest' : 'Recent'})
              </Menu.Item>
              <Menu.Item onClick={() => handleSortChange('message_count', sortOrder)}>
                Messages ({sortOrder === 'asc' ? 'Least' : 'Most'})
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                leftSection={
                  sortOrder === 'asc' ? (
                    <IconSortDescending size={16} />
                  ) : (
                    <IconSortAscending size={16} />
                  )
                }
              >
                Toggle Order
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* View Mode */}
          <SegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value as 'grid' | 'list')}
            data={[
              {
                value: 'grid',
                label: (
                  <Group gap={4} justify="center">
                    <IconLayoutGrid size={16} />
                  </Group>
                ),
              },
              {
                value: 'list',
                label: (
                  <Group gap={4} justify="center">
                    <IconLayoutList size={16} />
                  </Group>
                ),
              },
            ]}
            styles={{
              root: {
                backgroundColor: 'rgb(31, 41, 55)',
              },
            }}
          />
        </Group>

        {/* Filter Tags */}
        {(searchQuery || filteredTagsCount > 0) && (
          <Group justify="space-between" mt="md">
            <Group gap="xs">
              {searchQuery && (
                <Badge size="md" color="blue" variant="filled">
                  "{searchQuery}"
                </Badge>
              )}
              {filteredTagsCount > 0 && (
                <Group gap={4}>
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      size="sm"
                      variant="light"
                      rightSection={
                        <ActionIcon
                          size="xs"
                          color="gray"
                          radius="xl"
                          variant="transparent"
                          onClick={() =>
                            setSelectedTags(prev => prev.filter(t => t !== tag))
                          }
                        >
                          <IconX size={10} />
                        </ActionIcon>
                      }
                      styles={{
                        root: {
                          paddingRight: '4px',
                        },
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </Group>
              )}
            </Group>

            <Button
              variant="subtle"
              size="compact-sm"
              onClick={handleClearFilters}
              c="dimmed"
            >
              Clear filters
            </Button>
          </Group>
        )}

        {/* Popular Tags */}
        {!searchQuery && selectedTags.length === 0 && (
          <Group gap="xs" mt="md">
            <Text size="xs" c="dimmed">
              Popular tags:
            </Text>
            {['assistant', 'storyteller', 'teacher', 'friend', 'creative', 'professional'].map((tag) => (
              <Badge
                key={tag}
                size="sm"
                variant="light"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedTags([...selectedTags, tag])}
              >
                {tag}
              </Badge>
            ))}
          </Group>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Box px="md" py="xs">
          <Alert
            color="red"
            variant="light"
            title="Error"
            withCloseButton
            onClose={() => useCharacterStore.getState().clearError()}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Character Grid/List */}
      <Box
        p="md"
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {isLoading ? (
          <Stack align="center" justify="center" h={128}>
            <Loader size="lg" />
            <Text size="sm" c="dimmed">
              Loading characters...
            </Text>
          </Stack>
        ) : sortedCharacters.length === 0 ? (
          <Stack align="center" justify="center" h={128}>
            <IconUsers size={48} opacity={0.5} color="gray" />
            <Text size="lg" fw={500} c="dimmed">
              No characters found
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              {searchQuery ? 'Try a different search term' : 'Create your first character to get started'}
            </Text>
            <Button
              onClick={handleCreateCharacter}
              variant="gradient"
              gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
              leftSection={<IconPlus size={16} />}
            >
              Create Character
            </Button>
          </Stack>
        ) : viewMode === 'grid' ? (
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing="md"
          >
            {sortedCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                messageCount={character.messageCount || 0}
                onClick={handleSelectCharacter}
                variant="large"
              />
            ))}
          </SimpleGrid>
        ) : (
          <Stack gap="md">
            {sortedCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                messageCount={character.messageCount || 0}
                onClick={handleSelectCharacter}
                variant="default"
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Character Creation Modal */}
      <CharacterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCharacterCreated={(character) => {
          setCharacter(character)
          setIsModalOpen(false)
        }}
      />

      <CharacterImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={async () => {
          await refreshCharacters()
        }}
      />
    </Stack>
  )
}