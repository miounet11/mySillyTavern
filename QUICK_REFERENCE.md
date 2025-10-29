# 🚀 SillyTavern 快速参考

**网站**: https://www.isillytavern.com/  
**状态**: 🟢 在线  
**版本**: Next.js 14.0.4 + pgvector v0.8.1

---

## ⚡ 常用命令

### 服务管理
```bash
# 查看状态
pm2 status

# 重启服务
pm2 restart sillytavern-web

# 查看日志
pm2 logs sillytavern-web

# 停止服务
pm2 stop sillytavern-web

# 启动服务
pm2 start sillytavern-web
```

### 编译部署
```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 完整编译
pnpm run build

# 重启服务
pm2 restart sillytavern-web
```

### 数据库操作
```bash
# 连接数据库
PGPASSWORD="sillytavern2025!" psql -h localhost -U sillytavern_prod -d sillytavern_prod

# 检查 pgvector
psql ... -c "SELECT extversion FROM pg_extension WHERE extname = 'vector';"

# 查看 World Info 数量
psql ... -c "SELECT COUNT(*) FROM \"WorldInfo\";"
```

### 向量功能
```bash
# 测试向量搜索
npx tsx scripts/test-vector-search.ts

# 生成 embeddings（需要 OPENAI_API_KEY）
npx tsx scripts/generate-all-embeddings.ts
```

---

## 📁 关键文件

### 后端核心
```
apps/web/src/lib/
├── worldinfo/
│   ├── activationEngine.ts   # 激活引擎（关键词、正则、递归）
│   └── embeddingService.ts   # 向量服务
├── context/
│   ├── contextBuilder.ts     # 上下文构建器
│   └── templates.ts          # 默认模板
└── chat/
    └── summaryService.ts     # 自动总结

apps/web/src/app/api/
└── generate/
    └── route.ts              # 主 AI 生成端点
```

### 数据库
```
packages/database/
├── prisma/
│   └── schema.prisma         # 数据库 Schema
└── src/
    └── lib/
        └── client.ts         # 数据库客户端
```

### 工具类
```
packages/shared/src/utils/
├── tokenCounter.ts           # Token 计数器
└── handlebarsEngine.ts       # 模板引擎
```

---

## 🔧 环境变量

### 必需
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://www.isillytavern.com
```

### 可选（向量功能）
```env
OPENAI_API_KEY=sk-your-key-here
WORLDINFO_AUTO_EMBEDDING=true
WORLDINFO_VECTOR_THRESHOLD=0.7
```

### 可选（上下文系统）
```env
CONTEXT_MAX_TOKENS=4096
CONTEXT_PRESERVE_RATIO=0.8
CONTEXT_ENABLE_AUTO_SUMMARY=true
CONTEXT_SUMMARY_INTERVAL=50
```

---

## 📊 World Info 字段参考

### 基础字段
```typescript
{
  name: string          // 名称
  content: string       // 内容
  enabled: boolean      // 启用状态
  priority: number      // 优先级 (默认 100)
}
```

### 激活触发
```typescript
{
  keywords: string          // 关键词（逗号分隔）
  secondaryKeys: string     // 次要关键词
  keywordsRegex: string     // 正则表达式
  useRegex: boolean         // 启用正则
  selectiveLogic: string    // AND_ALL | AND_ANY | NOT_ALL
  minActivations: number    // 最小激活次数
}
```

### 递归与级联
```typescript
{
  recursive: boolean        // 启用递归
  recursiveLevel: number    // 递归层级 (0=任意层)
  maxRecursionSteps: number // 最大递归步数 (默认 2)
  cascadeTrigger: string    // 触发的 World Info ID（逗号分隔）
}
```

### 状态机制
```typescript
{
  sticky: number      // 持续 N 条消息（0=禁用）
  cooldown: number    // 冷却 N 条消息（0=禁用）
  delay: number       // 延迟 N 条后激活（0=立即）
}
```

### 插入控制
```typescript
{
  position: string         // before_char | after_char | author_note | etc.
  depth: number           // 插入深度（默认 4）
  insertionOrder: number  // 插入顺序（默认 100）
  tokenBudget: number     // Token 预算（默认 500）
  insertionTemplate: string // Handlebars 模板
}
```

### 向量搜索（需 pgvector）
```typescript
{
  activationType: 'vector'  // 启用向量匹配
  vectorThreshold: 0.7      // 相似度阈值（0.0-1.0）
  embeddingVector: number[] // 自动生成（1536维）
}
```

---

## 🎯 常见使用场景

### 场景 1：关键词精确匹配
```json
{
  "name": "战斗系统",
  "keywords": "战斗,攻击,防御",
  "selectiveLogic": "AND_ANY",
  "priority": 100
}
```
**效果**: 用户提到"战斗"、"攻击"或"防御"时激活

### 场景 2：正则表达式匹配
```json
{
  "name": "魔法系统",
  "keywordsRegex": "/魔法|法术|咒语/i",
  "useRegex": true,
  "priority": 90
}
```
**效果**: 匹配"魔法"、"法术"、"咒语"（不区分大小写）

### 场景 3：递归激活链
```json
{
  "name": "森林入口",
  "keywords": "森林,树林",
  "recursive": true,
  "cascadeTrigger": "forest-deep,forest-creatures"
}
```
**效果**: 激活"森林入口"时，自动激活"森林深处"和"森林生物"

### 场景 4：持续状态（Sticky）
```json
{
  "name": "战斗状态",
  "keywords": "开始战斗",
  "sticky": 5
}
```
**效果**: 激活后持续 5 条消息（即使后续消息不包含关键词）

### 场景 5：延迟激活（Delay）
```json
{
  "name": "剧情转折",
  "keywords": "继续",
  "delay": 10
}
```
**效果**: 对话达到 10 条消息后才能激活

### 场景 6：向量语义匹配
```json
{
  "name": "悲伤情绪",
  "content": "角色进入悲伤状态...",
  "activationType": "vector",
  "vectorThreshold": 0.75
}
```
**效果**: 用户说"我很难过"、"感觉失落"等语义相似内容时激活

---

## 🐛 常见问题

### Q: 编译失败怎么办？
```bash
# 清理缓存重新构建
pnpm clean
pnpm install
pnpm run build
```

### Q: 服务无法启动？
```bash
# 检查端口占用
lsof -i :3000

# 查看详细日志
pm2 logs sillytavern-web --lines 50
```

### Q: 数据库连接失败？
```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试连接
PGPASSWORD="..." psql -h localhost -U sillytavern_prod -d sillytavern_prod -c "SELECT 1;"
```

### Q: 向量搜索不工作？
```bash
# 1. 检查 pgvector 扩展
psql ... -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

# 2. 检查 API Key
grep OPENAI_API_KEY .env

# 3. 生成 embeddings
npx tsx scripts/generate-all-embeddings.ts
```

---

## 📈 性能监控

### 实时监控
```bash
# PM2 监控面板
pm2 monit

# 内存占用
pm2 jlist | grep -A 10 sillytavern-web

# 日志实时流
pm2 logs sillytavern-web --raw
```

### 数据库性能
```sql
-- 慢查询
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- 表大小
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔗 有用链接

| 资源 | 链接 |
|------|------|
| **网站** | https://www.isillytavern.com/ |
| **Next.js 文档** | https://nextjs.org/docs |
| **Prisma 文档** | https://www.prisma.io/docs |
| **pgvector** | https://github.com/pgvector/pgvector |
| **PM2 文档** | https://pm2.keymetrics.io/docs |

---

## 📞 技术支持

遇到问题？查看以下文档：

1. [LATEST_DEPLOYMENT.md](LATEST_DEPLOYMENT.md) - 最新部署详情
2. [VECTOR_DEPLOYMENT_COMPLETE.md](VECTOR_DEPLOYMENT_COMPLETE.md) - 向量功能
3. [SYSTEM_STATUS.md](SYSTEM_STATUS.md) - 系统状态
4. [QUICKSTART_CONTEXT_SYSTEM.md](QUICKSTART_CONTEXT_SYSTEM.md) - 快速开始

---

**最后更新**: 2025-10-29 08:45 UTC  
**维护者**: SillyTavern Team  
**状态**: 🟢 生产环境稳定运行

