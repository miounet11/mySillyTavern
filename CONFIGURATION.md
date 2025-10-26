# 配置指南

## 📋 目录
- [环境变量配置](#环境变量配置)
- [数据库设置](#数据库设置)
- [AI提供商配置](#ai提供商配置)
- [文件上传配置](#文件上传配置)
- [安全配置](#安全配置)
- [开发配置](#开发配置)

## 🔧 环境变量配置

### 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
cp .env.example .env.local
# 或者
touch .env.local
```

### 必需的环境变量

```bash
# 数据库连接 (必需)
DATABASE_URL=file:./dev.db
```

### 可选的环境变量

#### AI提供商基础URL
这些都有默认值，只有在需要自定义时才设置：

```bash
# OpenAI API 基础URL (默认: https://api.openai.com/v1)
OPENAI_API_BASE_URL=https://api.openai.com/v1

# Anthropic API 基础URL (默认: https://api.anthropic.com)
ANTHROPIC_API_BASE_URL=https://api.anthropic.com

# 本地AI模型URL (默认: http://localhost:8080/v1)
LOCAL_AI_BASE_URL=http://localhost:8080/v1

# 向量嵌入服务URL (默认: http://localhost:5000/embeddings)
EMBEDDINGS_API_URL=http://localhost:5000/embeddings
```

#### 应用配置

```bash
# 运行环境
NODE_ENV=development  # 或 production

# 日志级别
LOG_LEVEL=info  # debug, info, warn, error
```

## 🗄️ 数据库设置

### SQLite (默认)

项目默认使用SQLite，无需额外配置：

```bash
DATABASE_URL=file:./dev.db
```

### 初始化数据库

```bash
# 安装依赖
npm install

# 运行数据库迁移
npm run db:migrate

# (可选) 填充示例数据
npm run db:seed
```

### 数据库位置

- 开发环境: `packages/dev.db`
- 生产环境: 配置为绝对路径或持久化卷

## 🤖 AI提供商配置

### 配置方式

AI提供商的API密钥有两种配置方式：

#### 方式1: 通过UI配置 (推荐)

1. 启动应用后访问 `设置 → AI模型`
2. 添加新模型
3. 选择提供商 (OpenAI, Anthropic, Google等)
4. 输入API密钥和其他配置
5. 测试连接

#### 方式2: 环境变量 (可选)

如果希望设置默认API密钥：

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

### 支持的AI提供商

| 提供商 | 模型示例 | 配置要求 |
|--------|---------|----------|
| OpenAI | gpt-4, gpt-3.5-turbo | API Key |
| Anthropic | claude-3-opus, claude-2 | API Key |
| Google | gemini-pro | API Key |
| Local | llama-2, mistral | 基础URL (可选API Key) |

### OpenAI

```typescript
{
  provider: 'openai',
  model: 'gpt-4',
  apiKey: 'sk-...',
  baseUrl: 'https://api.openai.com/v1', // 可选
  settings: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0
  }
}
```

### Anthropic

```typescript
{
  provider: 'anthropic',
  model: 'claude-3-opus-20240229',
  apiKey: 'sk-ant-...',
  baseUrl: 'https://api.anthropic.com', // 可选
  settings: {
    temperature: 0.7,
    maxTokens: 4096
  }
}
```

### Google Gemini

```typescript
{
  provider: 'google',
  model: 'gemini-pro',
  apiKey: 'AIza...',
  settings: {
    temperature: 0.7,
    maxTokens: 2048
  }
}
```

### 本地模型

支持OpenAI兼容API的本地模型（如Ollama, LM Studio等）：

```typescript
{
  provider: 'local',
  model: 'llama-2-7b',
  baseUrl: 'http://localhost:11434/v1', // Ollama示例
  apiKey: '', // 多数本地模型不需要
  settings: {
    temperature: 0.7,
    maxTokens: 2000
  }
}
```

## 📁 文件上传配置

### 默认设置

```bash
# 最大文件大小 (10MB)
MAX_FILE_SIZE=10485760

# 上传目录
UPLOAD_DIR=public/uploads
```

### 支持的文件类型

- **图片**: JPG, PNG, GIF, WebP
- **文档**: TXT, JSON, PDF
- **角色卡**: PNG (with embedded data), JSON

### 文件存储

- 开发环境: 存储在 `public/uploads/`
- 生产环境: 建议使用对象存储服务 (S3, MinIO等)

## 🔒 安全配置

### 生产环境建议

```bash
# JWT密钥 (必需在生产环境)
JWT_SECRET=your-very-secure-random-string-here

# 会话超时 (毫秒)
SESSION_TIMEOUT=86400000  # 24小时

# 最大登录尝试次数
MAX_LOGIN_ATTEMPTS=5
```

### 生成JWT密钥

```bash
# 使用Node.js生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### HTTPS配置

生产环境强烈建议使用HTTPS：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 开发配置

### 开发环境专用设置

```bash
# 启用调试模式
DEBUG_MODE=true

# 显示性能指标
SHOW_PERFORMANCE_METRICS=true

# 热重载延迟 (毫秒)
HOT_RELOAD_DELAY=1000
```

### 开发服务器

```bash
# 启动开发服务器
npm run dev

# 启动时指定端口
PORT=3000 npm run dev
```

### 调试

```bash
# 启用Node.js调试
NODE_OPTIONS='--inspect' npm run dev

# 然后在Chrome中打开 chrome://inspect
```

## 🚀 生产部署配置

### Docker部署

```bash
# 构建生产镜像
docker build -t sillytavern-clone:latest .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=file:/data/prod.db \
  -e NODE_ENV=production \
  -v $(pwd)/data:/data \
  sillytavern-clone:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/data/prod.db
      - NODE_ENV=production
      - OPENAI_API_BASE_URL=https://api.openai.com/v1
    volumes:
      - ./data:/data
      - ./uploads:/app/public/uploads
    restart: unless-stopped
```

### PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup
```

## 🧪 测试配置

### 测试环境变量

创建 `.env.test`:

```bash
DATABASE_URL=file:./test.db
NODE_ENV=test
LOG_LEVEL=error
```

### 运行测试

```bash
# 单元测试
npm run test:unit

# E2E测试
npm run test:e2e

# 覆盖率测试
npm run test:coverage
```

## 📊 监控配置

### 可选的监控服务

```bash
# Sentry错误追踪
SENTRY_DSN=https://...@sentry.io/...

# Google Analytics
ANALYTICS_ID=UA-...

# 自定义监控端点
MONITORING_ENDPOINT=https://monitoring.example.com/api
```

## ❓ 常见问题

### Q: API密钥应该放在哪里？

**A**: 推荐通过UI配置。如果需要默认值，可以设置环境变量。

### Q: 如何切换数据库？

**A**: 修改 `DATABASE_URL`，支持SQLite、PostgreSQL、MySQL等。

### Q: 本地模型如何配置？

**A**: 设置 `LOCAL_AI_BASE_URL` 指向本地模型API，大多数遵循OpenAI格式。

### Q: 文件上传失败怎么办？

**A**: 检查：
1. `UPLOAD_DIR` 目录是否存在且有写权限
2. 文件大小是否超过 `MAX_FILE_SIZE`
3. 磁盘空间是否充足

### Q: 如何启用HTTPS？

**A**: 在Next.js前面使用反向代理 (Nginx, Caddy等) 处理SSL。

## 📚 相关文档

- [README.md](README.md) - 项目概览
- [DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南
- [CODE_QUALITY_AUDIT.md](CODE_QUALITY_AUDIT.md) - 代码质量审计
- [CODE_FIXES_SUMMARY.md](CODE_FIXES_SUMMARY.md) - 修复总结

---

如有问题，请查看文档或提交Issue。

