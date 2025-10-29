/**
 * 简单数据迁移脚本
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('开始迁移数据...\n')

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

    // 2. 更新没有 userId 的角色
    console.log('2. 迁移角色数据...')
    const updateCharacters = await prisma.character.updateMany({
      where: { userId: null },
      data: { userId: defaultUser.id },
    })
    console.log(`   ✓ 更新了 ${updateCharacters.count} 个角色\n`)

    // 3. 更新没有 userId 的 AI 配置
    console.log('3. 迁移 AI 模型配置...')
    const updateModels = await prisma.aIModelConfig.updateMany({
      where: { userId: null },
      data: { userId: defaultUser.id },
    })
    console.log(`   ✓ 更新了 ${updateModels.count} 个 AI 配置\n`)

    // 4. 更新 userId 为 'default' 的提示词模板
    console.log('4. 迁移提示词模板...')
    const updateTemplates = await prisma.promptTemplate.updateMany({
      where: { userId: 'default' },
      data: { userId: defaultUser.id },
    })
    console.log(`   ✓ 更新了 ${updateTemplates.count} 个模板\n`)

    // 5. 统计
    console.log('5. 迁移统计:')
    const userCount = await prisma.user.count()
    const charCount = await prisma.character.count()
    const modelCount = await prisma.aIModelConfig.count()
    
    console.log(`   - 用户总数: ${userCount}`)
    console.log(`   - 角色总数: ${charCount}`)
    console.log(`   - AI 配置总数: ${modelCount}`)

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

