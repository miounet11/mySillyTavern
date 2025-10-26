import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@sillytavern-clone/database'

const updatePluginSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.any()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const plugin = await db.findUnique('Plugin', { id })

    if (!plugin) {
      return NextResponse.json(
        { error: 'Plugin not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const parsedPlugin = {
      ...plugin,
      keywords: plugin.keywords ? JSON.parse(plugin.keywords) : [],
      config: plugin.config ? JSON.parse(plugin.config) : {},
      manifest: plugin.manifest ? JSON.parse(plugin.manifest) : {},
    }

    return NextResponse.json(parsedPlugin)

  } catch (error) {
    console.error('Error fetching plugin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updatePluginSchema.parse(body)

    // Check if plugin exists
    const existing = await db.findUnique('Plugin', { id })
    if (!existing) {
      return NextResponse.json(
        { error: 'Plugin not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.enabled !== undefined) {
      updateData.enabled = validatedData.enabled
    }
    if (validatedData.config !== undefined) {
      updateData.config = JSON.stringify(validatedData.config)
    }

    // Update plugin
    const plugin = await db.update('Plugin', { id }, updateData)

    // Return updated plugin with parsed fields
    const parsedPlugin = {
      ...plugin,
      keywords: plugin.keywords ? JSON.parse(plugin.keywords) : [],
      config: plugin.config ? JSON.parse(plugin.config) : {},
      manifest: plugin.manifest ? JSON.parse(plugin.manifest) : {},
    }

    return NextResponse.json(parsedPlugin)

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

    console.error('Error updating plugin:', error)
    return NextResponse.json(
      { error: 'Failed to update plugin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if plugin exists
    const existing = await db.findUnique('Plugin', { id })
    if (!existing) {
      return NextResponse.json(
        { error: 'Plugin not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Delete plugin (will cascade delete settings)
    await db.delete('Plugin', { id })

    return NextResponse.json({ success: true, message: 'Plugin deleted successfully' })

  } catch (error) {
    console.error('Error deleting plugin:', error)
    return NextResponse.json(
      { error: 'Failed to delete plugin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

