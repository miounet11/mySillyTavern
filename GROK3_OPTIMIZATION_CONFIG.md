# grok-3 多用户平台极速优化配置

## 🚀 生产环境 - 速度优先配置

**注意**：此配置针对**多用户平台**优化，优先考虑**响应速度**而非最大上下文。

请在项目根目录创建 `.env` 文件，添加以下配置：

```bash
# ====================================
# SillyTavern 多用户平台速度优化配置
# 目标：5-15秒响应 | 高并发支持
# ====================================

# ===== 上下文管理（速度优先）=====
# 最大上下文 tokens (降低到 40k，加快处理速度)
CONTEXT_MAX_TOKENS=40000

# 预留给生成的 tokens (快速响应，短回复)
CONTEXT_RESERVE_TOKENS=4000

# 启用智能裁剪
CONTEXT_ENABLE_SMART_TRIM=true

# 禁用自动总结（节省处理时间）
CONTEXT_ENABLE_AUTO_SUMMARY=false

# 自动总结间隔（禁用后不生效）
CONTEXT_SUMMARY_INTERVAL=50

# 滑动窗口：最多加载 30 条历史消息（快速加载）
MESSAGE_SLIDING_WINDOW=30

# ===== World Info 激活限流（严格限制）=====
# 最多激活的 World Info 条目数（减少计算）
WORLDINFO_MAX_ACTIVATED_ENTRIES=8

# World Info 总 token 限制（严格控制）
WORLDINFO_MAX_TOTAL_TOKENS=10000

# 递归激活最大深度
WORLDINFO_MAX_RECURSIVE_DEPTH=2

# 向量相似度默认阈值（0-1，越高越严格）
WORLDINFO_DEFAULT_VECTOR_THRESHOLD=0.7

# 是否自动生成 embedding
WORLDINFO_AUTO_EMBEDDING=false

# ===== 性能优化 =====
# 启用 World Info 缓存
WORLDINFO_CACHE_ENABLED=true

# 缓存 TTL（秒）
WORLDINFO_CACHE_TTL=300

# ===== Embedding 提供商（可选）=====
# 提供商：openai 或 local
EMBEDDING_PROVIDER=openai

# Embedding 模型
EMBEDDING_MODEL=text-embedding-3-small

# OpenAI API Key（用于 embedding 和总结，可选）
# OPENAI_API_KEY=sk-your-openai-api-key-here

# ===== 数据库配置（PostgreSQL + pgvector）=====
# 请根据实际情况修改数据库连接
# DATABASE_URL=postgresql://user:password@localhost:5432/sillytavern?schema=public

# ===== 其他配置 =====
# SillyTavern 兼容性：启用问候语
ST_PARITY_GREETING_ENABLED=true
```

## 快速创建命令

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 复制上述内容到 .env 文件
cat > .env << 'EOF'
CONTEXT_MAX_TOKENS=100000
CONTEXT_RESERVE_TOKENS=8000
CONTEXT_ENABLE_SMART_TRIM=true
CONTEXT_ENABLE_AUTO_SUMMARY=true
CONTEXT_SUMMARY_INTERVAL=30
MESSAGE_SLIDING_WINDOW=100
WORLDINFO_MAX_ACTIVATED_ENTRIES=15
WORLDINFO_MAX_TOTAL_TOKENS=20000
WORLDINFO_MAX_RECURSIVE_DEPTH=2
WORLDINFO_DEFAULT_VECTOR_THRESHOLD=0.7
WORLDINFO_AUTO_EMBEDDING=false
WORLDINFO_CACHE_ENABLED=true
WORLDINFO_CACHE_TTL=300
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
ST_PARITY_GREETING_ENABLED=true
EOF
```

## 配置说明

### grok-3 模型特性
- **上下文窗口**: 128k tokens
- **本配置使用**: 100k tokens 输入 + 8k tokens 输出预留 + 20k 安全边界

### 关键优化点

1. **滑动窗口 (100 条消息)**
   - 防止超长对话历史超限
   - 保留最近对话上下文

2. **World Info 限流 (15 条 / 20k tokens)**
   - 避免过多 World Info 注入
   - 按优先级自动截断

3. **自动总结 (每 30 条消息)**
   - 压缩旧对话为摘要
   - 节省 token 消耗

4. **智能裁剪**
   - 动态调整各组件 token 分配
   - 保证关键信息不丢失

## 注意事项

1. 请根据实际数据库连接修改 `DATABASE_URL`
2. 如需使用 embedding 功能，请配置 `OPENAI_API_KEY`
3. 所有参数可根据实际使用情况微调
4. 修改配置后需重启服务：`pm2 restart sillytavern`

