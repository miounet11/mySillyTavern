# 上下文持久化系统环境变量配置

## 必需环境变量

将以下环境变量添加到您的 `.env` 文件中：

```bash
# ====================================
# SillyTavern 上下文持久化系统配置
# ====================================

# ===== World Info 高级配置 =====
# 递归激活最大深度
WORLDINFO_MAX_RECURSIVE_DEPTH=2

# 向量相似度默认阈值（0-1，越高越严格）
WORLDINFO_DEFAULT_VECTOR_THRESHOLD=0.7

# 是否自动生成 embedding
WORLDINFO_AUTO_EMBEDDING=true

# ===== 上下文管理 =====
# 最大上下文 tokens（根据模型调整）
# GPT-3.5: 4096, GPT-4: 8192, GPT-4-32k: 32768, Claude-2: 100000
CONTEXT_MAX_TOKENS=8000

# 预留给生成的 tokens
CONTEXT_RESERVE_TOKENS=1000

# 启用智能裁剪
CONTEXT_ENABLE_SMART_TRIM=true

# 启用自动总结
CONTEXT_ENABLE_AUTO_SUMMARY=true

# 自动总结间隔（每N条消息）
CONTEXT_SUMMARY_INTERVAL=50

# ===== Embedding 提供商 =====
# 提供商：openai 或 local
EMBEDDING_PROVIDER=openai

# Embedding 模型
EMBEDDING_MODEL=text-embedding-3-small

# OpenAI API Key（用于 embedding 和总结）
OPENAI_API_KEY=sk-your-openai-api-key-here

# ===== 性能优化 =====
# 启用 World Info 缓存
WORLDINFO_CACHE_ENABLED=true

# 缓存 TTL（秒）
WORLDINFO_CACHE_TTL=300

# ===== 数据库配置（PostgreSQL + pgvector）=====
# 确保使用 PostgreSQL 并已安装 pgvector 扩展
DATABASE_URL=postgresql://user:password@localhost:5432/sillytavern?schema=public
```

## 配置说明

### World Info 配置

- **WORLDINFO_MAX_RECURSIVE_DEPTH**: 递归激活的最大深度，防止无限循环
- **WORLDINFO_DEFAULT_VECTOR_THRESHOLD**: 向量相似度阈值，值越高匹配越严格
- **WORLDINFO_AUTO_EMBEDDING**: 是否在保存 World Info 时自动生成 embedding

### 上下文管理

- **CONTEXT_MAX_TOKENS**: 模型的最大上下文窗口大小
- **CONTEXT_RESERVE_TOKENS**: 预留给 AI 生成的 token 数
- **CONTEXT_ENABLE_SMART_TRIM**: 启用智能裁剪（保留重要内容）
- **CONTEXT_ENABLE_AUTO_SUMMARY**: 启用自动总结功能
- **CONTEXT_SUMMARY_INTERVAL**: 每N条消息生成一次总结

### Embedding 配置

- **EMBEDDING_PROVIDER**: embedding 提供商（openai 或 local）
- **EMBEDDING_MODEL**: 使用的 embedding 模型
- **OPENAI_API_KEY**: OpenAI API 密钥

### 性能优化

- **WORLDINFO_CACHE_ENABLED**: 启用 World Info 缓存
- **WORLDINFO_CACHE_TTL**: 缓存生存时间（秒）

## 不同模型的推荐配置

### GPT-3.5-Turbo (4k)
```bash
CONTEXT_MAX_TOKENS=3000
CONTEXT_RESERVE_TOKENS=1000
```

### GPT-4 (8k)
```bash
CONTEXT_MAX_TOKENS=6000
CONTEXT_RESERVE_TOKENS=2000
```

### GPT-4-32k
```bash
CONTEXT_MAX_TOKENS=28000
CONTEXT_RESERVE_TOKENS=4000
```

### Claude-2 (100k)
```bash
CONTEXT_MAX_TOKENS=90000
CONTEXT_RESERVE_TOKENS=10000
CONTEXT_SUMMARY_INTERVAL=100
```

### Claude-3-Opus (200k)
```bash
CONTEXT_MAX_TOKENS=180000
CONTEXT_RESERVE_TOKENS=20000
CONTEXT_SUMMARY_INTERVAL=200
```

