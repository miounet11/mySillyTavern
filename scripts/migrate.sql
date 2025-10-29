-- 数据迁移 SQL 脚本

-- 1. 创建默认用户（如果不存在）
INSERT INTO "User" (id, username, settings, "createdAt", "updatedAt")
SELECT 
  'default_user_001',
  '默认用户',
  '{"theme":"dark","language":"zh-CN"}',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "User" WHERE username = '默认用户'
);

-- 2. 更新所有没有 userId 的角色
UPDATE "Character"
SET "userId" = 'default_user_001'
WHERE "userId" IS NULL;

-- 3. 更新所有没有 userId 的 AI 配置
UPDATE "AIModelConfig"
SET "userId" = 'default_user_001'
WHERE "userId" IS NULL;

-- 4. 更新所有 userId 为 'default' 的提示词模板
UPDATE "PromptTemplate"
SET "userId" = 'default_user_001'
WHERE "userId" = 'default';

-- 5. 查看结果
SELECT '用户数:' as info, COUNT(*) as count FROM "User"
UNION ALL
SELECT '角色数:', COUNT(*) FROM "Character"
UNION ALL
SELECT 'AI配置数:', COUNT(*) FROM "AIModelConfig";

