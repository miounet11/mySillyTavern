/**
 * 数据迁移脚本
 * 将现有数据迁移到新的用户系统
 */

import { PrismaClient } from '@sillytavern-clone/database'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function main() {
  console.log('开始迁移数据到用户系统...\n')

  try {
    // 1. 创建默认用户
    console.log('1. 创建默认用户...')
    let defaultUser = await prisma.user.findFirst({
      where: { username: '默认用户' },
    })

    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          username: '默认用户',
          settings: JSON.stringify({
            theme: 'dark',
            language: 'zh-CN',
          }),
        },
      })
      console.log(`   ✓ 创建默认用户: ${defaultUser.id}\n`)
    } else {
      console.log(`   ✓ 默认用户已存在: ${defaultUser.id}\n`)
    }

    // 2. 迁移角色数据
    console.log('2. 迁移角色数据...')
    const charactersWithoutUser = await prisma.character.findMany({
      where: {
        OR: [
          { userId: { equals: null } },
        ],
      },
    })

    if (charactersWithoutUser.length > 0) {
      for (const character of charactersWithoutUser) {
        await prisma.character.update({
          where: { id: character.id },
          data: { userId: defaultUser.id },
        })
      }
      console.log(`   ✓ 迁移了 ${charactersWithoutUser.length} 个角色到默认用户\n`)
    } else {
      console.log('   ✓ 所有角色已关联用户\n')
    }

    // 3. 迁移 AI 模型配置
    console.log('3. 迁移 AI 模型配置...')
    const modelsWithoutUser = await prisma.aIModelConfig.findMany({
      where: {
        OR: [
          { userId: { equals: null } },
        ],
      },
    })

    if (modelsWithoutUser.length > 0) {
      for (const model of modelsWithoutUser) {
        await prisma.aIModelConfig.update({
          where: { id: model.id },
          data: { userId: defaultUser.id },
        })
      }
      console.log(`   ✓ 迁移了 ${modelsWithoutUser.length} 个 AI 模型配置到默认用户\n`)
    } else {
      console.log('   ✓ 所有 AI 模型配置已关联用户\n`)
    }

    // 4. 迁移提示词模板
    console.log('4. 迁移提示词模板...')
    const templatesWithDefault = await prisma.promptTemplate.findMany({
      where: { userId: 'default' },
    })

    if (templatesWithDefault.length > 0) {
      for (const template of templatesWithDefault) {
        await prisma.promptTemplate.update({
          where: { id: template.id },
          data: { userId: defaultUser.id },
        })
      }
      console.log(`   ✓ 迁移了 ${templatesWithDefault.length} 个提示词模板到默认用户\n`)
    } else {
      console.log('   ✓ 所有提示词模板已关联用户\n')
    }

    // 5. 统计信息
    console.log('5. 迁移统计:')
    const userCount = await prisma.user.count()
    const characterCount = await prisma.character.count()
    const modelCount = await prisma.aIModelConfig.count()
    const templateCount = await prisma.promptTemplate.count()

    console.log(`   - 用户总数: ${userCount}`)
    console.log(`   - 角色总数: ${characterCount}`)
    console.log(`   - AI 模型配置总数: ${modelCount}`)
    console.log(`   - 提示词模板总数: ${templateCount}`)

    console.log('\n✅ 迁移完成!')
  } catch (error) {
    console.error('\n❌ 迁移失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

