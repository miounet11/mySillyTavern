/**
 * Database package main export
 */

export * from './lib/client';
export * from './lib/seed';
export * from './lib/migrations';

// 导出统一的缓存接口（自动选择 Redis 或内存缓存）
export * from './lib/cacheFactory';