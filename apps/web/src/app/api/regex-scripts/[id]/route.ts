import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock implementation
  return NextResponse.json({
    script: {
      id: params.id,
      name: 'Example Script',
      enabled: true,
      findRegex: 'example',
      replaceWith: 'replaced',
      priority: 100,
      scriptType: 'all'
    }
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updatedScript = {
      id: params.id,
      ...body
    }

    return NextResponse.json({ script: updatedScript })
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

