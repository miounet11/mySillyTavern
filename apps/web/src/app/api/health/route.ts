import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const dbHealth = await checkDatabase()

    // Check environment
    const envHealth = checkEnvironment()

    // Check system resources
    const systemHealth = await checkSystemResources()

    const health = {
      status: dbHealth.success && envHealth.success && systemHealth.success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        database: dbHealth,
        environment: envHealth,
        system: systemHealth
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown health check error'
      },
      { status: 500 }
    )
  }
}

async function checkDatabase() {
  try {
    // Simple database health check
    const { db } = await import('@sillytavern-clone/database')
    const result = await db.healthCheck()

    return {
      success: result.status === 'healthy',
      message: result.status === 'healthy' ? 'Database connected' : 'Database connection failed',
      details: result
    }
  } catch (error) {
    return {
      success: false,
      message: 'Database check failed',
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

function checkEnvironment() {
  try {
    const requiredVars = ['DATABASE_URL']
    const optionalVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY']

    const missing = requiredVars.filter(varName => !process.env[varName])
    const missingOptional = optionalVars.filter(varName => !process.env[varName])

    return {
      success: missing.length === 0,
      message: missing.length === 0 ? 'All required environment variables set' : `Missing required variables: ${missing.join(', ')}`,
      details: {
        required: {
          allSet: missing.length === 0,
          missing,
          count: requiredVars.length - missing.length
        },
        optional: {
          allSet: missingOptional.length === 0,
          missing: missingOptional,
          count: optionalVars.length - missingOptional.length
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Environment check failed',
      error: error instanceof Error ? error.message : 'Unknown environment error'
    }
  }
}

async function checkSystemResources() {
  try {
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()

    // Convert bytes to MB for readability
    const memoryMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }

    return {
      success: true,
      message: 'System resources OK',
      details: {
        uptime: {
          seconds: Math.round(uptime),
          formatted: formatUptime(uptime)
        },
        memory: memoryMB,
        process: {
          pid: process.pid,
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'System resource check failed',
      error: error instanceof Error ? error.message : 'Unknown system error'
    }
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}