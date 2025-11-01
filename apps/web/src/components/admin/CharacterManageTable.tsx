'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Trash2, 
  Upload,
  UploadCloud,
  Loader2,
  Eye,
  AlertCircle,
  Edit
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Select, Badge, Table, Group, Text, ActionIcon } from '@mantine/core'
import CharacterEditModal from './CharacterEditModal'

export default function CharacterManageTable() {
  const [characters, setCharacters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('community')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [availableUsers, setAvailableUsers] = useState<string[]>([])
  const [editingCharacter, setEditingCharacter] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    loadCharacters()
  }, [typeFilter, categoryFilter, userFilter])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setAvailableUsers(data.userIds || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadCharacters = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (userFilter) params.append('userId', userFilter)

      const response = await fetch(`/api/admin/characters?${params}`)
      const data = await response.json()
      setCharacters(data.characters || [])
    } catch (error) {
      console.error('Error loading characters:', error)
      toast.error('加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async (character: any) => {
    if (character.type === 'community') {
      toast('该角色已在社区中')
      return
    }

    try {
      const response = await fetch('/api/admin/characters/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          characterId: character.id,
          author: 'AI Generated'
        })
      })

      if (response.ok) {
        toast.success('发布成功！')
        loadCharacters()
      } else {
        const data = await response.json()
        toast.error(data.error || '发布失败')
      }
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('发布失败')
    }
  }

  const handleUnpublish = async (character: any) => {
    if (character.type !== 'community') {
      toast('该角色不在社区中')
      return
    }

    if (!confirm('确定要从社区移除这个角色吗？')) return

    try {
      const response = await fetch(
        `/api/admin/characters/publish?communityId=${character.id}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        toast.success('已从社区移除')
        loadCharacters()
      } else {
        toast.error('操作失败')
      }
    } catch (error) {
      console.error('Unpublish error:', error)
      toast.error('操作失败')
    }
  }

  const handleEdit = async (character: any) => {
    try {
      // 获取完整角色详情
      const response = await fetch(`/api/admin/characters/${character.id}`)
      if (response.ok) {
        const data = await response.json()
        setEditingCharacter(data)
        setIsEditModalOpen(true)
      } else {
        toast.error('加载角色详情失败')
      }
    } catch (error) {
      console.error('Load character error:', error)
      toast.error('加载角色详情失败')
    }
  }

  const handleDelete = async (character: any) => {
    if (!confirm(`确定要删除"${character.name}"吗？`)) return

    try {
      const response = await fetch(
        `/api/admin/characters?id=${character.id}&type=${character.type}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        toast.success('删除成功')
        loadCharacters()
      } else {
        toast.error('删除失败')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('删除失败')
    }
  }

  const handleTypeFilterChange = (value: string | null) => {
    const newValue = value || 'community'
    setTypeFilter(newValue)
    if (newValue === 'community') {
      setUserFilter('') // 清空用户筛选
    }
  }

  const filteredCharacters = characters.filter(char => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      char.name.toLowerCase().includes(query) ||
      (char.description && char.description.toLowerCase().includes(query)) ||
      (char.tags && char.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索角色名称、描述或标签..."
            className="pl-10 glass-input h-11"
          />
        </div>

        <Select
          value={typeFilter}
          onChange={handleTypeFilterChange}
          data={[
            { value: 'community', label: '社区角色' },
            { value: 'user', label: '用户角色' },
            { value: 'all', label: '全部类型' },
          ]}
          className="w-full sm:w-40"
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
        />

        <Select
          value={userFilter}
          onChange={(value) => setUserFilter(value || '')}
          data={[
            { value: '', label: '所有用户' },
            { value: 'all', label: '全部用户角色' },
            ...availableUsers.map(userId => ({
              value: userId,
              label: `用户: ${userId.substring(0, 8)}...`
            }))
          ]}
          placeholder="按用户筛选"
          className="w-full sm:w-48"
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
          disabled={typeFilter === 'community'}
        />

        <Button
          onClick={loadCharacters}
          variant="outline"
          className="glass-light border-white/20"
        >
          刷新
        </Button>
      </div>

      {/* 统计信息 */}
      <div className="flex gap-4">
        <div className="glass-card px-4 py-2 rounded-lg">
          <Text size="sm" className="text-gray-400">总数</Text>
          <Text className="text-xl font-bold text-white">
            {filteredCharacters.length}
          </Text>
        </div>
        <div className="glass-card px-4 py-2 rounded-lg">
          <Text size="sm" className="text-gray-400">用户角色</Text>
          <Text className="text-xl font-bold text-teal-400">
            {filteredCharacters.filter(c => c.type === 'user').length}
          </Text>
        </div>
        <div className="glass-card px-4 py-2 rounded-lg">
          <Text size="sm" className="text-gray-400">社区角色</Text>
          <Text className="text-xl font-bold text-cyan-400">
            {filteredCharacters.filter(c => c.type === 'community').length}
          </Text>
        </div>
      </div>

      {/* 角色列表表格 */}
      {filteredCharacters.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <Text className="text-gray-400 text-lg">没有找到角色</Text>
          <Text size="sm" className="text-gray-500 mt-2">
            尝试调整搜索条件或生成新角色
          </Text>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <Table.Th style={{ color: 'rgb(209, 213, 219)' }}>名称</Table.Th>
                <Table.Th style={{ color: 'rgb(209, 213, 219)' }}>分类</Table.Th>
                <Table.Th style={{ color: 'rgb(209, 213, 219)' }}>标签</Table.Th>
                <Table.Th style={{ color: 'rgb(209, 213, 219)' }}>类型</Table.Th>
                <Table.Th style={{ color: 'rgb(209, 213, 219)' }}>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredCharacters.map((character) => (
                <Table.Tr key={character.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Table.Td>
                    <div>
                      <Text className="font-semibold text-white">
                        {character.name}
                      </Text>
                      <Text size="xs" className="text-gray-500 line-clamp-1">
                        {character.description}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    {character.category ? (
                      <Badge variant="light" color="teal" size="sm">
                        {character.category}
                      </Badge>
                    ) : (
                      <Text size="sm" className="text-gray-600">-</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <div className="flex flex-wrap gap-1">
                      {character.tags && character.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="dot" size="xs" color="cyan">
                          {tag}
                        </Badge>
                      ))}
                      {character.tags && character.tags.length > 3 && (
                        <Badge variant="dot" size="xs" color="gray">
                          +{character.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={character.type === 'user' ? 'blue' : 'green'}
                      variant="light"
                      size="sm"
                    >
                      {character.type === 'user' ? '用户' : '社区'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        onClick={() => handleEdit(character)}
                        variant="subtle"
                        color="blue"
                        title={character.type === 'community' ? '编辑角色' : '查看详情'}
                      >
                        <Edit className="w-4 h-4" />
                      </ActionIcon>
                      {character.type === 'user' ? (
                        <ActionIcon
                          onClick={() => handlePublish(character)}
                          variant="subtle"
                          color="teal"
                          title="发布到社区"
                        >
                          <Upload className="w-4 h-4" />
                        </ActionIcon>
                      ) : (
                        <ActionIcon
                          onClick={() => handleUnpublish(character)}
                          variant="subtle"
                          color="orange"
                          title="从社区移除"
                        >
                          <UploadCloud className="w-4 h-4" />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        onClick={() => handleDelete(character)}
                        variant="subtle"
                        color="red"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

      {/* 编辑模态框 */}
      <CharacterEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCharacter(null)
        }}
        character={editingCharacter}
        onSaved={() => {
          loadCharacters()
          setIsEditModalOpen(false)
          setEditingCharacter(null)
        }}
      />
    </div>
  )
}

