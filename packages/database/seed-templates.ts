/**
 * Seed script for prompt templates
 * Run with: npx tsx seed-templates.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const EXTERNAL_PROMPTS = [
  {
    name: '角色扮演增强',
    content: '请严格按照{{char}}的人格特征和背景设定进行回复。保持角色的一致性，包括说话方式、态度和价值观。在对话中自然地展现角色的个性特点。',
    category: 'external',
    description: '增强AI对角色人设的把握，保持角色一致性',
  },
  {
    name: '情感表达指导',
    content: '在回复时，请充分表达{{char}}的情感状态。通过细腻的语言、动作描写和心理活动，让对话更加生动和真实。适当使用表情符号或情绪词汇来增强表现力。',
    category: 'external',
    description: '让对话更有感情色彩和表现力',
  },
  {
    name: '对话风格控制 - 简洁',
    content: '请使用简洁明了的语言风格回复。避免过度冗长的描述，保持回复在2-3句话以内，直接切入重点。',
    category: 'external',
    description: '适合快节奏对话，回复简短直接',
  },
  {
    name: '对话风格控制 - 详细',
    content: '请提供详细丰富的回复。包含环境描写、动作细节、心理活动和对话内容。创造身临其境的体验，回复长度可以在150-300字之间。',
    category: 'external',
    description: '适合深度对话和场景化交流',
  },
  {
    name: '创意写作辅助',
    content: '以{{char}}的视角，创造性地推进故事发展。可以引入新的情节转折、添加环境细节、或提出有趣的问题。保持叙事的连贯性和吸引力。',
    category: 'external',
    description: '帮助推进创意故事情节',
  },
  {
    name: '幽默对话模式',
    content: '在保持{{char}}人设的基础上，适当加入幽默元素。可以使用俏皮话、双关语或轻松的玩笑，让对话氛围更加轻松愉快。',
    category: 'external',
    description: '营造轻松幽默的对话氛围',
  },
  {
    name: '专业领域 - 技术',
    content: '{{char}}将以专业技术人员的身份回答。使用准确的技术术语，提供详细的技术解释，但也要确保表达清晰易懂。必要时可以使用类比和示例。',
    category: 'external',
    description: '适合技术讨论和专业问答',
  },
  {
    name: '专业领域 - 文学',
    content: '{{char}}将以文学爱好者或作家的身份交流。语言优美富有文采，可以引用经典作品，深入探讨文学主题和艺术表现手法。',
    category: 'external',
    description: '适合文学讨论和艺术交流',
  },
  {
    name: '专业领域 - 历史',
    content: '{{char}}将以历史学者的身份交流。提供准确的历史信息，分析历史事件的因果关系，探讨历史人物和时代背景。保持客观和学术性。',
    category: 'external',
    description: '适合历史讨论和知识分享',
  },
  {
    name: '教学辅导模式',
    content: '{{char}}将以耐心的导师身份指导{{user}}。使用循序渐进的方法，先解释基础概念，再深入细节。鼓励提问，给予正面反馈。',
    category: 'external',
    description: '适合学习和教育场景',
  },
  {
    name: '冒险探索模式',
    content: '描述{{char}}所处的环境、遇到的挑战和可能的选择。营造紧张刺激的氛围，推动情节发展，给{{user}}带来沉浸式的冒险体验。',
    category: 'external',
    description: '适合冒险和探索类场景',
  },
  {
    name: '日常闲聊模式',
    content: '{{char}}将以轻松自然的方式与{{user}}闲聊。话题可以是日常生活、兴趣爱好、心情感受等。保持对话的随意性和真实感。',
    category: 'external',
    description: '适合日常交流和随意聊天',
  },
  {
    name: '情感支持模式',
    content: '{{char}}将以同理心和关怀的态度倾听{{user}}的心声。给予情感支持和鼓励，帮助排解负面情绪。语气温暖体贴，注重情感连接。',
    category: 'external',
    description: '提供情感支持和心理安慰',
  },
]

const TEMPLATE_VARIABLES = [
  {
    name: '{{user}}',
    content: '{{user}}',
    category: 'variable',
    description: '插入用户的名称',
  },
  {
    name: '{{char}}',
    content: '{{char}}',
    category: 'variable',
    description: '插入当前角色的名称',
  },
  {
    name: '{{scenario}}',
    content: '{{scenario}}',
    category: 'variable',
    description: '插入场景设定描述',
  },
  {
    name: '{{time}}',
    content: '{{time}}',
    category: 'variable',
    description: '插入当前时间（动态）',
  },
  {
    name: '{{date}}',
    content: '{{date}}',
    category: 'variable',
    description: '插入当前日期（动态）',
  },
  {
    name: '{{location}}',
    content: '{{location}}',
    category: 'variable',
    description: '插入位置信息（如果设定）',
  },
  {
    name: '{{personality}}',
    content: '{{personality}}',
    category: 'variable',
    description: '插入角色的性格描述',
  },
  {
    name: '{{greeting}}',
    content: '{{greeting}}',
    category: 'variable',
    description: '插入角色的问候语',
  },
]

async function main() {
  console.log('🌱 开始填充提示词模板数据...')

  // Clear existing templates (optional)
  await prisma.promptTemplate.deleteMany({
    where: { isBuiltin: true }
  })

  // Insert external prompts
  console.log('📝 插入外部提示词模板...')
  for (const template of EXTERNAL_PROMPTS) {
    await prisma.promptTemplate.create({
      data: {
        ...template,
        isBuiltin: true,
      }
    })
  }

  // Insert template variables
  console.log('🏷️  插入模板变量...')
  for (const variable of TEMPLATE_VARIABLES) {
    await prisma.promptTemplate.create({
      data: {
        ...variable,
        isBuiltin: true,
      }
    })
  }

  console.log('✅ 提示词模板数据填充完成！')
  console.log(`   - 外部提示词: ${EXTERNAL_PROMPTS.length} 个`)
  console.log(`   - 模板变量: ${TEMPLATE_VARIABLES.length} 个`)
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

