/**
 * Prisma client configuration
 */

import { PrismaClient } from '@prisma/client'

// Extend Prisma Client for custom methods
declare global {
  var __prisma: PrismaClient | undefined
}

const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export { prisma }
export default prisma

// Helper functions for common operations
export class DatabaseService {
  private client: PrismaClient

  constructor() {
    this.client = prisma
  }

  // Health check
  async healthCheck() {
    try {
      await this.client.$queryRaw`SELECT 1`
      return { status: 'healthy', timestamp: new Date().toISOString() }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  // Generic CRUD operations (forgiving API to match various call sites)
  async create<T>(model: string, data: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.create({ data })
  }

  async findById<T>(model: string, id: string) {
    const modelClient = (this.client as any)[model]
    return modelClient.findUnique({ where: { id } })
  }

  async findUnique<T>(model: string, whereOrId: any) {
    const modelClient = (this.client as any)[model]
    if (typeof whereOrId === 'string') {
      return modelClient.findUnique({ where: { id: whereOrId } })
    }
    // If caller passed plain where (e.g., { id: '...' } or { name: '...' })
    if (whereOrId && !('where' in whereOrId)) {
      return modelClient.findUnique({ where: whereOrId })
    }
    return modelClient.findUnique(whereOrId)
  }

  async findMany<T>(model: string, options?: any) {
    const modelClient = (this.client as any)[model]
    if (!options) return modelClient.findMany()
    // Accept either full options or plain where
    if ('where' in options || 'orderBy' in options || 'skip' in options || 'take' in options || 'include' in options || 'select' in options) {
      return modelClient.findMany(options)
    }
    return modelClient.findMany({ where: options })
  }

  async findFirst<T>(model: string, options?: any) {
    const modelClient = (this.client as any)[model]
    if (!options) return modelClient.findFirst()
    // Accept either full options or plain where
    if ('where' in options || 'orderBy' in options || 'skip' in options || 'take' in options || 'include' in options || 'select' in options) {
      return modelClient.findFirst(options)
    }
    return modelClient.findFirst({ where: options })
  }

  async update<T>(model: string, whereOrId: any, data: any) {
    const modelClient = (this.client as any)[model]
    if (typeof whereOrId === 'string') {
      return modelClient.update({ where: { id: whereOrId }, data })
    }
    if (whereOrId && !('where' in whereOrId)) {
      return modelClient.update({ where: whereOrId, data })
    }
    return modelClient.update({ ...(whereOrId || {}), data })
  }

  async delete<T>(model: string, whereOrId: any) {
    const modelClient = (this.client as any)[model]
    if (typeof whereOrId === 'string') {
      return modelClient.delete({ where: { id: whereOrId } })
    }
    if (whereOrId && !('where' in whereOrId)) {
      return modelClient.delete({ where: whereOrId })
    }
    return modelClient.delete(whereOrId)
  }

  // Batch operations
  async createMany<T>(model: string, data: any[]) {
    const modelClient = (this.client as any)[model]
    return modelClient.createMany({ data })
  }

  async updateMany<T>(model: string, where: any, data: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.updateMany({ where, data })
  }

  async deleteMany<T>(model: string, where: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.deleteMany({ where })
  }

  // Count operations
  async count<T>(model: string, options?: any) {
    const modelClient = (this.client as any)[model]
    if (!options) return modelClient.count()
    // If options already includes `where`, pass as-is
    if ('where' in options || 'select' in options || 'orderBy' in options) {
      return modelClient.count(options)
    }
    // Treat options as plain where filter
    return modelClient.count({ where: options })
  }

  // Transaction support
  async transaction<T>(callback: (tx: any) => Promise<T>) {
    return this.client.$transaction(callback as any)
  }

  // Raw query support (for pgvector and advanced queries)
  get $executeRaw() {
    return this.client.$executeRaw.bind(this.client)
  }

  get $queryRaw() {
    return this.client.$queryRaw.bind(this.client)
  }

  // Disconnect
  async disconnect() {
    await this.client.$disconnect()
  }
}

export const db = new DatabaseService()