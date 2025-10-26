/**
 * Simple in-memory cache with TTL support
 */
export class Cache<T = any> {
  private cache: Map<string, { value: T; expiry: number }> = new Map()
  private readonly defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.defaultTTL = defaultTTL

    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60 * 1000) // Every minute
  }

  set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expiry })
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }

  size(): number {
    this.cleanup() // Clean before counting
    return this.cache.size
  }
}

/**
 * LRU Cache with size limit
 */
export class LRUCache<T = any> {
  private cache: Map<string, T> = new Map()
  private readonly maxSize: number

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key)

    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }

    return value
  }

  set(key: string, value: T): void {
    // Remove if exists (will add to end)
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Add to end
    this.cache.set(key, value)

    // Remove oldest if over limit
    if (this.cache.size > this.maxSize) {
      const first = this.cache.keys().next()
      const firstKey = first && first.value as string | undefined
      if (typeof firstKey === 'string') {
        this.cache.delete(firstKey)
      }
    }
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Global cache instances
export const apiCache = new Cache(5 * 60 * 1000) // 5 minutes
export const characterCache = new LRUCache(50) // 50 characters
export const chatCache = new LRUCache(20) // 20 chats

/**
 * Cache decorator for async functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    cache?: Cache
    keyFn?: (...args: Parameters<T>) => string
    ttl?: number
  } = {}
): T {
  const cache = options.cache || apiCache
  const keyFn = options.keyFn || ((...args) => JSON.stringify(args))

  return (async (...args: Parameters<T>) => {
    const key = keyFn(...args)

    // Check cache
    const cached = cache.get(key)
    if (cached !== undefined) {
      return cached
    }

    // Execute function
    const result = await fn(...args)

    // Store in cache
    cache.set(key, result, options.ttl)

    return result
  }) as T
}

/**
 * Memoize function results (sync version)
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number
    keyFn?: (...args: Parameters<T>) => string
  } = {}
): T {
  const cache = new LRUCache(options.maxSize || 100)
  const keyFn = options.keyFn || ((...args) => JSON.stringify(args))

  return ((...args: Parameters<T>) => {
    const key = keyFn(...args)

    // Check cache
    if (cache.has(key)) {
      return cache.get(key)!
    }

    // Execute function
    const result = fn(...args)

    // Store in cache
    cache.set(key, result)

    return result
  }) as T
}

