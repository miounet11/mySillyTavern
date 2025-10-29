#!/usr/bin/env tsx
/**
 * 批量生成 World Info embeddings 脚本
 * 用于迁移现有数据或一次性生成所有 embeddings
 */

import { db } from '../packages/database/src'
import { WorldInfoEmbeddingService } from '../apps/web/src/lib/worldinfo/embeddingService'

async function main() {
  console.log('🚀 开始批量生成 World Info embeddings...\n')
  
  const embeddingService = new WorldInfoEmbeddingService()
  
  // 获取所有未生成 embedding 的条目
  const worldInfos = await db.$queryRaw<Array<{ id: string; name: string }>>`
    SELECT id, name FROM "WorldInfo" 
    WHERE "embeddingVector" IS NULL 
      AND enabled = true
    ORDER BY "createdAt" ASC
  `
  
  console.log(`📊 找到 ${worldInfos.length} 个条目需要生成 embedding\n`)
  
  if (worldInfos.length === 0) {
    console.log('✅ 所有启用的 World Info 条目都已有 embedding')
    process.exit(0)
  }
  
  let completed = 0
  let failed = 0
  
  for (const { id, name } of worldInfos) {
    try {
      await embeddingService.updateWorldInfoEmbedding(id)
      completed++
      console.log(`✓ [${completed}/${worldInfos.length}] ${name} (${id})`)
    } catch (error) {
      failed++
      console.error(`✗ [${completed + failed}/${worldInfos.length}] ${name} (${id}) - 失败:`, error instanceof Error ? error.message : error)
    }
    
    // 避免 API 限流（OpenAI: 3000 RPM）
    if (completed % 10 === 0) {
      console.log(`⏸️  暂停 1 秒以避免限流...\n`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📈 批量生成完成！')
  console.log(`✅ 成功: ${completed}`)
  if (failed > 0) {
    console.log(`❌ 失败: ${failed}`)
  }
  console.log('='.repeat(60) + '\n')
  
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('❌ 脚本执行失败:', error)
  process.exit(1)
})

