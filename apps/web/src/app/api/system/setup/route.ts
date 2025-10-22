import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Initialize database and seed with default data
    const { db, seedDatabase, migrationService } = await import('@sillytavern-clone/database')

    console.log('🚀 Starting system initialization...')

    // Check if database needs initialization
    const needsInit = await seedDatabase.needsSeeding()

    if (!needsInit) {
      return NextResponse.json({
        success: true,
        message: 'System already initialized',
        status: 'already_initialized'
      })
    }

    // Run migrations
    console.log('📋 Running database migrations...')
    const migrationResult = await migrationService.runMigrations()
    if (!migrationResult.success) {
      throw new Error(`Migration failed: ${migrationResult.error}`)
    }

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    const clientGenerated = await migrationService.generateClient()
    if (!clientGenerated) {
      throw new Error('Failed to generate Prisma client')
    }

    // Seed database with default data
    console.log('🌱 Seeding database with default data...')
    await seedDatabase.seedDatabase()

    console.log('✅ System initialization completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'System initialized successfully',
      status: 'initialized',
      details: {
        migration: migrationResult,
        seeded: true,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ System initialization failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'System initialization failed',
        error: error instanceof Error ? error.message : 'Unknown initialization error',
        status: 'initialization_failed'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { migrationService } = await import('@sillytavern-clone/database')

    // Check current system status
    const dbInfo = await migrationService.getDatabaseInfo()
    const connectionStatus = await migrationService.checkConnection()
    const currentVersion = await migrationService.getCurrentVersion()

    return NextResponse.json({
      success: true,
      status: connectionStatus ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      database: {
        connected: connectionStatus,
        version: currentVersion,
        info: dbInfo
      }
    })

  } catch (error) {
    console.error('❌ System status check failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'System status check failed',
        error: error instanceof Error ? error.message : 'Unknown status error',
        status: 'check_failed'
      },
      { status: 500 }
    )
  }
}