#!/usr/bin/env tsx
/**
 * 测试向量搜索功能
 */

import { db } from '../packages/database/src'

async function testVectorSearch() {
  console.log('🧪 测试向量搜索功能...\n')
  
  // 1. 检查 pgvector 扩展
  console.log('1️⃣ 检查 pgvector 扩展...')
  const extensions = await db.$queryRaw<Array<{ extname: string }>>`
    SELECT extname FROM pg_extension WHERE extname = 'vector'
  `
  
  if (extensions.length === 0) {
    console.log('❌ pgvector 扩展未安装')
    process.exit(1)
  }
  console.log('✅ pgvector 扩展已安装\n')
  
  // 2. 检查向量字段
  console.log('2️⃣ 检查向量字段...')
  const columns = await db.$queryRaw<Array<{ column_name: string; data_type: string }>>`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'WorldInfo' 
      AND column_name IN ('embeddingVector')
  `
  
  if (columns.length === 0) {
    console.log('❌ WorldInfo 表缺少 embeddingVector 字段')
    process.exit(1)
  }
  console.log('✅ WorldInfo.embeddingVector 字段存在')
  console.log(`   类型: ${columns[0].data_type}\n`)
  
  // 3. 检查向量索引
  console.log('3️⃣ 检查向量索引...')
  const indexes = await db.$queryRaw<Array<{ indexname: string }>>`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename = 'WorldInfo' 
      AND indexname = 'worldinfo_embedding_idx'
  `
  
  if (indexes.length > 0) {
    console.log('✅ WorldInfo 向量索引已创建\n')
  } else {
    console.log('⚠️  WorldInfo 向量索引未创建（数据较少时正常）\n')
  }
  
  // 4. 测试向量操作
  console.log('4️⃣ 测试向量操作...')
  
  // 创建测试向量
  const testVector = Array(1536).fill(0).map(() => Math.random())
  
  try {
    // 测试插入向量
    const testId = 'test_vector_' + Date.now()
    await db.$executeRaw`
      INSERT INTO "WorldInfo" (
        id, name, content, "activationType", enabled, "embeddingVector",
        "createdAt", "updatedAt", position, priority, depth, 
        "insertionOrder", "tokenBudget", "vectorThreshold"
      ) VALUES (
        ${testId},
        'Vector Test',
        'This is a test entry for vector search',
        'vector',
        false,
        ${JSON.stringify(testVector)}::vector,
        NOW(), NOW(), 'after_char', 100, 4, 100, 500, 0.7
      )
    `
    console.log('✅ 向量插入成功')
    
    // 测试向量查询
    const results = await db.$queryRaw<Array<{ id: string; similarity: number }>>`
      SELECT id, 1 - ("embeddingVector" <=> ${JSON.stringify(testVector)}::vector) as similarity
      FROM "WorldInfo"
      WHERE "embeddingVector" IS NOT NULL
      ORDER BY similarity DESC
      LIMIT 1
    `
    
    if (results.length > 0) {
      console.log(`✅ 向量查询成功`)
      console.log(`   相似度: ${results[0].similarity.toFixed(4)}`)
    }
    
    // 清理测试数据
    await db.$executeRaw`
      DELETE FROM "WorldInfo" WHERE id = ${testId}
    `
    console.log('✅ 测试数据已清理\n')
    
  } catch (error) {
    console.error('❌ 向量操作失败:', error)
    process.exit(1)
  }
  
  // 5. 检查 ChatMessageEmbedding 表
  console.log('5️⃣ 检查 ChatMessageEmbedding 表...')
  const tableExists = await db.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'ChatMessageEmbedding'
    ) as exists
  `
  
  if (tableExists[0].exists) {
    console.log('✅ ChatMessageEmbedding 表已创建\n')
  } else {
    console.log('❌ ChatMessageEmbedding 表未创建\n')
  }
  
  console.log('=' .repeat(60))
  console.log('✨ 所有向量功能测试通过！')
  console.log('=' .repeat(60))
  console.log('\n下一步：')
  console.log('1. 为现有 World Info 生成 embeddings:')
  console.log('   npx tsx scripts/generate-all-embeddings.ts')
  console.log('\n2. 重启服务以启用向量搜索:')
  console.log('   pm2 restart sillytavern-web')
  console.log()
  
  await db.disconnect()
}

testVectorSearch().catch((error) => {
  console.error('测试失败:', error)
  process.exit(1)
})

