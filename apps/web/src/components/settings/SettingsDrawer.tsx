/**
 * Full-featured Settings drawer - right-side panel with all settings
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  User,
  Database,
  Puzzle,
  Palette,
  Save,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Power,
  X,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import AIModelDrawer from '@/components/ai/AIModelDrawer'
import { useAIModelStore } from '@/stores/aiModelStore'
import toast from 'react-hot-toast'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState('models')
  const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<any>(null)
  const [wasSettingsOpen, setWasSettingsOpen] = useState(false) // Track if settings was open before model drawer
  
  // AI Models
  const [aiModels, setAiModels] = useState<any[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const { fetchModels } = useAIModelStore()
  
  // Plugins
  const [plugins, setPlugins] = useState<any[]>([])
  const [isLoadingPlugins, setIsLoadingPlugins] = useState(false)
  
  // General Settings
  const [userName, setUserName] = useState('User')
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
      // Default to Models tab when opening
      setActiveTab('models')
      loadSettings()
      fetchAIModels()
      fetchPlugins()
    }
  }, [isOpen])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setUserName(settings.userName || 'User')
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

  const saveGeneralSettings = () => {
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
      const data = {
        settings: localStorage.getItem('app_settings'),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sillytavern-backup-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('数据已导出')
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

        if (data.settings) {
          localStorage.setItem('app_settings', data.settings)
        }

        toast.success('数据已导入，请刷新页面')
        setTimeout(() => window.location.reload(), 1500)
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
        <SheetContent 
          side="right" 
          className="w-[600px] p-0 flex flex-col overflow-hidden bg-gray-900/98 backdrop-blur-md border-l border-gray-800"
        >
          <SheetHeader className="px-6 py-4 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-semibold text-gray-100">
                    设置中心
                  </SheetTitle>
                  <p className="text-xs text-gray-400 mt-0.5">
                    配置应用程序和个人偏好
                  </p>
                </div>
              </div>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-6 mt-3 grid w-[calc(100%-3rem)] grid-cols-4 flex-shrink-0">
              <TabsTrigger value="general" className="text-xs">
                <User className="w-3.5 h-3.5 mr-1.5" />
                常规
              </TabsTrigger>
              <TabsTrigger value="models" className="text-xs">
                <Database className="w-3.5 h-3.5 mr-1.5" />
                模型
              </TabsTrigger>
              <TabsTrigger value="interface" className="text-xs">
                <Palette className="w-3.5 h-3.5 mr-1.5" />
                界面
              </TabsTrigger>
              <TabsTrigger value="plugins" className="text-xs">
                <Puzzle className="w-3.5 h-3.5 mr-1.5" />
                插件
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-4 mt-0">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="userName" className="text-sm text-gray-300">用户名</Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="你的名字"
                    className="tavern-input mt-2"
                  />
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
                      <Save className="w-4 h-4 mr-2" />
                      保存设置
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleExportData} variant="outline" size="sm" className="tavern-button-secondary">
                      <Download className="w-4 h-4 mr-2" />
                      导出
                    </Button>
                    <Button onClick={handleImportData} variant="outline" size="sm" className="tavern-button-secondary">
                      <Upload className="w-4 h-4 mr-2" />
                      导入
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Models Tab */}
            <TabsContent value="models" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-4 mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-300">AI 模型配置</h3>
                  <Button onClick={handleAddModel} size="sm" className="tavern-button">
                    <Plus className="w-4 h-4 mr-1" />
                    添加模型
                  </Button>
                </div>

                {isLoadingModels ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-100"></div>
                  </div>
                ) : aiModels.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Database className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-sm mb-2">还没有配置 AI 模型</p>
                    <p className="text-xs text-gray-600">点击"添加模型"按钮开始配置</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiModels.map((model) => (
                      <div
                        key={model.id}
                        className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-200">{model.name}</h4>
                              {model.isActive && (
                                <Badge variant="default" className="bg-green-600 text-white text-xs">
                                  活跃
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {model.provider} - {model.model}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!model.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetActiveModel(model.id)}
                                className="text-xs h-8"
                              >
                                <Power className="w-3 h-3 mr-1" />
                                启用
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditModel(model)}
                              className="text-xs h-8"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteModel(model.id)}
                              className="text-xs h-8 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Interface Settings Tab */}
            <TabsContent value="interface" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-4 mt-0">
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
                  <Save className="w-4 h-4 mr-2" />
                  保存界面设置
                </Button>
              </div>
            </TabsContent>

            {/* Plugins Tab */}
            <TabsContent value="plugins" className="flex-1 overflow-y-auto tavern-scrollbar px-6 py-4 mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-300">插件管理</h3>
                  <Button size="sm" variant="outline" className="tavern-button-secondary text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    安装插件
                  </Button>
                </div>

                {isLoadingPlugins ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-100"></div>
                  </div>
                ) : plugins.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Puzzle className="w-16 h-16 mx-auto mb-4 opacity-30" />
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
          z-index: 60 !important;
        }
        .model-drawer-wrapper [data-radix-dialog-content] {
          z-index: 60 !important;
        }
      `}</style>
    </>
  )
}
