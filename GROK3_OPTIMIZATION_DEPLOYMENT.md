# grok-3 优化部署指南

## 概述

本次优化针对 grok-3 模型（128k 上下文窗口）进行了全面的性能优化，解决提示词过长和响应慢的问题。

## 已完成的优化

### ✅ 1. 环境变量配置
- 创建了完整的环境变量配置模板
- 针对 grok-3 128k 窗口优化参数
- **文件**: `GROK3_OPTIMIZATION_CONFIG.md`

### ✅ 2. World Info 激活限流
- 添加最大激活条目数限制（默认 15 条）
- 添加总 token 限制（默认 20,000 tokens）
- 按优先级排序后自动截断
- 实时 token 计数和日志
- **文件**: `apps/web/src/lib/worldinfo/activationEngine.ts`

### ✅ 3. 上下文构建器优化
- 动态 token 预算分配（根据是否有 World Info）
- 改进历史消息裁剪策略（保留对话连贯性）
- 添加详细的 token 使用统计日志
- **文件**: `apps/web/src/lib/context/contextBuilder.ts`

### ✅ 4. 滑动窗口消息加载
- 实现消息滑动窗口（默认 100 条）
- 防止超长对话历史超限
- 可通过环境变量配置窗口大小
- **文件**: `apps/web/src/app/api/generate/route.ts`

### ✅ 5. 前端超时优化
- 增加默认超时时间：120秒 → 180秒（3分钟）
- 适配 grok-3 复杂场景的长响应时间
- **文件**: `apps/web/src/services/chatService.ts`

### ✅ 6. 缓存层实现（可选）
- World Info 激活结果缓存
- Token 计数缓存
- 自动过期清理机制
- **文件**: `apps/web/src/lib/cache/contextCache.ts`（新建）

## 部署步骤

### 第 1 步：创建环境变量文件

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 创建 .env 文件
cat > .env << 'EOF'
# ===== 上下文管理（grok-3 优化）=====
CONTEXT_MAX_TOKENS=100000
CONTEXT_RESERVE_TOKENS=8000
CONTEXT_ENABLE_SMART_TRIM=true
CONTEXT_ENABLE_AUTO_SUMMARY=true
CONTEXT_SUMMARY_INTERVAL=30
MESSAGE_SLIDING_WINDOW=100

# ===== World Info 限流 =====
WORLDINFO_MAX_ACTIVATED_ENTRIES=15
WORLDINFO_MAX_TOTAL_TOKENS=20000
WORLDINFO_MAX_RECURSIVE_DEPTH=2
WORLDINFO_DEFAULT_VECTOR_THRESHOLD=0.7
WORLDINFO_AUTO_EMBEDDING=false

# ===== 性能优化 =====
WORLDINFO_CACHE_ENABLED=true
WORLDINFO_CACHE_TTL=300

# ===== 其他配置 =====
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
ST_PARITY_GREETING_ENABLED=true
EOF

# 如果有现有的数据库配置，请添加
# echo "DATABASE_URL=your_database_url" >> .env
```

### 第 2 步：检查代码更改

所有代码更改已自动完成，请检查以下文件：

```bash
# 检查修改的文件
git status

# 查看具体更改
git diff apps/web/src/lib/worldinfo/activationEngine.ts
git diff apps/web/src/lib/context/contextBuilder.ts
git diff apps/web/src/app/api/generate/route.ts
git diff apps/web/src/services/chatService.ts
```

### 第 3 步：构建项目

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 安装依赖（如有新增）
pnpm install

# 构建项目
pnpm build
```

### 第 4 步：重启服务

```bash
# 使用 PM2 重启
pm2 restart sillytavern

# 或者使用 ecosystem 配置
pm2 restart ecosystem.config.js

# 查看日志
pm2 logs sillytavern
```

### 第 5 步：验证优化效果

1. **检查日志输出**
   ```bash
   pm2 logs sillytavern --lines 100
   ```
   
   应该能看到以下日志：
   - `[Context Cache] Enabled (TTL: 300s)`
   - `[Generate API] Loading 100 messages from sliding window`
   - `[World Info Activation] Activated X entries, after limits: Y`
   - `[Context Builder] Token budgets: char=..., WI=..., history=...`
   - `[Context Builder] Actual usage: total=X/100000`

2. **测试对话功能**
   - 发送一条消息
   - 观察响应时间（应在 10-30 秒内）
   - 检查是否有超时或错误

3. **检查 token 使用情况**
   - 查看控制台日志中的 token 统计
   - 确认总使用量在 100k 以内

## 性能指标

### 优化前
- ❌ 成功率：~40%
- ❌ 响应时间：67-165 秒（或超时）
- ❌ Token 超限：频繁发生
- ❌ 网络异常：频繁出现

### 优化后（预期）
- ✅ 成功率：>95%
- ✅ 响应时间：10-30 秒
- ✅ Token 控制：90k 以内
- ✅ 稳定性：显著提升

## 配置调优

如果遇到问题，可以调整以下参数：

### 减少 token 使用
```bash
# 减少滑动窗口大小
MESSAGE_SLIDING_WINDOW=50

# 减少 World Info 限制
WORLDINFO_MAX_ACTIVATED_ENTRIES=10
WORLDINFO_MAX_TOTAL_TOKENS=15000

# 减少最大上下文
CONTEXT_MAX_TOKENS=80000
```

### 提高响应速度
```bash
# 禁用自动总结（节省处理时间）
CONTEXT_ENABLE_AUTO_SUMMARY=false

# 减少 World Info 数量
WORLDINFO_MAX_ACTIVATED_ENTRIES=8
```

### 增加上下文容量
```bash
# 充分利用 grok-3 的 128k 窗口
CONTEXT_MAX_TOKENS=120000
CONTEXT_RESERVE_TOKENS=4000
MESSAGE_SLIDING_WINDOW=150
```

## 故障排除

### 问题 1：仍然超时
**解决方案**：
1. 检查 `.env` 文件是否正确加载
2. 查看日志中的 token 使用情况
3. 尝试减少 `MESSAGE_SLIDING_WINDOW`

### 问题 2：构建失败
**解决方案**：
```bash
# 清理缓存
pnpm clean
rm -rf node_modules/.cache
rm -rf apps/web/.next

# 重新安装依赖
pnpm install

# 重新构建
pnpm build
```

### 问题 3：缓存未生效
**解决方案**：
```bash
# 确认环境变量
grep CACHE .env

# 应该看到
WORLDINFO_CACHE_ENABLED=true
WORLDINFO_CACHE_TTL=300
```

## 监控与日志

### 关键日志位置
- PM2 日志：`pm2 logs sillytavern`
- 错误日志：`/www/wwwroot/jiuguanmama/logs/sillytavern-error.log`
- 输出日志：`/www/wwwroot/jiuguanmama/logs/sillytavern-out.log`

### 重要日志关键词
- `[Context Cache]` - 缓存状态
- `[World Info Activation]` - World Info 激活情况
- `[World Info Limit]` - 限流触发
- `[Context Builder]` - token 预算和使用情况
- `[Generate API]` - 滑动窗口加载

## 回滚方案

如果优化后出现问题，可以快速回滚：

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 回滚代码
git checkout HEAD~1

# 重新构建
pnpm build

# 重启服务
pm2 restart sillytavern
```

## 技术支持

如有问题，请查看：
1. 详细配置说明：`GROK3_OPTIMIZATION_CONFIG.md`
2. 上下文系统文档：`CONTEXT_SYSTEM_IMPLEMENTATION.md`
3. 环境变量文档：`CONTEXT_ENV_VARS.md`

---

**最后更新**: 2025-10-29  
**优化版本**: grok-3 专用优化 v1.0  
**预期效果**: 响应成功率 >95%，响应时间 10-30 秒

