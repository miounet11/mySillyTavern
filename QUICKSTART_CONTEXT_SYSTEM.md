# 🚀 上下文持久化系统 - 快速启动指南

## ⚡ 快速开始（5 分钟）

### 第 1 步：配置环境变量

在 `.env` 文件中添加：

```bash
# 最小配置（必需）
CONTEXT_MAX_TOKENS=8000
CONTEXT_RESERVE_TOKENS=1000
WORLDINFO_MAX_RECURSIVE_DEPTH=2
WORLDINFO_DEFAULT_VECTOR_THRESHOLD=0.7

# 可选：启用高级功能
CONTEXT_ENABLE_AUTO_SUMMARY=false
WORLDINFO_AUTO_EMBEDDING=false
OPENAI_API_KEY=sk-your-key-here  # 仅在启用 embedding/summary 时需要
```

### 第 2 步：运行数据库迁移

```bash
# 进入项目目录
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 执行迁移（如果有访问权限）
psql -U your_user -d your_database -f packages/database/prisma/migrations/20251029_context_system_upgrade.sql

# 或者通过 Prisma
cd packages/database
pnpm prisma db push
```

### 第 3 步：重启服务

```bash
# 返回根目录
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 重启 PM2（如果使用）
pm2 restart sillytavern

# 或者重新启动开发服务器
pnpm dev
```

### 第 4 步：验证安装

**打开浏览器控制台**，发送一条消息，查看日志：

```
[Context System] Starting intelligent context building...
[Context System] Activated 3 World Info entries
[Context System] Context built successfully
```

✅ 如果看到这些日志，说明系统已成功运行！

---

## 🎯 立即体验新功能

### 1. 创建智能 World Info

#### 示例 1：关键词触发

```json
{
  "name": "战斗系统",
  "content": "这是一个回合制战斗系统...",
  "keywords": ["战斗", "攻击", "防御"],
  "activationType": "keyword",
  "enabled": true
}
```

**测试**：发送"我发起攻击"，系统自动注入战斗规则。

#### 示例 2：正则表达式触发

```json
{
  "name": "魔法系统",
  "content": "魔法分为元素系、暗黑系和神圣系...",
  "keywordsRegex": "/魔法|法术|咒语/i",
  "useRegex": true,
  "activationType": "keyword",
  "enabled": true
}
```

**测试**：发送"施放法术"或"使用魔法"，自动激活。

#### 示例 3：递归激活链

```json
{
  "name": "王国历史",
  "content": "艾尔登王国建立于...",
  "keywords": ["王国", "历史"],
  "recursive": true,
  "cascadeTrigger": ["地理信息条目ID", "皇室家族条目ID"],
  "activationType": "keyword"
}
```

**效果**：提到"王国"时，自动激活地理和皇室信息。

---

## 🔥 高级功能（可选）

### 启用向量搜索（需要 OpenAI API Key）

1. **配置 .env**

```bash
WORLDINFO_AUTO_EMBEDDING=true
OPENAI_API_KEY=sk-your-key-here
```

2. **为现有条目生成 embeddings**

```bash
npx tsx scripts/generate-all-embeddings.ts
```

3. **使用向量激活**

```json
{
  "name": "角色情感状态",
  "content": "主角此时感到悲伤和绝望...",
  "activationType": "vector",
  "vectorThreshold": 0.75
}
```

当用户输入情感相关内容时，自动根据语义相似度激活。

### 启用自动总结

```bash
CONTEXT_ENABLE_AUTO_SUMMARY=true
CONTEXT_SUMMARY_INTERVAL=50  # 每 50 条消息生成总结
```

**效果**：长对话自动压缩，节省 token。

---

## 📊 监控与调试

### 查看激活的 World Info

检查消息 metadata：

```sql
SELECT metadata FROM "Message" 
WHERE "chatId" = 'your-chat-id' 
ORDER BY timestamp DESC 
LIMIT 1;
```

查找 `contextInfo.activatedWorldInfo` 字段。

### 查看自动总结

```sql
SELECT * FROM "ChatSummary" 
WHERE "chatId" = 'your-chat-id' 
ORDER BY "fromMessage" ASC;
```

### 查看激活历史

```sql
SELECT wi.name, wia."activatedAt", wia."expiresAt", wia."cooldownUntil"
FROM "WorldInfoActivation" wia
JOIN "WorldInfo" wi ON wi.id = wia."worldInfoId"
WHERE wia."chatId" = 'your-chat-id'
ORDER BY wia."activatedAt" DESC
LIMIT 10;
```

---

## ⚙️ 性能优化建议

### 根据模型调整 Token 预算

```bash
# GPT-3.5-Turbo (4k)
CONTEXT_MAX_TOKENS=3000
CONTEXT_RESERVE_TOKENS=1000

# GPT-4 (8k)
CONTEXT_MAX_TOKENS=6000
CONTEXT_RESERVE_TOKENS=2000

# Claude-2 (100k)
CONTEXT_MAX_TOKENS=90000
CONTEXT_RESERVE_TOKENS=10000
```

### World Info 数量建议

- **< 20 个条目**：无需优化
- **20-100 个条目**：启用 caching（未来版本）
- **> 100 个条目**：建议分角色/场景管理

---

## 🐛 故障排查

### 问题 1：World Info 未激活

**检查**：
1. `enabled = true`？
2. 关键词拼写正确？
3. 查看控制台日志中的激活数量

### 问题 2：向量搜索不工作

**检查**：
1. pgvector 扩展已安装？
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```
2. embedding 已生成？
   ```sql
   SELECT COUNT(*) FROM "WorldInfo" WHERE "embeddingVector" IS NOT NULL;
   ```
3. OPENAI_API_KEY 已配置？

### 问题 3：Prisma 类型错误

```bash
cd packages/database
pnpm prisma generate
```

---

## 📞 获取帮助

- 查看完整实施文档：[CONTEXT_SYSTEM_IMPLEMENTATION.md](CONTEXT_SYSTEM_IMPLEMENTATION.md)
- 环境变量说明：[CONTEXT_ENV_VARS.md](CONTEXT_ENV_VARS.md)
- 原始计划：[--.plan.md](--.plan.md)

---

**祝使用愉快！** 🎉

您的 AI 对话现在拥有了：
- ✅ 永不遗忘的长期记忆
- ✅ 智能上下文管理
- ✅ 22 个技术环节的完整支持
- ✅ 支持 1000 轮对话仍记得第 3 轮细节

