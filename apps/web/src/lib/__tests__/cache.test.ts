import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Cache, LRUCache, memoize } from '../cache'

describe('Cache', () => {
  let cache: Cache

  beforeEach(() => {
    cache = new Cache(1000) // 1 second TTL
  })

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined()
  })

  it('should expire values after TTL', async () => {
    cache.set('key1', 'value1', 100) // 100ms TTL
    expect(cache.get('key1')).toBe('value1')

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should check if key exists', () => {
    cache.set('key1', 'value1')
    expect(cache.has('key1')).toBe(true)
    expect(cache.has('nonexistent')).toBe(false)
  })

  it('should delete values', () => {
    cache.set('key1', 'value1')
    cache.delete('key1')
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should clear all values', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.clear()
    expect(cache.size()).toBe(0)
  })
})

describe('LRUCache', () => {
  let cache: LRUCache

  beforeEach(() => {
    cache = new LRUCache(3) // Max 3 items
  })

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should evict least recently used item', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    cache.set('key4', 'value4') // This should evict key1

    expect(cache.get('key1')).toBeUndefined()
    expect(cache.get('key2')).toBe('value2')
    expect(cache.get('key3')).toBe('value3')
    expect(cache.get('key4')).toBe('value4')
  })

  it('should update access order on get', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')

    // Access key1 to make it recently used
    cache.get('key1')

    // Add key4, should evict key2 (least recently used)
    cache.set('key4', 'value4')

    expect(cache.get('key1')).toBe('value1')
    expect(cache.get('key2')).toBeUndefined()
    expect(cache.get('key3')).toBe('value3')
    expect(cache.get('key4')).toBe('value4')
  })

  it('should report correct size', () => {
    expect(cache.size()).toBe(0)
    cache.set('key1', 'value1')
    expect(cache.size()).toBe(1)
    cache.set('key2', 'value2')
    expect(cache.size()).toBe(2)
  })
})

describe('memoize', () => {
  it('should cache function results', () => {
    let callCount = 0
    const fn = memoize((x: number) => {
      callCount++
      return x * 2
    })

    expect(fn(5)).toBe(10)
    expect(callCount).toBe(1)

    // Second call should use cached result
    expect(fn(5)).toBe(10)
    expect(callCount).toBe(1)

    // Different argument should call function again
    expect(fn(10)).toBe(20)
    expect(callCount).toBe(2)
  })

  it('should respect maxSize option', () => {
    let callCount = 0
    const fn = memoize(
      (x: number) => {
        callCount++
        return x * 2
      },
      { maxSize: 2 }
    )

    fn(1)
    fn(2)
    fn(3) // Should evict result for 1

    expect(callCount).toBe(3)

    fn(1) // Should call again since it was evicted
    expect(callCount).toBe(4)
  })
})

