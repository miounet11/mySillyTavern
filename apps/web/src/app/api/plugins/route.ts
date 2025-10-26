import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { nanoid } from 'nanoid'

const createPluginSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string().min(1).max(20),
  description: z.string().max(500).optional(),
  author: z.string().max(100).optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  license: z.string().max(50).optional(),
  keywords: z.array(z.string()).optional(),
  enabled: z.boolean().default(false),
  config: z.record(z.any()).optional(),
  manifest: z.object({
    entry: z.string(), // Entry point file
    permissions: z.array(z.string()).optional(),
    hooks: z.array(z.string()).optional(),
    dependencies: z.record(z.string()).optional(),
  }),
})

const querySchema = z.object({
  search: z.string().optional(),
  enabled: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const offset = (query.page - 1) * query.limit

    // Build where clause
    const where: any = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { author: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    if (query.enabled !== undefined) {
      where.enabled = query.enabled
    }

    // Get plugins with pagination
    const [plugins, total] = await Promise.all([
      db.findMany('Plugin', {
        where,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: query.limit,
      }),
      db.count('Plugin', { where })
    ])

    // Parse JSON fields
    const parsedPlugins = plugins.map((plugin: any) => ({
      ...plugin,
      keywords: plugin.keywords ? JSON.parse(plugin.keywords) : [],
      config: plugin.config ? JSON.parse(plugin.config) : {},
      manifest: plugin.manifest ? JSON.parse(plugin.manifest) : {},
    }))

    const totalPages = Math.ceil(total / query.limit)

    return NextResponse.json({
      plugins: parsedPlugins,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      }
    })

  } catch (error) {
    console.error('Error fetching plugins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugins', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPluginSchema.parse(body)

    // Check if plugin name already exists
    const existing = await db.findUnique('Plugin', { name: validatedData.name })
    if (existing) {
      return NextResponse.json(
        { error: 'Plugin with this name already exists', code: 'DUPLICATE_NAME' },
        { status: 409 }
      )
    }

    // Create plugin
    const plugin = await db.create('Plugin', {
      id: nanoid(),
      name: validatedData.name,
      version: validatedData.version,
      description: validatedData.description,
      author: validatedData.author,
      homepage: validatedData.homepage,
      repository: validatedData.repository,
      license: validatedData.license,
      keywords: JSON.stringify(validatedData.keywords || []),
      enabled: validatedData.enabled,
      config: JSON.stringify(validatedData.config || {}),
      manifest: JSON.stringify(validatedData.manifest),
    })

    // Return created plugin with parsed fields
    const parsedPlugin = {
      ...plugin,
      keywords: JSON.parse(plugin.keywords || '[]'),
      config: JSON.parse(plugin.config || '{}'),
      manifest: JSON.parse(plugin.manifest),
    }

    return NextResponse.json(parsedPlugin, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error creating plugin:', error)
    return NextResponse.json(
      { error: 'Failed to create plugin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

