import { NextRequest, NextResponse } from 'next/server'

// Template variables with descriptions
const TEMPLATE_VARIABLES = [
  {
    id: 'var-1',
    name: '{{user}}',
    variable: '{{user}}',
    description: '插入用户的名称',
    example: '你好，{{user}}！',
    category: 'basic',
  },
  {
    id: 'var-2',
    name: '{{char}}',
    variable: '{{char}}',
    description: '插入当前角色的名称',
    example: '我是{{char}}，很高兴认识你',
    category: 'basic',
  },
  {
    id: 'var-3',
    name: '{{scenario}}',
    variable: '{{scenario}}',
    description: '插入场景设定描述',
    example: '在{{scenario}}的背景下...',
    category: 'basic',
  },
  {
    id: 'var-4',
    name: '{{personality}}',
    variable: '{{personality}}',
    description: '插入角色的性格描述',
    example: '我的性格是{{personality}}',
    category: 'character',
  },
  {
    id: 'var-5',
    name: '{{greeting}}',
    variable: '{{greeting}}',
    description: '插入角色的问候语',
    example: '{{greeting}}',
    category: 'character',
  },
  {
    id: 'var-6',
    name: '{{time}}',
    variable: '{{time}}',
    description: '插入当前时间（动态）',
    example: '现在是{{time}}',
    category: 'dynamic',
  },
  {
    id: 'var-7',
    name: '{{date}}',
    variable: '{{date}}',
    description: '插入当前日期（动态）',
    example: '今天是{{date}}',
    category: 'dynamic',
  },
  {
    id: 'var-8',
    name: '{{location}}',
    variable: '{{location}}',
    description: '插入位置信息（如果设定）',
    example: '我们在{{location}}',
    category: 'context',
  },
  {
    id: 'var-9',
    name: '{{random}}',
    variable: '{{random}}',
    description: '插入随机数字（1-100）',
    example: '随机数：{{random}}',
    category: 'utility',
  },
  {
    id: 'var-10',
    name: '{{weather}}',
    variable: '{{weather}}',
    description: '插入天气描述（如果设定）',
    example: '天气是{{weather}}',
    category: 'context',
  },
]

/**
 * GET /api/template-variables
 * Get all available template variables
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let filteredVariables = TEMPLATE_VARIABLES

    if (category) {
      filteredVariables = TEMPLATE_VARIABLES.filter(v => v.category === category)
    }

    return NextResponse.json({
      variables: filteredVariables,
      categories: ['basic', 'character', 'dynamic', 'context', 'utility'],
      total: filteredVariables.length
    })
  } catch (error) {
    console.error('Error fetching template variables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template variables' },
      { status: 500 }
    )
  }
}

