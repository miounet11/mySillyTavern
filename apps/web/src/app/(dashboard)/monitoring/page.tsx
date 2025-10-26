'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Trash2 } from 'lucide-react'

interface SystemMetrics {
  timestamp: string
  uptime: number
  memory: {
    total: number
    used: number
    free: number
    usagePercent: number
  }
  cpu: {
    cores: number
    loadAverage: number[]
  }
  cache: {
    api: { size: number }
    characters: { size: number }
    chats: { size: number }
  }
  database: {
    characters: number
    chats: number
    messages: number
    worldInfo: number
    plugins: number
  }
  nodejs: {
    version: string
    memoryUsage: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours}h ${minutes}m`
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring')
      const data = await response.json()
      setMetrics(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000) // Every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clearCache' }),
      })

      if (response.ok) {
        alert('缓存已清除')
        fetchMetrics()
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      alert('清除缓存失败')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">无法加载监控数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">系统监控</h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时系统性能和资源使用情况
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              最后更新: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">自动刷新</span>
          </label>
          
          <Button onClick={fetchMetrics} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            刷新
          </Button>
          
          <Button onClick={handleClearCache} variant="outline" size="sm" className="gap-2">
            <Trash2 className="w-4 h-4" />
            清除缓存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">系统信息</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">运行时间</span>
              <span className="font-medium">{formatUptime(metrics.uptime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Node.js</span>
              <span className="font-medium">{metrics.nodejs.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">CPU 核心</span>
              <span className="font-medium">{metrics.cpu.cores}</span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">内存使用</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">系统内存</span>
                <span className="text-sm font-medium">{metrics.memory.usagePercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${metrics.memory.usagePercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{formatBytes(metrics.memory.used)}</span>
                <span>{formatBytes(metrics.memory.total)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Heap 已用</span>
                <span className="font-medium">{formatBytes(metrics.nodejs.memoryUsage.heapUsed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Heap 总量</span>
                <span className="font-medium">{formatBytes(metrics.nodejs.memoryUsage.heapTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CPU Load */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">CPU 负载</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">1 分钟</span>
              <span className="font-medium">{metrics.cpu.loadAverage[0].toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">5 分钟</span>
              <span className="font-medium">{metrics.cpu.loadAverage[1].toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">15 分钟</span>
              <span className="font-medium">{metrics.cpu.loadAverage[2].toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Cache Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">缓存统计</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">API 缓存</span>
              <span className="font-medium">{metrics.cache.api.size} 项</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">角色缓存</span>
              <span className="font-medium">{metrics.cache.characters.size} 项</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">聊天缓存</span>
              <span className="font-medium">{metrics.cache.chats.size} 项</span>
            </div>
          </div>
        </div>

        {/* Database Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">数据库统计</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">角色数</span>
              <span className="font-medium">{metrics.database.characters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">聊天数</span>
              <span className="font-medium">{metrics.database.chats}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">消息数</span>
              <span className="font-medium">{metrics.database.messages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">世界信息</span>
              <span className="font-medium">{metrics.database.worldInfo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">插件数</span>
              <span className="font-medium">{metrics.database.plugins}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

