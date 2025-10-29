-- SillyTavern 极致上下文持久化系统升级
-- Migration: 20251029_context_system_upgrade

-- ====================================
-- 第一步：启用 pgvector 扩展
-- ====================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ====================================
-- 第二步：扩展 Character 表（Handlebars 支持）
-- ====================================
ALTER TABLE "Character"
  ADD COLUMN IF NOT EXISTS "authorNote" TEXT,
  ADD COLUMN IF NOT EXISTS "authorNoteDepth" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "jailbreakPrompt" TEXT,
  ADD COLUMN IF NOT EXISTS "stopStrings" TEXT,
  ADD COLUMN IF NOT EXISTS "forcePrefix" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "exampleSeparator" VARCHAR(50) DEFAULT '###',
  ADD COLUMN IF NOT EXISTS "chatStart" VARCHAR(50) DEFAULT '<START>',
  ADD COLUMN IF NOT EXISTS "contextTemplateId" TEXT;

-- ====================================
-- 第三步：扩展 WorldInfo 表（22 个技术环节）
-- ====================================

-- 基础触发
ALTER TABLE "WorldInfo"
  ADD COLUMN IF NOT EXISTS "secondaryKeys" TEXT,
  ADD COLUMN IF NOT EXISTS "keywordsRegex" TEXT,
  ADD COLUMN IF NOT EXISTS "useRegex" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "selectiveLogic" VARCHAR(20) DEFAULT 'AND_ANY';

-- 递归激活链
ALTER TABLE "WorldInfo"
  ADD COLUMN IF NOT EXISTS "recursive" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "recursiveLevel" INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "maxRecursionSteps" INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "minActivations" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "cascadeTrigger" TEXT;

-- 状态机制
ALTER TABLE "WorldInfo"
  ADD COLUMN IF NOT EXISTS "sticky" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "cooldown" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "delay" INTEGER DEFAULT 0;

-- 插入控制（position 从 Int 改为 String）
DO $$
BEGIN
  -- 检查 position 列是否为 INT 类型
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'WorldInfo' 
      AND column_name = 'position' 
      AND data_type = 'integer'
  ) THEN
    -- 备份原始值
    ALTER TABLE "WorldInfo" RENAME COLUMN "position" TO "position_old";
    
    -- 添加新的 String 类型列
    ALTER TABLE "WorldInfo" ADD COLUMN "position" VARCHAR(50) DEFAULT 'after_char';
    
    -- 迁移数据：将数字转换为位置名称
    UPDATE "WorldInfo" SET "position" = 
      CASE 
        WHEN "position_old" = 0 THEN 'before_char'
        WHEN "position_old" = 1 THEN 'after_char'
        WHEN "position_old" = 2 THEN 'after_example'
        WHEN "position_old" = 3 THEN 'after_history'
        ELSE 'after_char'
      END;
    
    -- 删除旧列
    ALTER TABLE "WorldInfo" DROP COLUMN "position_old";
  END IF;
END$$;

ALTER TABLE "WorldInfo"
  ADD COLUMN IF NOT EXISTS "insertionOrder" INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "tokenBudget" INTEGER DEFAULT 500,
  ADD COLUMN IF NOT EXISTS "insertionTemplate" TEXT;

-- 向量搜索
ALTER TABLE "WorldInfo"
  ADD COLUMN IF NOT EXISTS "embeddingVector" vector(1536),
  ADD COLUMN IF NOT EXISTS "vectorThreshold" FLOAT DEFAULT 0.7;

-- ====================================
-- 第四步：创建向量索引
-- ====================================

-- WorldInfo embedding 索引（使用 IVFFlat）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'worldinfo_embedding_idx'
  ) THEN
    CREATE INDEX worldinfo_embedding_idx 
      ON "WorldInfo" 
      USING ivfflat ("embeddingVector" vector_cosine_ops)
      WITH (lists = 100);
  END IF;
END$$;

-- ====================================
-- 第五步：创建新表
-- ====================================

-- WorldInfoActivation 表
CREATE TABLE IF NOT EXISTS "WorldInfoActivation" (
  "id" TEXT PRIMARY KEY,
  "worldInfoId" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "activatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP,
  "cooldownUntil" TIMESTAMP,
  "messageCount" INTEGER DEFAULT 0,
  
  CONSTRAINT "WorldInfoActivation_worldInfoId_fkey" 
    FOREIGN KEY ("worldInfoId") 
    REFERENCES "WorldInfo"("id") 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "activation_chat_wi_idx" 
  ON "WorldInfoActivation"("chatId", "worldInfoId");
CREATE INDEX IF NOT EXISTS "activation_expires_idx" 
  ON "WorldInfoActivation"("expiresAt");
CREATE INDEX IF NOT EXISTS "activation_cooldown_idx" 
  ON "WorldInfoActivation"("cooldownUntil");

-- ChatMessageEmbedding 表
CREATE TABLE IF NOT EXISTS "ChatMessageEmbedding" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT UNIQUE NOT NULL,
  "chatId" TEXT NOT NULL,
  "embedding" vector(1536),
  "summary" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT "ChatMessageEmbedding_messageId_fkey" 
    FOREIGN KEY ("messageId") 
    REFERENCES "Message"("id") 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "message_embedding_chat_idx" 
  ON "ChatMessageEmbedding"("chatId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'message_embedding_idx'
  ) THEN
    CREATE INDEX message_embedding_idx 
      ON "ChatMessageEmbedding" 
      USING ivfflat ("embedding" vector_cosine_ops)
      WITH (lists = 100);
  END IF;
END$$;

-- ChatSummary 表
CREATE TABLE IF NOT EXISTS "ChatSummary" (
  "id" TEXT PRIMARY KEY,
  "chatId" TEXT NOT NULL,
  "fromMessage" INTEGER NOT NULL,
  "toMessage" INTEGER NOT NULL,
  "summary" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "summary_chat_idx" 
  ON "ChatSummary"("chatId");

-- ContextTemplate 表
CREATE TABLE IF NOT EXISTS "ContextTemplate" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "isDefault" BOOLEAN DEFAULT false,
  "userId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT "ContextTemplate_userId_fkey" 
    FOREIGN KEY ("userId") 
    REFERENCES "User"("id") 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "template_user_idx" 
  ON "ContextTemplate"("userId");
CREATE INDEX IF NOT EXISTS "template_default_idx" 
  ON "ContextTemplate"("isDefault");

-- ====================================
-- 第六步：插入默认上下文模板
-- ====================================

INSERT INTO "ContextTemplate" ("id", "name", "template", "isDefault", "userId", "createdAt")
VALUES (
  'tpl_default_001',
  'Default Template',
  E'{{#if jailbreak}}{{jailbreak}}\n\n{{/if}}{{#if system_prompt}}{{system_prompt}}\n\n{{/if}}{{#if wiBefore}}{{wiBefore}}\n\n{{/if}}{{description}}\n{{#if personality}}\n\n{{personality}}{{/if}}\n{{#if scenario}}\n\nScenario: {{scenario}}{{/if}}\n\n{{#if mesExamples}}{{example_separator}}\n{{mesExamples}}\n{{example_separator}}\n{{/if}}\n\n{{chat_start}}\n{{chat_history}}\n\n{{#if wiAfter}}{{wiAfter}}\n{{/if}}{{#if author_note}}[Author\'s Note: {{author_note}}]\n{{/if}}{{#if post_history_instructions}}\n\n{{post_history_instructions}}{{/if}}',
  true,
  NULL,
  NOW()
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ContextTemplate" ("id", "name", "template", "isDefault", "userId", "createdAt")
VALUES (
  'tpl_minimal_001',
  'Minimal Template',
  E'{{description}}\n\n{{chat_history}}\n\n{{author_note}}',
  false,
  NULL,
  NOW()
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ContextTemplate" ("id", "name", "template", "isDefault", "userId", "createdAt")
VALUES (
  'tpl_roleplay_001',
  'Roleplay Optimized',
  E'{{system_prompt}}\n\n=== CHARACTER ===\n{{description}}\n{{personality}}\n\n{{#if wiBefore}}=== WORLD INFO ===\n{{wiBefore}}\n\n{{/if}}=== SCENARIO ===\n{{scenario}}\n\n{{mesExamples}}\n\n{{chat_start}}\n{{chat_history}}\n\n{{#if wiAfter}}[Active Context]\n{{wiAfter}}\n\n{{/if}}[Instruction: {{author_note}}]\n{{post_history_instructions}}',
  false,
  NULL,
  NOW()
) ON CONFLICT ("id") DO NOTHING;

-- ====================================
-- 完成
-- ====================================

-- 输出迁移完成信息
DO $$
BEGIN
  RAISE NOTICE 'SillyTavern 上下文持久化系统升级完成！';
  RAISE NOTICE '✓ pgvector 扩展已启用';
  RAISE NOTICE '✓ Character 表已扩展（8 个新字段）';
  RAISE NOTICE '✓ WorldInfo 表已扩展（22 个新字段）';
  RAISE NOTICE '✓ 向量索引已创建';
  RAISE NOTICE '✓ 4 个新表已创建';
  RAISE NOTICE '✓ 3 个默认模板已插入';
  RAISE NOTICE '';
  RAISE NOTICE '下一步：运行 pnpm prisma generate 重新生成 Prisma Client';
END$$;

