import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(5000).optional(),
  description: z.string().max(500).optional(),
  isFavorite: z.boolean().optional(),
})

/**
 * GET /api/prompt-templates/[id]
 * Get a single template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Fetch from database after migration
    // For now, return mock response
    return NextResponse.json({
      message: 'Template details endpoint',
      id
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/prompt-templates/[id]
 * Update a template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateTemplateSchema.parse(body)

    // TODO: Update in database after migration
    // For now, return mock response
    return NextResponse.json({
      message: 'Template updated',
      id,
      ...validatedData
    })
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

    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/prompt-templates/[id]
 * Delete a template (only custom templates can be deleted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Delete from database after migration
    // Check if template is builtin (cannot be deleted)
    
    return NextResponse.json({
      message: 'Template deleted',
      id
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}

