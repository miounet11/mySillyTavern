import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock data for prompt templates (will be replaced with DB queries after migration)
const MOCK_TEMPLATES = [
  {
    id: 'tpl-1',
    name: '角色扮演增强',
    content: '请严格按照{{char}}的人格特征和背景设定进行回复。保持角色的一致性，包括说话方式、态度和价值观。在对话中自然地展现角色的个性特点。',
    category: 'external',
    description: '增强AI对角色人设的把握，保持角色一致性',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-2',
    name: '情感表达指导',
    content: '在回复时，请充分表达{{char}}的情感状态。通过细腻的语言、动作描写和心理活动，让对话更加生动和真实。适当使用表情符号或情绪词汇来增强表现力。',
    category: 'external',
    description: '让对话更有感情色彩和表现力',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-3',
    name: '对话风格控制 - 简洁',
    content: '请使用简洁明了的语言风格回复。避免过度冗长的描述，保持回复在2-3句话以内，直接切入重点。',
    category: 'external',
    description: '适合快节奏对话，回复简短直接',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-4',
    name: '对话风格控制 - 详细',
    content: '请提供详细丰富的回复。包含环境描写、动作细节、心理活动和对话内容。创造身临其境的体验，回复长度可以在150-300字之间。',
    category: 'external',
    description: '适合深度对话和场景化交流',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-5',
    name: '创意写作辅助',
    content: '以{{char}}的视角，创造性地推进故事发展。可以引入新的情节转折、添加环境细节、或提出有趣的问题。保持叙事的连贯性和吸引力。',
    category: 'external',
    description: '帮助推进创意故事情节',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-6',
    name: '幽默对话模式',
    content: '在保持{{char}}人设的基础上，适当加入幽默元素。可以使用俏皮话、双关语或轻松的玩笑，让对话氛围更加轻松愉快。',
    category: 'external',
    description: '营造轻松幽默的对话氛围',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-7',
    name: '专业领域 - 技术',
    content: '{{char}}将以专业技术人员的身份回答。使用准确的技术术语，提供详细的技术解释，但也要确保表达清晰易懂。必要时可以使用类比和示例。',
    category: 'external',
    description: '适合技术讨论和专业问答',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-8',
    name: '专业领域 - 文学',
    content: '{{char}}将以文学爱好者或作家的身份交流。语言优美富有文采，可以引用经典作品，深入探讨文学主题和艺术表现手法。',
    category: 'external',
    description: '适合文学讨论和艺术交流',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-9',
    name: '专业领域 - 历史',
    content: '{{char}}将以历史学者的身份交流。提供准确的历史信息，分析历史事件的因果关系，探讨历史人物和时代背景。保持客观和学术性。',
    category: 'external',
    description: '适合历史讨论和知识分享',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-10',
    name: '教学辅导模式',
    content: '{{char}}将以耐心的导师身份指导{{user}}。使用循序渐进的方法，先解释基础概念，再深入细节。鼓励提问，给予正面反馈。',
    category: 'external',
    description: '适合学习和教育场景',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-11',
    name: '冒险探索模式',
    content: '描述{{char}}所处的环境、遇到的挑战和可能的选择。营造紧张刺激的氛围，推动情节发展，给{{user}}带来沉浸式的冒险体验。',
    category: 'external',
    description: '适合冒险和探索类场景',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-12',
    name: '日常闲聊模式',
    content: '{{char}}将以轻松自然的方式与{{user}}闲聊。话题可以是日常生活、兴趣爱好、心情感受等。保持对话的随意性和真实感。',
    category: 'external',
    description: '适合日常交流和随意聊天',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tpl-13',
    name: '情感支持模式',
    content: '{{char}}将以同理心和关怀的态度倾听{{user}}的心声。给予情感支持和鼓励，帮助排解负面情绪。语气温暖体贴，注重情感连接。',
    category: 'external',
    description: '提供情感支持和心理安慰',
    isBuiltin: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
]

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  category: z.enum(['external', 'variable']),
  description: z.string().max(500).optional(),
})

/**
 * GET /api/prompt-templates
 * Fetch prompt templates with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const favorites = searchParams.get('favorites') === 'true'

    // Filter templates
    let filteredTemplates = MOCK_TEMPLATES.filter(tpl => {
      const matchesCategory = !category || tpl.category === category
      const matchesSearch = !search || 
        tpl.name.toLowerCase().includes(search.toLowerCase()) ||
        tpl.content.toLowerCase().includes(search.toLowerCase()) ||
        tpl.description?.toLowerCase().includes(search.toLowerCase())
      const matchesFavorites = !favorites || tpl.isFavorite

      return matchesCategory && matchesSearch && matchesFavorites
    })

    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length
    })
  } catch (error) {
    console.error('Error fetching prompt templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/prompt-templates
 * Create a new custom template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    // TODO: Save to database after migration
    // For now, return mock response
    const newTemplate = {
      id: `tpl-custom-${Date.now()}`,
      ...validatedData,
      isBuiltin: false,
      isFavorite: false,
      usageCount: 0,
      userId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(newTemplate, { status: 201 })
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

    console.error('Error creating prompt template:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt template' },
      { status: 500 }
    )
  }
}

