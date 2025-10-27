import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock implementation
  return NextResponse.json({
    preset: {
      id: params.id,
      name: 'Example Preset',
      enabled: true,
      content: 'Example preset content',
      category: '对话',
      updatedAt: new Date().toISOString()
    }
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updatedPreset = {
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ preset: updatedPreset })
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
  return NextResponse.json({ success: true })
}

