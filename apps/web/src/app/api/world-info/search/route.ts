import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getVectorSearch } from '@/lib/vector-search'
import { withErrorHandler } from '@/lib/errors'

const searchSchema = z.object({
  query: z.string().min(1),
  characterId: z.string().optional(),
  limit: z.number().min(1).max(20).default(5),
  threshold: z.number().min(0).max(1).default(0.7),
  useVector: z.boolean().default(false),
})

async function POST(request: NextRequest) {
  const body = await request.json()
  const validatedData = searchSchema.parse(body)

  if (validatedData.useVector) {
    // Vector semantic search
    const vectorSearch = getVectorSearch()

    // Initialize if needed (should be done during app startup)
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      try {
        await vectorSearch.initialize(apiKey)
      } catch (error) {
        // Already initialized or error
      }
    }

    const results = await vectorSearch.search(
      validatedData.query,
      validatedData.characterId,
      validatedData.limit,
      validatedData.threshold
    )

    return NextResponse.json({
      results: results.map(r => ({
        ...r.worldInfo,
        similarity: r.similarity,
      })),
      method: 'vector',
    })
  } else {
    // Keyword-based search (simple)
    const { db } = await import('@sillytavern-clone/database')

    const where: any = {
      enabled: true,
      OR: [
        { name: { contains: validatedData.query, mode: 'insensitive' } },
        { content: { contains: validatedData.query, mode: 'insensitive' } },
      ]
    }

    if (validatedData.characterId) {
      where.characters = {
        some: { characterId: validatedData.characterId }
      }
    }

    const results = await db.findMany('WorldInfo', {
      where,
      take: validatedData.limit,
      orderBy: { priority: 'desc' }
    })

    return NextResponse.json({
      results,
      method: 'keyword',
    })
  }
}

const POSTHandler = withErrorHandler(POST)

export { POSTHandler as POST }

