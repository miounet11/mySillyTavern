import { NextRequest, NextResponse } from 'next/server'

// Mock presets
let presets = [
  {
    id: 'preset-1',
    name: '标准对话',
    enabled: true,
    content: '你是一个友好且乐于助人的AI助手。请用礼貌、清晰的语言回答问题。',
    category: '对话',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'preset-2',
    name: '创意写作',
    enabled: true,
    content: '你是一个富有创造力的作家。请用生动、富有想象力的语言进行写作。',
    category: '写作',
    updatedAt: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const filtered = category
    ? presets.filter(p => p.category === category)
    : presets

  return NextResponse.json({ presets: filtered })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newPreset = {
      id: `preset-${Date.now()}`,
      ...body,
      updatedAt: new Date().toISOString()
    }

    presets.push(newPreset)

    return NextResponse.json({ preset: newPreset }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

