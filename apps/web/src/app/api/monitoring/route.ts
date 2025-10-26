import { NextRequest, NextResponse } from 'next/server'
import { db } from '@sillytavern-clone/database'
import { apiCache, characterCache, chatCache } from '@/lib/cache'
import { withErrorHandler } from '@/lib/errors'
import os from 'os'

interface SystemMetrics {
  timestamp: string
  uptime: number
  memory: {
    total: number
    used: number
    free: number
    usagePercent: number
  }
  cpu: {
    cores: number
    loadAverage: number[]
  }
  cache: {
    api: { size: number }
    characters: { size: number }
    chats: { size: number }
  }
  database: {
    characters: number
    chats: number
    messages: number
    worldInfo: number
    plugins: number
  }
  nodejs: {
    version: string
    memoryUsage: NodeJS.MemoryUsage
  }
}

async function getSystemMetrics(): Promise<SystemMetrics> {
  // Memory info
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  const usedMemory = totalMemory - freeMemory

  // Database counts
  const [
    characterCount,
    chatCount,
    messageCount,
    worldInfoCount,
    pluginCount
  ] = await Promise.all([
    db.count('Character', {}),
    db.count('Chat', {}),
    db.count('Message', {}),
    db.count('WorldInfo', {}),
    db.count('Plugin', {}),
  ])

  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      usagePercent: (usedMemory / totalMemory) * 100,
    },
    cpu: {
      cores: os.cpus().length,
      loadAverage: os.loadavg(),
    },
    cache: {
      api: { size: apiCache.size() },
      characters: { size: characterCache.size() },
      chats: { size: chatCache.size() },
    },
    database: {
      characters: characterCount,
      chats: chatCount,
      messages: messageCount,
      worldInfo: worldInfoCount,
      plugins: pluginCount,
    },
    nodejs: {
      version: process.version,
      memoryUsage: process.memoryUsage(),
    },
  }
}

async function GET(request: NextRequest) {
  const metrics = await getSystemMetrics()
  return NextResponse.json(metrics)
}

async function POST(request: NextRequest) {
  const body = await request.json()
  const action = body.action

  switch (action) {
    case 'clearCache':
      apiCache.clear()
      characterCache.clear()
      chatCache.clear()
      return NextResponse.json({ success: true, message: 'All caches cleared' })

    case 'gc':
      if (global.gc) {
        global.gc()
        return NextResponse.json({ success: true, message: 'Garbage collection triggered' })
      }
      return NextResponse.json({ success: false, message: 'GC not available' }, { status: 400 })

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

const GETHandler = withErrorHandler(GET)
const POSTHandler = withErrorHandler(POST)

export { GETHandler as GET, POSTHandler as POST }

