import { NextRequest, NextResponse } from 'next/server'

// Mock world info entries
let worldInfoEntries = [
  {
    id: 'wi-1',
    name: '森林地区',
    keywords: ['森林', '树林', '密林'],
    content: '一片茂密的森林，里面居住着各种奇特的生物。树木高耸入云，林间弥漫着神秘的气息。',
    enabled: true,
    position: 4,
    depth: 4,
    priority: 100,
    characterId: null
  },
  {
    id: 'wi-2',
    name: '魔法体系',
    keywords: ['魔法', '咒语', '法术'],
    content: '一种神秘的力量，可以用来施展各种法术。需要通过长时间的学习和修炼才能掌握。',
    enabled: true,
    position: 4,
    depth: 4,
    priority: 80,
    characterId: null
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const characterId = searchParams.get('characterId')

  // Filter by character if specified
  const filtered = characterId
    ? worldInfoEntries.filter(e => !e.characterId || e.characterId === characterId)
    : worldInfoEntries

  return NextResponse.json({ entries: filtered })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newEntry = {
      id: `wi-${Date.now()}`,
      ...body,
      position: body.position ?? 4,
      depth: body.depth ?? 4,
      priority: body.priority ?? 100
    }

    worldInfoEntries.push(newEntry)

    return NextResponse.json({ entry: newEntry }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
