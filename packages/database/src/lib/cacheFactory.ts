/**
 * 缓存工厂 - 根据环境变量选择使用内存或 Redis 缓存
 */

// 检测是否使用 Redis
const USE_REDIS = process.env.REDIS_URL !== undefined || process.env.USE_REDIS === 'true'

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
  list: 30 * 1000,               // 30 秒
}

// 导出统一的缓存函数
let cacheImpl: any

if (USE_REDIS) {
  // 使用 Redis 缓存
  console.log('[Cache Factory] Initializing Redis cache')
  import('./redisCache').then(module => {
    cacheImpl = module
  }).catch(err => {
    console.error('[Cache Factory] Failed to load Redis cache, falling back to memory cache:', err)
    import('./cache').then(module => {
      cacheImpl = module
    })
  })
} else {
  // 使用内存缓存
  console.log('[Cache Factory] Initializing memory cache')
  import('./cache').then(module => {
    cacheImpl = module
  })
}

// 统一的缓存接口
export async function getCached<T>(key: string): Promise<T | null> {
  if (!cacheImpl) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  if (cacheImpl && cacheImpl.getCached) {
    return cacheImpl.getCached(key) as Promise<T | null>
  }
  return null
}

export async function setCache<T>(key: string, data: T, ttl: number = 60000): Promise<void> {
  if (!cacheImpl) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return cacheImpl?.setCache(key, data, ttl)
}

export async function deleteCache(key: string): Promise<void> {
  if (!cacheImpl) return
  return cacheImpl?.deleteCache(key)
}

export async function clearCache(): Promise<void> {
  if (!cacheImpl) return
  return cacheImpl?.clearCache()
}

export async function getCacheStats() {
  if (!cacheImpl) return { type: 'not initialized' }
  return cacheImpl?.getCacheStats()
}

export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  if (!cacheImpl) return
  return cacheImpl?.invalidateCacheByPrefix(prefix)
}

