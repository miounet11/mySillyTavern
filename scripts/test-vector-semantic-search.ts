#!/usr/bin/env tsx
/**
 * 测试向量语义搜索功能
 */

import { db } from '../packages/database/src'
import { WorldInfoEmbeddingService } from '../apps/web/src/lib/worldinfo/embeddingService'

async function testVectorSearch() {
  console.log('🧪 测试向量语义搜索功能\n')
  
  const embeddingService = new WorldInfoEmbeddingService()
  
  // 测试查询（使用英文以匹配现有内容）
  const queries = [
    'Hello, nice to meet you!',
    'Please follow AI assistant guidelines',
    'This is a general conversation platform'
  ]
  
  for (const query of queries) {
    console.log(`📝 查询: "${query}"`)
    
    // 生成查询的 embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query)
    
    // 搜索最相似的 World Info
    interface SearchResult {
      id: string
      name: string
      similarity: number
    }
    
    const results = await db.$queryRaw<SearchResult[]>`
      SELECT 
        id,
        name,
        1 - ("embeddingVector" <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
      FROM "WorldInfo"
      WHERE "embeddingVector" IS NOT NULL
        AND enabled = true
      ORDER BY similarity DESC
      LIMIT 3
    `
    
    console.log('   🎯 最匹配的 World Info:')
    results.forEach((r, i) => {
      const percentage = (r.similarity * 100).toFixed(2)
      const icon = r.similarity >= 0.7 ? '✅' : r.similarity >= 0.5 ? '⚠️' : '❌'
      console.log(`      ${i+1}. ${icon} ${r.name} (${percentage}%)`)
    })
    console.log()
  }
  
  console.log('✨ 向量搜索测试完成！\n')
  
  await db.disconnect()
}

testVectorSearch().catch(err => {
  console.error('❌ 测试失败:', err)
  process.exit(1)
})

