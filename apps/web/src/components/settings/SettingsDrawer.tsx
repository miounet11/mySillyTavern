/**
 * Full-featured Settings drawer - right-side panel with all settings
 */

'use client'

import { useState, useEffect } from 'react'
import {
  IconSettings,
  IconUser,
  IconDatabase,
  IconPuzzle,
  IconPalette,
  IconDeviceFloppy,
  IconDownload,
  IconUpload,
  IconPlus,
  IconEdit,
  IconTrash,
  IconPower,
  IconX,
} from '@tabler/icons-react'
import { Button as MantineButton, TextInput, Badge, Stack, Box, Text } from '@mantine/core'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import AIModelDrawer from '@/components/ai/AIModelDrawer'
import { useAIModelStore } from '@/stores/aiModelStore'
import { useSettingsUIStore } from '@/stores/settingsUIStore'
import { ProviderList } from './ProviderList'
import { ProviderConfigPanel } from './ProviderConfigPanel'
import toast from 'react-hot-toast'

interface SettingsDrawerProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function SettingsDrawer({ isOpen: isOpenProp, onClose: onCloseProp }: SettingsDrawerProps = {}) {
  const { isOpen: isOpenGlobal, defaultTab: globalDefaultTab, closeSettings } = useSettingsUIStore()
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenGlobal
  const onClose = onCloseProp || closeSettings
  
  const [activeTab, setActiveTab] = useState('models')
  const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<any>(null)
  const [wasSettingsOpen, setWasSettingsOpen] = useState(false) // Track if settings was open before model drawer
  
  // Track screen size for responsive behavior
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 640) // sm breakpoint
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  // AI Models
  const [aiModels, setAiModels] = useState<any[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const { fetchModels, getModelsByProvider, selectedProvider, setSelectedProvider } = useAIModelStore()
  
  // Plugins
  const [plugins, setPlugins] = useState<any[]>([])
  const [isLoadingPlugins, setIsLoadingPlugins] = useState(false)
  
  // General Settings
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')
  const [language, setLanguage] = useState('zh-CN')
  const [theme, setTheme] = useState('dark')
  
  // Interface Settings
  const [fontSize, setFontSize] = useState('medium')
  const [compactMode, setCompactMode] = useState(false)
  const [showTimestamp, setShowTimestamp] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)

  // Chat Behavior (SillyTavern parity)
  const [autoSendGreeting, setAutoSendGreeting] = useState(true)
  const [openerTemplate, setOpenerTemplate] = useState('Hi {{char}}, I\'m {{user}}.')

  // Load settings from localStorage
  useEffect(() => {
    if (isOpen) {
      // Use global default tab or fallback to 'models'
      setActiveTab(globalDefaultTab || 'models')
      loadUserData()
      loadSettings()
      fetchAIModels()
      fetchPlugins()
    }
  }, [isOpen, globalDefaultTab])

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/users/current')
      const result = await response.json()
      if (result.success && result.data) {
        setUserId(result.data.id)
        setUserName(result.data.username || 'User')
        setUserEmail(result.data.email || '')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setLanguage(settings.language || 'zh-CN')
      setTheme(settings.theme || 'dark')
      setFontSize(settings.fontSize || 'medium')
      setCompactMode(settings.compactMode || false)
      setShowTimestamp(settings.showTimestamp !== false)
      setAutoScroll(settings.autoScroll !== false)
      setAutoSendGreeting(settings.autoSendGreeting !== false)
      setOpenerTemplate(settings.openerTemplate || 'Hi {{char}}, I\'m {{user}}.')
    }
  }

  const saveGeneralSettings = async () => {
    try {
      // 保存用户名和邮箱到数据库
      const response = await fetch('/api/users/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userName,
          email: userEmail || '',
        }),
      })

      const result = await response.json()
      if (!result.success) {
        toast.error(result.error || '保存用户信息失败')
        return
      }

      // 保存其他设置到localStorage
      const settings = {
        userName,
        language,
        theme,
        fontSize,
        compactMode,
        showTimestamp,
        autoScroll,
        autoSendGreeting,
        openerTemplate,
      }
      localStorage.setItem('app_settings', JSON.stringify(settings))
      toast.success('设置已保存')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('保存设置失败')
    }
  }

  const fetchAIModels = async () => {
    try {
      setIsLoadingModels(true)
      const response = await fetch('/api/ai-models')
      const data = await response.json()
      if (response.ok) {
        setAiModels(data.models || [])
      }
    } catch (error) {
      console.error('Error fetching AI models:', error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  const fetchPlugins = async () => {
    try {
      setIsLoadingPlugins(true)
      const response = await fetch('/api/plugins')
      const data = await response.json()
      if (response.ok) {
        setPlugins(data.plugins || [])
      }
    } catch (error) {
      console.error('Error fetching plugins:', error)
    } finally {
      setIsLoadingPlugins(false)
    }
  }

  const handleAddModel = () => {
    setEditingModel(null)
    setWasSettingsOpen(isOpen) // Remember if settings was open
    setIsModelDrawerOpen(true)
    // Don't close settings drawer, let them stack with proper z-index
  }

  const handleEditModel = (model: any) => {
    setEditingModel(model)
    setWasSettingsOpen(isOpen) // Remember if settings was open
    setIsModelDrawerOpen(true)
    // Don't close settings drawer, let them stack with proper z-index
  }

  const handleModelSaved = async () => {
    setIsModelDrawerOpen(false)
    setEditingModel(null)
    await fetchAIModels()
    await fetchModels()
    // Settings drawer will remain open if it was open before
  }

  const handleSetActiveModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/ai-models/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      })

      if (!response.ok) {
        throw new Error('Failed to set active model')
      }

      toast.success('已设为活跃模型')
      await fetchAIModels()
      await fetchModels()
    } catch (error) {
      console.error('Error setting active model:', error)
      toast.error('设置失败')
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('确定要删除这个模型配置吗？')) return

    try {
      const response = await fetch(`/api/ai-models/${modelId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete model')
      }

      toast.success('模型已删除')
      await fetchAIModels()
      await fetchModels()
    } catch (error) {
      console.error('Error deleting model:', error)
      toast.error('删除失败')
    }
  }

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        await fetchPlugins()
        toast.success(enabled ? '插件已启用' : '插件已禁用')
      }
    } catch (error) {
      console.error('Error toggling plugin:', error)
      toast.error('操作失败')
    }
  }

  const handleExportData = async () => {
    try {
      // 收集所有本地存储数据
      const localStorageData: Record<string, string> = {}
      
      // 收集所有相关的 localStorage 项
      const keysToExport = [
        'app_settings',
        'ai-models-storage',
        'provider-configs-storage',
        'chat_streaming_enabled',
        'chat_fast_mode_enabled',
        'creative_settings',
        'regex_scripts',
        'locale',
        'regex_scripts_initialized',
      ]
      
      keysToExport.forEach(key => {
        const value = localStorage.getItem(key)
        if (value !== null) {
          localStorageData[key] = value
        }
      })

      // 获取当前用户信息
      let userData = null
      try {
        const response = await fetch('/api/users/current')
        const result = await response.json()
        if (result.success && result.data) {
          userData = {
            username: result.data.username,
            email: result.data.email,
          }
        }
      } catch (error) {
        console.log('无法获取用户信息，将跳过用户数据导出')
      }

      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        user: userData,
        localStorage: localStorageData,
        metadata: {
          exportedFrom: window.location.hostname,
          userAgent: navigator.userAgent,
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sillytavern-backup-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('数据已导出，包含所有配置信息')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('导出失败')
    }
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        // 验证数据格式
        if (!data.version || !data.localStorage) {
          toast.error('文件格式不正确，请检查导出文件')
          return
        }

        // 恢复所有 localStorage 数据
        Object.entries(data.localStorage).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value)
          }
        })

        // 如果有用户数据，同步到数据库
        if (data.user && (data.user.username || data.user.email)) {
          try {
            const response = await fetch('/api/users/current', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: data.user.username || undefined,
                email: data.user.email || undefined,
              }),
            })

            const result = await response.json()
            if (!result.success) {
              console.warn('用户信息同步失败:', result.error)
              toast('配置已导入，但用户信息同步失败', { icon: '⚠️' })
            } else {
              toast.success('所有数据已导入，即将刷新页面...')
            }
          } catch (error) {
            console.error('用户信息同步错误:', error)
            toast('配置已导入，但用户信息同步失败', { icon: '⚠️' })
          }
        } else {
          toast.success('配置已导入，即将刷新页面...')
        }

        // 刷新页面以应用所有更改
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } catch (error) {
        console.error('Import error:', error)
        toast.error('导入失败，请检查文件格式')
      }
    }
    input.click()
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[90%] sm:w-[500px] lg:w-[600px] p-0 flex flex-col overflow-hidden" hideOverlay={isDesktop}>
          {/* Header with proper accessibility components */}
          <SheetHeader className="px-6 py-4 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <IconSettings className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-xl font-semibold text-gray-100">
                  设置中心
                </SheetTitle>
                <SheetDescription className="text-xs text-gray-400 mt-0.5">
                  配置应用程序和个人偏好
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-6 mt-3 grid w-[calc(100%-3rem)] grid-cols-4 flex-shrink-0">
              <TabsTrigger value="general" className="text-xs min-h-[44px] md:min-h-[auto]">
                <IconUser className="w-3.5 h-3.5 mr-1.5" />
                常规
              </TabsTrigger>
              <TabsTrigger value="models" className="text-xs min-h-[44px] md:min-h-[auto]">
                <IconDatabase className="w-3.5 h-3.5 mr-1.5" />
                模型
              </TabsTrigger>
              <TabsTrigger value="interface" className="text-xs min-h-[44px] md:min-h-[auto]">
                <IconPalette className="w-3.5 h-3.5 mr-1.5" />
                界面
              </TabsTrigger>
              <TabsTrigger value="plugins" className="text-xs min-h-[44px] md:min-h-[auto]">
                <IconPuzzle className="w-3.5 h-3.5 mr-1.5" />
                插件
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-4 mt-0 pb-20 md:pb-4">
              <div className="space-y-6">
                {/* 用户ID - 只读显示 */}
                <div>
                  <Label htmlFor="userId" className="text-sm text-gray-300">用户ID</Label>
                  <Input
                    id="userId"
                    value={userId}
                    readOnly
                    disabled
                    className="tavern-input mt-2 bg-gray-900/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">您的唯一用户标识</p>
                </div>

                {/* 用户名 */}
                <div>
                  <Label htmlFor="userName" className="text-sm text-gray-300">
                    用户名
                    <span className="text-yellow-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="请设置您的用户名"
                    className="tavern-input mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">建议设置一个个性化的用户名</p>
                </div>

                {/* 邮箱绑定 */}
                <div>
                  <Label htmlFor="userEmail" className="text-sm text-gray-300">绑定邮箱</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="请输入您的邮箱地址"
                    className="tavern-input mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">用于找回账号和接收通知（无需验证）</p>
                </div>

                <div>
                  <Label htmlFor="language" className="text-sm text-gray-300">语言</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mt-2 w-full h-10 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="theme" className="text-sm text-gray-300">主题</Label>
                  <select
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mt-2 w-full h-10 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="light">浅色</option>
                    <option value="dark">深色</option>
                    <option value="auto">跟随系统</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-1">
                    <Button onClick={saveGeneralSettings} className="tavern-button">
                      <IconDeviceFloppy className="w-4 h-4 mr-2" />
                      保存设置
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleExportData} variant="outline" size="sm" className="tavern-button-secondary">
                      <IconDownload className="w-4 h-4 mr-2" />
                      导出
                    </Button>
                    <Button onClick={handleImportData} variant="outline" size="sm" className="tavern-button-secondary">
                      <IconUpload className="w-4 h-4 mr-2" />
                      导入
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Models Tab - New Provider View */}
            <TabsContent value="models" className="flex-1 flex flex-row min-h-0 mt-0">
              {/* Left: Provider List */}
              <ProviderList
                selectedProvider={selectedProvider}
                onSelectProvider={setSelectedProvider}
                onProviderAdded={(provider) => {
                  setSelectedProvider(provider)
                  fetchAIModels()
                }}
              />

              {/* Right: Provider Config Panel */}
              {selectedProvider && (
                <ProviderConfigPanel
                  provider={selectedProvider}
                  models={aiModels.filter((m) => m.provider === selectedProvider)}
                  onAddModel={handleAddModel}
                  onEditModel={handleEditModel}
                  onDeleteModel={(model) => handleDeleteModel(model.id)}
                  onSetActiveModel={(model) => handleSetActiveModel(model.id)}
                  onRefreshModels={fetchAIModels}
                  isLoading={isLoadingModels}
                />
              )}
              
              {!selectedProvider && (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p className="text-sm">请从左侧选择或添加供应商</p>
                </div>
              )}
            </TabsContent>

            {/* Interface Settings Tab */}
            <TabsContent value="interface" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-4 mt-0 pb-20 md:pb-4">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="fontSize" className="text-sm text-gray-300">字体大小</Label>
                  <select
                    id="fontSize"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="mt-2 w-full h-10 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {/* Auto-send greeting */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div>
                      <Label className="text-sm text-gray-300">新建对话自动发送角色问候</Label>
                      <p className="text-xs text-gray-500 mt-0.5">开启后，新对话会先显示角色 greeting</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoSendGreeting}
                        onChange={(e) => setAutoSendGreeting(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Opener template */}
                  <div className="p-3 rounded-lg bg-gray-800/50">
                    <Label className="text-sm text-gray-300">开场白模板</Label>
                    <p className="text-xs text-gray-500 mt-0.5">{'支持占位符：{{user}}, {{char}}, {{scenario}}'}</p>
                    <textarea
                      value={openerTemplate}
                      onChange={(e) => setOpenerTemplate(e.target.value)}
                      className="mt-2 w-full min-h-[80px] rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Hi {{char}}, I'm {{user}}."
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div>
                      <Label className="text-sm text-gray-300">紧凑模式</Label>
                      <p className="text-xs text-gray-500 mt-0.5">减少界面间距</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={compactMode}
                        onChange={(e) => setCompactMode(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div>
                      <Label className="text-sm text-gray-300">显示时间戳</Label>
                      <p className="text-xs text-gray-500 mt-0.5">在消息旁显示时间</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showTimestamp}
                        onChange={(e) => setShowTimestamp(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div>
                      <Label className="text-sm text-gray-300">自动滚动</Label>
                      <p className="text-xs text-gray-500 mt-0.5">新消息时自动滚动到底部</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <Button onClick={saveGeneralSettings} className="w-full tavern-button">
                  <IconDeviceFloppy className="w-4 h-4 mr-2" />
                  保存界面设置
                </Button>
              </div>
            </TabsContent>

            {/* Plugins Tab */}
            <TabsContent value="plugins" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-4 mt-0 pb-20 md:pb-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-300">插件管理</h3>
                  <Button size="sm" variant="outline" className="tavern-button-secondary text-xs">
                    <IconPlus className="w-3 h-3 mr-1" />
                    安装插件
                  </Button>
                </div>

                {isLoadingPlugins ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-100"></div>
                  </div>
                ) : plugins.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <IconPuzzle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-sm mb-2">还没有安装插件</p>
                    <p className="text-xs text-gray-600">点击"安装插件"按钮添加插件</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plugins.map((plugin) => (
                      <div
                        key={plugin.id}
                        className="p-4 border border-gray-700 rounded-lg bg-gray-800/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-200 mb-1">{plugin.name}</h4>
                            <p className="text-sm text-gray-400 mb-2">
                              {plugin.description || '无描述'}
                            </p>
                            <p className="text-xs text-gray-500">
                              v{plugin.version} by {plugin.author || 'Unknown'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={plugin.enabled}
                                onChange={(e) => handleTogglePlugin(plugin.id, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* AI Model Configuration Drawer - Higher z-index to appear above settings */}
      <div className={isModelDrawerOpen ? "model-drawer-wrapper" : ""}>
        <AIModelDrawer
          isOpen={isModelDrawerOpen}
          onClose={() => setIsModelDrawerOpen(false)}
          editingModel={editingModel}
          onModelCreated={handleModelSaved}
          onModelUpdated={handleModelSaved}
        />
      </div>
      
      <style jsx global>{`
        .model-drawer-wrapper [data-radix-dialog-overlay] {
          z-index: 110 !important;
        }
        .model-drawer-wrapper [data-radix-dialog-content] {
          z-index: 110 !important;
        }
      `}</style>
    </>
  )
}
