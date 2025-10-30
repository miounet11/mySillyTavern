/**
 * World Information Manager component
 */

import { useState, useEffect } from 'react'
import { 
  IconPlus, 
  IconSearch, 
  IconEdit, 
  IconTrash, 
  IconWorld, 
  IconUsers, 
  IconBook, 
  IconDots, 
  IconEye, 
  IconEyeOff 
} from '@tabler/icons-react'
import { WorldInfo } from '@sillytavern-clone/shared'
import { useCharacterStore } from '@/stores/characterStore'
import toast from 'react-hot-toast'
import { 
  Button, 
  TextInput, 
  Table, 
  Badge, 
  Menu, 
  ActionIcon, 
  Loader, 
  Stack, 
  Group, 
  Text, 
  Box,
  SegmentedControl
} from '@mantine/core'
import WorldInfoModal from './WorldInfoModal'

interface WorldInfoManagerProps {
  className?: string
}

export default function WorldInfoManager({ className = '' }: WorldInfoManagerProps) {
  const [worldInfos, setWorldInfos] = useState<WorldInfo[]>([])
  const [filteredWorldInfos, setFilteredWorldInfos] = useState<WorldInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'global' | 'character'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorldInfo, setEditingWorldInfo] = useState<WorldInfo | null>(null)

  const { characters } = useCharacterStore()

  // Fetch world info
  useEffect(() => {
    fetchWorldInfos()
  }, [])

  // Filter world info based on search and filter mode
  useEffect(() => {
    let filtered = worldInfos

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(info =>
        info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (info.description && info.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply mode filter
    switch (filterMode) {
      case 'global':
        filtered = filtered.filter(info => info.isGlobal)
        break
      case 'character':
        filtered = filtered.filter(info => !info.isGlobal)
        break
      // 'all' - no additional filter
    }

    setFilteredWorldInfos(filtered)
  }, [worldInfos, searchQuery, filterMode])

  const fetchWorldInfos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/world-info')
      if (!response.ok) {
        throw new Error('Failed to fetch world info')
      }
      const data = await response.json()
      setWorldInfos(data.worldInfos || [])
    } catch (error) {
      console.error('Error fetching world info:', error)
      toast.error('获取世界信息失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateWorldInfo = () => {
    setEditingWorldInfo(null)
    setIsModalOpen(true)
  }

  const handleEditWorldInfo = (worldInfo: WorldInfo) => {
    setEditingWorldInfo(worldInfo)
    setIsModalOpen(true)
  }

  const handleDeleteWorldInfo = async (id: string) => {
    if (!confirm('确定要删除这个世界信息吗？此操作无法撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/world-info/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete world info')
      }

      setWorldInfos(prev => prev.filter(info => info.id !== id))
      toast.success('世界信息已删除')
    } catch (error) {
      console.error('Error deleting world info:', error)
      toast.error('删除世界信息失败')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/world-info/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to update world info')
      }

      const updatedInfo = await response.json()
      setWorldInfos(prev => prev.map(info => info.id === id ? updatedInfo : info))
      toast.success(`世界信息已${!isActive ? '启用' : '禁用'}`)
    } catch (error) {
      console.error('Error updating world info:', error)
      toast.error('更新世界信息失败')
    }
  }

  const handleWorldInfoSaved = (worldInfo: WorldInfo) => {
    if (editingWorldInfo) {
      setWorldInfos(prev => prev.map(info => info.id === worldInfo.id ? worldInfo : info))
      toast.success('世界信息已更新')
    } else {
      setWorldInfos(prev => [...prev, worldInfo])
      toast.success('世界信息已创建')
    }
    setIsModalOpen(false)
    setEditingWorldInfo(null)
  }

  const getCharacterName = (characterId: string) => {
    const character = characters.find(c => c.id === characterId)
    return character?.name || '未知角色'
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Stack gap="lg" className={className}>
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text size="xl" fw={700}>世界信息</Text>
          <Text size="sm" c="dimmed">管理聊天中的背景知识和世界设定</Text>
        </Box>
        <Button 
          onClick={handleCreateWorldInfo} 
          leftSection={<IconPlus size={16} />}
          gradient={{ from: 'teal', to: 'cyan' }}
          variant="gradient"
        >
          创建世界信息
        </Button>
      </Group>

      {/* Search and Filters */}
      <Group gap="md" wrap="nowrap">
        <TextInput
          placeholder="搜索世界信息..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
        />

        <SegmentedControl
          value={filterMode}
          onChange={(value) => setFilterMode(value as 'all' | 'global' | 'character')}
          data={[
            { value: 'all', label: '全部' },
            { value: 'global', label: '全局' },
            { value: 'character', label: '角色专用' }
          ]}
        />
      </Group>

      {/* World Info List */}
      <Box 
        style={{
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderRadius: 'var(--mantine-radius-md)',
          border: '1px solid var(--mantine-color-dark-5)',
          overflow: 'hidden'
        }}
      >
        {isLoading ? (
          <Stack align="center" gap="md" py={60}>
            <Loader color="blue" />
            <Text c="dimmed">加载世界信息...</Text>
          </Stack>
        ) : filteredWorldInfos.length === 0 ? (
          <Stack align="center" gap="md" py={60}>
            <IconBook size={48} opacity={0.5} />
            <Text size="lg" fw={500}>
              {searchQuery ? '没有找到匹配的世界信息' : '还没有世界信息'}
            </Text>
            <Text size="sm" c="dimmed">
              {searchQuery ? '尝试其他搜索词' : '创建第一个世界信息来开始'}
            </Text>
            {!searchQuery && (
              <Button 
                onClick={handleCreateWorldInfo}
                leftSection={<IconPlus size={16} />}
              >
                创建世界信息
              </Button>
            )}
          </Stack>
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>名称</Table.Th>
                <Table.Th>类型</Table.Th>
                <Table.Th>条目数量</Table.Th>
                <Table.Th>关联角色</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>更新时间</Table.Th>
                <Table.Th ta="right">操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredWorldInfos.map((info) => (
                <Table.Tr key={info.id}>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text fw={500}>{info.name}</Text>
                      <Text size="sm" c="dimmed" lineClamp={1}>{info.description}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={info.isGlobal ? 'blue' : 'gray'} variant="light">
                      {info.isGlobal ? '全局' : '角色专用'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text>{info.entries?.length || 0}</Text>
                  </Table.Td>
                  <Table.Td>
                    {info.characterIds.length > 0 ? (
                      <Group gap={4}>
                        {info.characterIds.slice(0, 2).map((characterId: string) => (
                          <Badge key={characterId} variant="outline" size="xs">
                            {getCharacterName(characterId)}
                          </Badge>
                        ))}
                        {info.characterIds.length > 2 && (
                          <Badge variant="outline" size="xs">
                            +{info.characterIds.length - 2}
                          </Badge>
                        )}
                      </Group>
                    ) : (
                      <Text c="dimmed">无</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Button
                      onClick={() => handleToggleActive(info.id, info.isActive || false)}
                      variant="subtle"
                      size="compact-sm"
                      leftSection={info.isActive ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                      color={info.isActive ? 'green' : 'gray'}
                    >
                      {info.isActive ? '启用' : '禁用'}
                    </Button>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {formatDate(info.updatedAt)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Menu position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item 
                          leftSection={<IconEdit size={16} />}
                          onClick={() => handleEditWorldInfo(info)}
                        >
                          编辑
                        </Menu.Item>
                        <Menu.Item
                          leftSection={info.isActive ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                          onClick={() => handleToggleActive(info.id, info.isActive || false)}
                        >
                          {info.isActive ? '禁用' : '启用'}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={16} />}
                          color="red"
                          onClick={() => handleDeleteWorldInfo(info.id)}
                        >
                          删除
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Box>

      {/* World Info Modal */}
      <WorldInfoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingWorldInfo(null)
        }}
        onWorldInfoSaved={handleWorldInfoSaved}
        editingWorldInfo={editingWorldInfo}
        characters={characters}
      />
    </Stack>
  )
}