import { db } from '@sillytavern-clone/database'
import { nanoid } from 'nanoid'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface LogMetadata {
  [key: string]: any
}

export class Logger {
  private static instance: Logger
  private isProduction: boolean

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString()
    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
  }

  private async persistLog(level: LogLevel, message: string, metadata?: LogMetadata): Promise<void> {
    try {
      await db.create('SystemLog', {
        id: nanoid(),
        level,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
    } catch (error) {
      // Don't throw error if logging fails, just console.error
      console.error('Failed to persist log:', error)
    }
  }

  async error(message: string, error?: Error | unknown, metadata?: LogMetadata): Promise<void> {
    const errorMetadata = {
      ...metadata,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }

    console.error(this.formatMessage('error', message, errorMetadata))
    
    if (this.isProduction) {
      await this.persistLog('error', message, errorMetadata)
    }
  }

  async warn(message: string, metadata?: LogMetadata): Promise<void> {
    console.warn(this.formatMessage('warn', message, metadata))
    
    if (this.isProduction) {
      await this.persistLog('warn', message, metadata)
    }
  }

  async info(message: string, metadata?: LogMetadata): Promise<void> {
    console.info(this.formatMessage('info', message, metadata))
    
    if (this.isProduction) {
      await this.persistLog('info', message, metadata)
    }
  }

  async debug(message: string, metadata?: LogMetadata): Promise<void> {
    if (!this.isProduction) {
      console.debug(this.formatMessage('debug', message, metadata))
    }
  }

  // Get recent logs
  static async getRecentLogs(level?: LogLevel, limit: number = 100): Promise<any[]> {
    const where = level ? { level } : {}
    
    return await db.findMany('SystemLog', {
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  }

  // Clear old logs
  static async clearOldLogs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await db.deleteMany('SystemLog', {
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    })

    return result.count || 0
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export convenience functions
export const logError = (message: string, error?: Error | unknown, metadata?: LogMetadata) =>
  logger.error(message, error, metadata)

export const logWarn = (message: string, metadata?: LogMetadata) =>
  logger.warn(message, metadata)

export const logInfo = (message: string, metadata?: LogMetadata) =>
  logger.info(message, metadata)

export const logDebug = (message: string, metadata?: LogMetadata) =>
  logger.debug(message, metadata)

