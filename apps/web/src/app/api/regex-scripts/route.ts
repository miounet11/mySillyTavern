import { NextRequest, NextResponse } from 'next/server'

// Mock regex scripts
let regexScripts = [
  {
    id: 'rs-1',
    name: 'CG描图',
    enabled: true,
    findRegex: '=<CG\\|(\\s\\$)',
    replaceWith: '$1',
    priority: 100,
    scriptType: 'display'
  },
  {
    id: 'rs-2',
    name: '状态栏美化',
    enabled: true,
    findRegex: '\\[状态：(.+?)\\]',
    replaceWith: '<span class="status">$1</span>',
    priority: 90,
    scriptType: 'output'
  }
]

export async function GET(request: NextRequest) {
  return NextResponse.json({ scripts: regexScripts })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newScript = {
      id: `rs-${Date.now()}`,
      ...body,
      priority: body.priority ?? 100
    }

    regexScripts.push(newScript)

    return NextResponse.json({ script: newScript }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

