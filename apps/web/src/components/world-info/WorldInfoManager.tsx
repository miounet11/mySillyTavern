/**
 * World Information Manager component
 */

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Globe, Users, Book, Settings, Eye, EyeOff } from 'lucide-react'
import { WorldInfo } from '@sillytavern-clone/shared'
import { useCharacterStore } from '@/stores/characterStore'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">世界信息</h2>
          <p className="text-gray-400">管理聊天中的背景知识和世界设定</p>
        </div>
        <Button onClick={handleCreateWorldInfo} className="tavern-button">
          <Plus className="w-4 h-4 mr-2" />
          创建世界信息
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索世界信息..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 tavern-input"
          />
        </div>

        <div className="flex border border-gray-700 rounded-lg">
          {[
            { key: 'all', label: '全部', icon: Book },
            { key: 'global', label: '全局', icon: Globe },
            { key: 'character', label: '角色专用', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilterMode(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                filterMode === key
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* World Info List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>加载世界信息...</p>
            </div>
          </div>
        ) : filteredWorldInfos.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? '没有找到匹配的世界信息' : '还没有世界信息'}
              </h3>
              <p className="text-sm mb-4">
                {searchQuery ? '尝试其他搜索词' : '创建第一个世界信息来开始'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateWorldInfo} className="tavern-button">
                  <Plus className="w-4 h-4 mr-2" />
                  创建世界信息
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>条目数量</TableHead>
                  <TableHead>关联角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorldInfos.map((info) => (
                  <TableRow key={info.id} className="border-gray-700">
                    <TableCell>
                      <div>
                        <h3 className="font-medium text-gray-100">{info.name}</h3>
                        <p className="text-sm text-gray-400 line-clamp-1">{info.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={info.isGlobal ? 'default' : 'secondary'}>
                        {info.isGlobal ? '全局' : '角色专用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-300">{info.entries?.length || 0}</span>
                    </TableCell>
                    <TableCell>
                      {info.characterIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {info.characterIds.slice(0, 2).map((characterId: string) => (
                            <Badge key={characterId} variant="outline" className="text-xs">
                              {getCharacterName(characterId)}
                            </Badge>
                          ))}
                          {info.characterIds.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{info.characterIds.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">无</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleActive(info.id, info.isActive || false)}
                        className="flex items-center space-x-1 text-sm"
                      >
                        {info.isActive ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={info.isActive ? 'text-green-400' : 'text-gray-400'}>
                          {info.isActive ? '启用' : '禁用'}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-400">
                        {formatDate(info.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditWorldInfo(info)}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(info.id, info.isActive || false)}
                          >
                            {info.isActive ? (
                              <EyeOff className="w-4 h-4 mr-2" />
                            ) : (
                              <Eye className="w-4 h-4 mr-2" />
                            )}
                            {info.isActive ? '禁用' : '启用'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteWorldInfo(info.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

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
    </div>
  )
}