/**
 * 数据库缓存层
 * 支持内存缓存和 Redis 缓存（根据环境变量自动选择）
 */

// 检测是否使用 Redis
const USE_REDIS = process.env.REDIS_URL !== undefined || process.env.USE_REDIS === 'true'

interface CacheEntry<T> {
  data: T
  expiry: number
}

class DatabaseCache {
  private cache = new Map<string, CacheEntry<any>>()
  private hitCount = 0
  private missCount = 0

  /**
   * 获取缓存数据
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.missCount++
      return null
    }
    
    // 检查是否过期
    if (entry.expiry < Date.now()) {
      this.cache.delete(key)
      this.missCount++
      return null
    }
    
    this.hitCount++
    return entry.data as T
  }

  /**
   * 设置缓存数据
   */
  set<T>(key: string, data: T, ttl: number = 60000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
    
    // 限制缓存大小（防止内存溢出）
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
  }

  /**
   * 删除缓存数据
   */
  delete(key: string) {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.hitCount + this.missCount
    const hitRate = total > 0 ? (this.hitCount / total * 100).toFixed(2) : '0'
    
    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
      total
    }
  }

  /**
   * 根据前缀删除缓存（用于无效化相关缓存）
   */
  deleteByPrefix(prefix: string) {
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }
    
    for (const key of keysToDelete) {
      this.cache.delete(key)
    }
  }
}

// 单例实例
export const dbCache = new DatabaseCache()

// 便捷函数
export function getCached<T>(key: string): T | null {
  return dbCache.get<T>(key)
}

export function setCache<T>(key: string, data: T, ttl: number = 60000) {
  dbCache.set(key, data, ttl)
}

export function deleteCache(key: string) {
  dbCache.delete(key)
}

export function clearCache() {
  dbCache.clear()
}

export function getCacheStats() {
  return dbCache.getStats()
}

export function invalidateCacheByPrefix(prefix: string) {
  dbCache.deleteByPrefix(prefix)
}

// 缓存键生成器
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
  list: 30 * 1000,               // 30 秒（列表更新更频繁）
}

// 在初始化时打印使用的缓存类型
if (typeof window === 'undefined') {
  console.log(`[Cache] Using ${USE_REDIS ? 'Redis' : 'Memory'} cache`)
}

