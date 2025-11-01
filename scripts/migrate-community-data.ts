/**
 * 迁移社区角色数据到数据库
 * 将 community-data.ts 中的硬编码数据导入到 CommunityCharacter 表
 */

import { db } from '@sillytavern-clone/database'
import { COMMUNITY_CHARACTERS_DATA } from '../apps/web/src/app/api/characters/community/community-data'

async function migrateCommunityData() {
  console.log('开始迁移社区角色数据...')
  
  try {
    // 检查表中是否已有数据
    const existingChars = await db.findMany('CommunityCharacter', {})
    console.log(`现有社区角色数量: ${existingChars.length}`)
    
    if (existingChars.length > 0) {
      console.log('⚠️  数据库中已有社区角色数据，是否要清空并重新导入？')
      console.log('如果需要清空，请手动执行: DELETE FROM "CommunityCharacter";')
      console.log('然后重新运行此脚本。')
      console.log('\n现在将跳过已存在的ID，只插入新数据...')
    }
    
    const existingIds = new Set(existingChars.map(char => char.id))
    let insertedCount = 0
    let skippedCount = 0
    
    for (const char of COMMUNITY_CHARACTERS_DATA) {
      if (existingIds.has(char.id)) {
        console.log(`⏭️  跳过已存在的角色: ${char.name} (${char.id})`)
        skippedCount++
        continue
      }
      
      console.log(`📝 插入角色: ${char.name}`)
      
      // 准备完整角色卡数据（存储为JSON）
      const characterCard = char.characterCard || {
        spec: 'chara_card_v2',
        spec_version: '2.0',
        data: {}
      }
      
      await db.create('CommunityCharacter', {
        id: char.id,
        name: char.name,
        description: char.description || '',
        characterData: JSON.stringify(characterCard), // 存储完整的角色卡数据
        avatar: char.avatar,
        author: char.author || 'Unknown',
        authorId: char.authorId || 'default',
        downloads: char.downloads || 0,
        likes: char.likes || 0,
        tags: JSON.stringify(char.tags || []),
        category: char.category || 'cards',
        isPublished: true,
      })
      
      insertedCount++
    }
    
    console.log(`\n✅ 迁移完成！`)
    console.log(`   新插入: ${insertedCount} 个角色`)
    console.log(`   跳过: ${skippedCount} 个角色`)
    console.log(`   总计: ${insertedCount + existingChars.length} 个角色`)
    
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    throw error
  }
}

// 执行迁移
migrateCommunityData()
  .then(() => {
    console.log('\n🎉 数据迁移成功！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 数据迁移失败:', error)
    process.exit(1)
  })

