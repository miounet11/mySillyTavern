import { NextRequest, NextResponse } from 'next/server'
import { getModelPresetsForProvider, getRecommendedModels, MODEL_PRESETS } from '@sillytavern-clone/shared'

/**
 * GET /api/ai-models/presets
 * Get model presets, optionally filtered by provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (provider) {
      // Get presets for specific provider
      const presets = getModelPresetsForProvider(provider)
      return NextResponse.json({ presets })
    }

    // Get all presets or recommended models
    const recommendedOnly = searchParams.get('recommended') === 'true'
    
    if (recommendedOnly) {
      const presets = getRecommendedModels()
      return NextResponse.json({ presets })
    }

    // Return all presets grouped by provider
    return NextResponse.json({ presets: MODEL_PRESETS })

  } catch (error) {
    console.error('Error fetching model presets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch model presets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

