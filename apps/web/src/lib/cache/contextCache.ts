/**
 * 上下文缓存层
 * 缓存 World Info 激活结果和 token 计数，减少重复计算
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export class ContextCache {
  private cache: Map<string, CacheEntry<any>>
  private ttl: number // 默认 TTL（毫秒）
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(ttlSeconds: number = 300) {
    this.cache = new Map()
    this.ttl = ttlSeconds * 1000
    
    // 启动定期清理
    this.startCleanup()
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl ? customTtl * 1000 : this.ttl
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }
    
    this.cache.set(key, entry)
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    const validEntries = entries.filter(([, entry]) => entry.expiresAt > now)
    
    return {
      total: this.cache.size,
      valid: validEntries.length,
      expired: this.cache.size - validEntries.length
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    // 每 60 秒清理一次过期缓存
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const keysToDelete: string[] = []
      
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          keysToDelete.push(key)
        }
      }
      
      for (const key of keysToDelete) {
        this.cache.delete(key)
      }
      
      if (keysToDelete.length > 0) {
        console.log(`[Context Cache] Cleaned up ${keysToDelete.length} expired entries`)
      }
    }, 60000)
  }

  /**
   * 停止清理
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// 创建单例实例
const cacheEnabled = process.env.WORLDINFO_CACHE_ENABLED === 'true'
const cacheTTL = parseInt(process.env.WORLDINFO_CACHE_TTL || '300')

export const contextCache = cacheEnabled 
  ? new ContextCache(cacheTTL)
  : null

/**
 * World Info 激活结果缓存辅助函数
 */
export function getCachedWorldInfoActivation(
  characterId: string,
  messageHash: string
): any | null {
  if (!contextCache) return null
  
  const key = `worldinfo:${characterId}:${messageHash}`
  return contextCache.get(key)
}

export function setCachedWorldInfoActivation(
  characterId: string,
  messageHash: string,
  activatedEntries: any[]
): void {
  if (!contextCache) return
  
  const key = `worldinfo:${characterId}:${messageHash}`
  contextCache.set(key, activatedEntries)
}

/**
 * Token 计数缓存辅助函数
 */
export function getCachedTokenCount(
  text: string,
  model: string
): number | null {
  if (!contextCache) return null
  
  // 使用文本的哈希（简化为前100字符 + 长度）
  const textHash = `${text.substring(0, 100)}:${text.length}`
  const key = `tokens:${model}:${textHash}`
  return contextCache.get(key)
}

export function setCachedTokenCount(
  text: string,
  model: string,
  count: number
): void {
  if (!contextCache) return
  
  const textHash = `${text.substring(0, 100)}:${text.length}`
  const key = `tokens:${model}:${textHash}`
  contextCache.set(key, count)
}

console.log(`[Context Cache] ${cacheEnabled ? 'Enabled' : 'Disabled'} (TTL: ${cacheTTL}s)`)

