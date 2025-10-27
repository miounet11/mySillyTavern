import { NextRequest, NextResponse } from 'next/server'

// This would normally be in a database
// For now, we'll use the same mock data (in production, import from a shared store)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock implementation
  return NextResponse.json({
    entry: {
      id: params.id,
      name: 'Example Entry',
      keywords: ['example'],
      content: 'Example content',
      enabled: true,
      position: 4,
      depth: 4,
      priority: 100
    }
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Mock implementation - in production, update in database
    const updatedEntry = {
      id: params.id,
      ...body
    }

    return NextResponse.json({ entry: updatedEntry })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock implementation - in production, delete from database
  return NextResponse.json({ success: true })
}

