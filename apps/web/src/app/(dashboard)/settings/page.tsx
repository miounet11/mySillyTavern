'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Settings, Database, Puzzle, Globe } from 'lucide-react'
import AIModelModal from '@/components/ai/AIModelModal'
import { useAIModelStore } from '@/stores/aiModelStore'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [aiModels, setAiModels] = useState<any[]>([])
  const [plugins, setPlugins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<any>(null)
  const { fetchModels } = useAIModelStore()
  
  // Tab state
  const [activeTab, setActiveTab] = useState('general')
  
  // General settings state
  const [userName, setUserName] = useState('User')
  const [language, setLanguage] = useState('zh-CN')
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState('medium')
  const [compactMode, setCompactMode] = useState(false)
  const [showTimestamp, setShowTimestamp] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [modelsRes, pluginsRes] = await Promise.all([
        fetch('/api/ai-models'),
        fetch('/api/plugins'),
      ])

      const [modelsData, pluginsData] = await Promise.all([
        modelsRes.json(),
        pluginsRes.json(),
      ])

      if (modelsRes.ok) setAiModels(modelsData.models || [])
      if (pluginsRes.ok) setPlugins(pluginsData.plugins || [])
    } catch (error) {
      console.error('Error fetching settings data:', error)
    } finally {
      setIsLoading(false)
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
        await fetchData()
      }
    } catch (error) {
      console.error('Error toggling plugin:', error)
    }
  }

  const handleAddModel = () => {
    setEditingModel(null)
    setIsModelModalOpen(true)
  }

  const handleEditModel = (model: any) => {
    setEditingModel(model)
    setIsModelModalOpen(true)
  }

  const handleModelSaved = async () => {
    setIsModelModalOpen(false)
    setEditingModel(null)
    await fetchData()
    await fetchModels() // 更新全局状态
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
      await fetchData()
      await fetchModels() // 更新全局状态
    } catch (error) {
      console.error('Error setting active model:', error)
      toast.error('设置失败')
    }
  }

  const handleSaveGeneralSettings = () => {
    // Save settings to localStorage
    const settings = {
      userName,
      language,
      theme,
      fontSize,
      compactMode,
      showTimestamp,
      autoScroll
    }
    localStorage.setItem('app_settings', JSON.stringify(settings))
    toast.success('设置已保存')
  }
  
  // Load settings from localStorage on mount
  useEffect(() => {
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
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-100">设置</h1>
        <p className="text-gray-400">
          配置应用程序设置和偏好
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            常规
          </TabsTrigger>
          <TabsTrigger value="ai-models" className="gap-2">
            <Database className="w-4 h-4" />
            AI 模型
          </TabsTrigger>
          <TabsTrigger value="plugins" className="gap-2">
            <Puzzle className="w-4 h-4" />
            插件
          </TabsTrigger>
          <TabsTrigger value="interface" className="gap-2">
            <Globe className="w-4 h-4" />
            界面
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">常规设置</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="user-name">用户名</Label>
                <Input
                  id="user-name"
                  type="text"
                  placeholder="你的名字"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="language">语言</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              <div>
                <Label htmlFor="theme">主题</Label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="auto">跟随系统</option>
                </select>
              </div>

              <Button className="mt-4" onClick={handleSaveGeneralSettings}>保存设置</Button>
            </div>
          </div>
        </TabsContent>

        {/* AI Models Settings */}
        <TabsContent value="ai-models" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">AI 模型配置</h2>
              <Button variant="outline" size="sm" onClick={handleAddModel}>添加模型</Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : aiModels.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-50" />
                <p className="text-gray-400 mb-4">还没有配置 AI 模型</p>
                <p className="text-sm text-gray-500 mb-6">点击上方"添加模型"按钮开始配置</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{model.name}</h3>
                      <p className="text-sm text-gray-500">
                        {model.provider} - {model.model}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.isActive ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded">
                          当前活跃
                        </span>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSetActiveModel(model.id)}
                          className="text-xs"
                        >
                          设为活跃
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEditModel(model)}>编辑</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Plugins Settings */}
        <TabsContent value="plugins" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">插件管理</h2>
              <Button variant="outline" size="sm">安装插件</Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : plugins.length === 0 ? (
              <div className="text-center py-12">
                <Puzzle className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-50" />
                <p className="text-gray-400 mb-4">还没有安装插件</p>
                <p className="text-sm text-gray-500 mb-6">点击上方"安装插件"按钮添加插件</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{plugin.name}</h3>
                      <p className="text-sm text-gray-500">
                        {plugin.description || '无描述'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                      <Button variant="outline" size="sm">配置</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Interface Settings */}
        <TabsContent value="interface" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">界面设置</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>紧凑模式</Label>
                  <p className="text-sm text-gray-500">减少界面间距</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>显示时间戳</Label>
                  <p className="text-sm text-gray-500">在消息旁显示时间</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showTimestamp}
                    onChange={(e) => setShowTimestamp(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动滚动</Label>
                  <p className="text-sm text-gray-500">新消息时自动滚动到底部</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <Label htmlFor="font-size">字体大小</Label>
                <select
                  id="font-size"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>

              <Button className="mt-4" onClick={handleSaveGeneralSettings}>保存设置</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Model Modal */}
      {isModelModalOpen && (
        <AIModelModal
          isOpen={isModelModalOpen}
          onClose={() => {
            setIsModelModalOpen(false)
            setEditingModel(null)
          }}
          editingModel={editingModel}
          onModelCreated={handleModelSaved}
          onModelUpdated={handleModelSaved}
        />
      )}
    </div>
  )
}

