/**
 * Database migration utilities
 */

import { prisma } from './client'

export interface MigrationResult {
  success: boolean
  version?: string
  error?: string
  appliedMigrations?: string[]
}

export class MigrationService {
  async getCurrentVersion(): Promise<string | null> {
    try {
      // Get current database version from metadata or migrations table
      // For now, we'll use a simple approach with a metadata table
      const result: any = await prisma.$queryRawUnsafe(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations'`
      )

      if (result.length > 0) {
        const migration: any = await prisma.$queryRawUnsafe(
          'SELECT finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1'
        )
        return migration.length > 0 ? migration[0].finished_at : null
      }

      return null
    } catch (error) {
      console.error('Error getting current database version:', error)
      return null
    }
  }

  async runMigrations(): Promise<MigrationResult> {
    try {
      console.log('🔄 Running database migrations...')

      // Use Prisma's built-in migration system
      const { execSync } = require('child_process')

      // This would typically be run via CLI, but we'll call it programmatically
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        cwd: process.cwd()
      })

      console.log('✅ Migrations completed successfully')

      return {
        success: true,
        version: await this.getCurrentVersion() || undefined
      }
    } catch (error) {
      console.error('❌ Migration failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown migration error'
      }
    }
  }

  async resetDatabase(): Promise<MigrationResult> {
    try {
      console.log('🔄 Resetting database...')

      // Force reset and re-run migrations
      const { execSync } = require('child_process')

      execSync('npx prisma migrate reset --force', {
        stdio: 'inherit',
        cwd: process.cwd()
      })

      console.log('✅ Database reset completed')

      return {
        success: true,
        version: await this.getCurrentVersion() || undefined
      }
    } catch (error) {
      console.error('❌ Database reset failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown reset error'
      }
    }
  }

  async generateClient(): Promise<boolean> {
    try {
      console.log('🔄 Generating Prisma client...')

      const { execSync } = require('child_process')

      execSync('npx prisma generate', {
        stdio: 'inherit',
        cwd: process.cwd()
      })

      console.log('✅ Prisma client generated successfully')
      return true
    } catch (error) {
      console.error('❌ Client generation failed:', error)
      return false
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }

  async getDatabaseInfo() {
    try {
      const tables: any = await prisma.$queryRawUnsafe(
        `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'`
      )

      const tableInfo = await Promise.all(
        tables.map(async (table: any) => {
          const count: any = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM ${table.name}`
          )
          return {
            name: table.name,
            rowCount: count[0].count,
            sql: table.sql
          }
        })
      )

      return {
        connected: true,
        tables: tableInfo,
        totalTables: tables.length
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const migrationService = new MigrationService()