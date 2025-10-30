/**
 * Redis 缓存适配器
 * 替换内存缓存，支持跨实例共享和持久化
 */

import { createClient, RedisClientType } from 'redis'

class RedisCache {
  private client: RedisClientType | null = null
  private isConnected = false
  private hitCount = 0
  private missCount = 0

  async connect() {
    if (this.isConnected) return

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('[Redis] Max reconnect attempts reached')
              return new Error('Max reconnect attempts reached')
            }
            return retries * 100
          }
        }
      })

      this.client.on('error', (err) => {
        console.error('[Redis] Client error:', err)
      })

      this.client.on('connect', () => {
        console.log('[Redis] Connected to Redis server')
      })

      this.client.on('reconnecting', () => {
        console.log('[Redis] Reconnecting...')
      })

      await this.client.connect()
      this.isConnected = true
      console.log('[Redis] Connection initialized successfully')
    } catch (error) {
      console.error('[Redis] Failed to connect:', error)
      throw error
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit()
      this.isConnected = false
      console.log('[Redis] Disconnected')
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      await this.connect()
    }

    try {
      const value = await this.client!.get(key)
      
      if (!value) {
        this.missCount++
        return null
      }

      this.hitCount++
      return JSON.parse(value) as T
    } catch (error) {
      console.error('[Redis] Get error:', error)
      this.missCount++
      return null
    }
  }

  async set<T>(key: string, value: T, ttl: number = 60): Promise<void> {
    if (!this.isConnected || !this.client) {
      await this.connect()
    }

    try {
      const serialized = JSON.stringify(value)
      await this.client!.setEx(key, Math.ceil(ttl / 1000), serialized)
    } catch (error) {
      console.error('[Redis] Set error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return

    try {
      await this.client!.del(key)
    } catch (error) {
      console.error('[Redis] Delete error:', error)
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected || !this.client) return

    try {
      await this.client!.flushDb()
      this.hitCount = 0
      this.missCount = 0
      console.log('[Redis] Cache cleared')
    } catch (error) {
      console.error('[Redis] Clear error:', error)
    }
  }

  async getStats() {
    const total = this.hitCount + this.missCount
    const hitRate = total > 0 ? (this.hitCount / total * 100).toFixed(2) : '0'

    let redisInfo: any = {}
    if (this.isConnected && this.client) {
      try {
        const dbSize = await this.client.dbSize()
        const memoryUsage = await this.getMemoryUsage()
        redisInfo = {
          connected: this.isConnected,
          keys: dbSize,
          memoryUsage
        }
      } catch (error) {
        console.error('[Redis] Stats error:', error)
      }
    }

    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
      total,
      ...redisInfo
    }
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    if (!this.isConnected || !this.client) return

    try {
      // 使用 KEYS 临时解决（小规模数据），生产环境可优化为 SCAN 迭代器
      const keys = await this.client!.keys(`${prefix}*`)

      if (keys.length > 0) {
        await this.client!.del(keys)
        console.log(`[Redis] Deleted ${keys.length} keys with prefix: ${prefix}`)
      }
    } catch (error) {
      console.error('[Redis] Delete by prefix error:', error)
    }
  }

  private async getMemoryUsage(): Promise<string> {
    if (!this.client) return 'N/A'
    
    try {
      const info = await this.client.info('memory')
      const match = info.match(/used_memory_human:(\S+)/)
      return match ? match[1] : 'N/A'
    } catch {
      return 'N/A'
    }
  }
}

// 单例实例
export const redisCache = new RedisCache()

// 便捷函数（保持与内存缓存相同的接口）
export async function getCached<T>(key: string): Promise<T | null> {
  return redisCache.get<T>(key)
}

export async function setCache<T>(key: string, data: T, ttl: number = 60000) {
  await redisCache.set(key, data, ttl)
}

export async function deleteCache(key: string) {
  await redisCache.delete(key)
}

export async function clearCache() {
  await redisCache.clear()
}

export async function getCacheStats() {
  return redisCache.getStats()
}

export async function invalidateCacheByPrefix(prefix: string) {
  await redisCache.deleteByPrefix(prefix)
}

// 缓存键生成器（与内存缓存保持一致）
export const CacheKeys = {
  character: (id: string) => `char:${id}`,
  characterList: (userId: string) => `char:list:${userId}`,
  chat: (id: string) => `chat:${id}`,
  worldInfo: (characterId: string) => `wi:${characterId}`,
  worldInfoEntry: (id: string) => `wi:entry:${id}`,
  messages: (chatId: string, limit: number) => `msg:${chatId}:${limit}`,
  aiModel: (id: string) => `model:${id}`,
  aiModelList: (userId: string) => `model:list:${userId}`,
}

// TTL 配置（毫秒）
export const CacheTTL = {
  character: 5 * 60 * 1000,      // 5 分钟
  chat: 2 * 60 * 1000,           // 2 分钟
  worldInfo: 10 * 60 * 1000,     // 10 分钟
  messages: 1 * 60 * 1000,       // 1 分钟
  aiModel: 5 * 60 * 1000,        // 5 分钟
  list: 30 * 1000,               // 30 秒
}

// 初始化连接
redisCache.connect().catch((error) => {
  console.error('[Redis] Failed to initialize:', error)
  console.log('[Redis] Application will continue with degraded caching')
})

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('[Redis] Shutting down...')
  await redisCache.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('[Redis] Shutting down...')
  await redisCache.disconnect()
  process.exit(0)
})

