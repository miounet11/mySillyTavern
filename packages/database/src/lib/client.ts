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

  // Generic CRUD operations
  async create<T>(model: keyof PrismaClient, data: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.create({ data })
  }

  async findById<T>(model: keyof PrismaClient, id: string) {
    const modelClient = (this.client as any)[model]
    return modelClient.findUnique({ where: { id } })
  }

  async findMany<T>(model: keyof PrismaClient, options?: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.findMany(options)
  }

  async update<T>(model: keyof PrismaClient, id: string, data: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.update({ where: { id }, data })
  }

  async delete<T>(model: keyof PrismaClient, id: string) {
    const modelClient = (this.client as any)[model]
    return modelClient.delete({ where: { id } })
  }

  // Batch operations
  async createMany<T>(model: keyof PrismaClient, data: any[]) {
    const modelClient = (this.client as any)[model]
    return modelClient.createMany({ data })
  }

  async updateMany<T>(model: keyof PrismaClient, where: any, data: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.updateMany({ where, data })
  }

  async deleteMany<T>(model: keyof PrismaClient, where: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.deleteMany({ where })
  }

  // Count operations
  async count<T>(model: keyof PrismaClient, where?: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.count({ where })
  }

  // Transaction support
  async transaction<T>(callback: (tx: PrismaClient) => Promise<T>) {
    return this.client.$transaction(callback)
  }

  // Disconnect
  async disconnect() {
    await this.client.$disconnect()
  }
}

export const db = new DatabaseService()