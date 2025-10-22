import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'
import { WorldInfo } from '@sillytavern-clone/shared'
import { nanoid } from 'nanoid'

const createWorldInfoSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  entries: z.array(z.object({
    id: z.string().optional(),
    keywords: z.array(z.string().min(1)).min(1),
    content: z.string().min(1),
    priority: z.number().min(0).max(100).default(50),
    enabled: z.boolean().default(true),
    caseSensitive: z.boolean().default(false),
    matchWholeWords: z.boolean().default(false),
    activationKeys: z.array(z.string()).optional(),
    category: z.string().optional(),
  })).default([]),
  characterIds: z.array(z.string()).optional(),
  isGlobal: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

const querySchema = z.object({
  search: z.string().optional(),
  characterId: z.string().optional(),
  isGlobal: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
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
        { description: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    if (query.isGlobal !== undefined) {
      where.isGlobal = query.isGlobal
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive
    }

    if (query.characterId) {
      where.characterIds = {
        contains: JSON.stringify([query.characterId]),
        mode: 'insensitive'
      }
    }

    // Get world info with pagination
    const [worldInfos, total] = await Promise.all([
      db.findMany('WorldInfo', {
        where,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: query.limit,
      }),
      db.count('WorldInfo', { where })
    ])

    // Parse JSON fields
    const parsedWorldInfos = worldInfos.map(info => ({
      ...info,
      entries: info.entries ? JSON.parse(info.entries as string) : [],
      characterIds: info.characterIds ? JSON.parse(info.characterIds as string) : [],
    }))

    const totalPages = Math.ceil(total / query.limit)

    return NextResponse.json({
      worldInfos: parsedWorldInfos,
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
    console.error('Error fetching world info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch world info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createWorldInfoSchema.parse(body)

    // Generate IDs for entries if not provided
    const entriesWithIds = validatedData.entries.map(entry => ({
      ...entry,
      id: entry.id || nanoid()
    }))

    // Create world info
    const worldInfo = await db.create('WorldInfo', {
      id: nanoid(),
      name: validatedData.name,
      description: validatedData.description,
      entries: JSON.stringify(entriesWithIds),
      characterIds: JSON.stringify(validatedData.characterIds || []),
      isGlobal: validatedData.isGlobal,
      isActive: validatedData.isActive,
    })

    // Return created world info with parsed fields
    const parsedWorldInfo = {
      ...worldInfo,
      entries: JSON.parse(worldInfo.entries as string),
      characterIds: JSON.parse(worldInfo.characterIds as string),
    }

    return NextResponse.json(parsedWorldInfo, { status: 201 })

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

    console.error('Error creating world info:', error)
    return NextResponse.json(
      { error: 'Failed to create world info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}