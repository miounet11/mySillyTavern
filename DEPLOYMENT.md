# SillyTavern Perfect Clone - 部署指南

## 概述

本指南将帮助您使用Docker部署SillyTavern Perfect Clone。Docker化部署提供了简单、一致且可移植的部署方式。

## 系统要求

### 最低要求
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM
- 5GB 可用磁盘空间
- 支持的平台: Linux, macOS, Windows

### 推荐配置
- 4GB+ RAM
- 10GB+ 可用磁盘空间
- SSD存储（用于更好的性能）

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/sillytavern-perfect-clone.git
cd sillytavern-perfect-clone
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**重要**: 请在 `.env` 文件中配置您的AI模型API密钥：
```env
# OpenAI API密钥
OPENAI_API_KEY=your-openai-api-key

# Anthropic (Claude) API密钥
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google AI API密钥
GOOGLE_AI_API_KEY=your-google-ai-api-key

# 应用密钥
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
```

### 3. 使用部署脚本
```bash
# 给脚本执行权限
chmod +x scripts/deploy.sh

# 部署应用
./scripts/deploy.sh deploy
```

### 4. 访问应用
打开浏览器访问: http://localhost:3000

## 手动部署

如果您想手动控制部署过程：

### 1. 构建Docker镜像
```bash
docker build -t sillytavern-perfect-clone .
```

### 2. 启动服务
```bash
docker-compose up -d
```

### 3. 查看日志
```bash
docker-compose logs -f
```

## 部署脚本命令

部署脚本提供了以下命令：

```bash
# 首次部署
./scripts/deploy.sh deploy

# 启动应用
./scripts/deploy.sh start

# 停止应用
./scripts/deploy.sh stop

# 重启应用
./scripts/deploy.sh restart

# 查看日志
./scripts/deploy.sh logs

# 更新应用
./scripts/deploy.sh update

# 备份数据
./scripts/deploy.sh backup

# 查看状态
./scripts/deploy.sh status

# 显示帮助
./scripts/deploy.sh help
```

## 配置选项

### 数据库配置

#### 默认 (SQLite)
项目默认使用SQLite数据库，数据存储在 `data/` 目录中。

#### PostgreSQL (可选)
如果您更喜欢使用PostgreSQL：

1. 取消注释 `docker-compose.yml` 中的PostgreSQL服务
2. 设置 `POSTGRES_PASSWORD` 环境变量
3. 更新 `DATABASE_URL` 环境变量：
```env
DATABASE_URL=postgresql://sillytavern:your-password@postgres:5432/sillytavern
```

### 缓存配置 (可选)

#### Redis (可选)
使用Redis可以提高性能：

1. 取消注释 `docker-compose.yml` 中的Redis服务
2. 设置 `REDIS_URL` 环境变量：
```env
REDIS_URL=redis://redis:6379
```

### 反向代理配置 (可选)

#### Nginx (可选)
使用Nginx作为反向代理：

1. 取消注释 `docker-compose.yml` 中的Nginx服务
2. 创建 `nginx.conf` 配置文件
3. 配置SSL证书

示例Nginx配置：
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 数据管理

### 数据持久化
以下目录会自动挂载为Docker卷：
- `data/` - 数据库文件
- `uploads/` - 用户上传的文件
- `logs/` - 应用日志

### 数据备份
使用内置备份脚本：
```bash
./scripts/deploy.sh backup
```

备份文件保存在 `backups/` 目录中，包含：
- SQLite数据库文件
- 用户上传文件
- 环境配置文件

### 数据恢复
```bash
# 停止应用
./scripts/deploy.sh stop

# 恢复数据库
cp backups/20240101_120000/sillytavern.db data/

# 恢复上传文件
cp -r backups/20240101_120000/uploads/* uploads/

# 启动应用
./scripts/deploy.sh start
```

## 生产环境配置

### 安全配置
1. **更改默认密钥**：
   ```env
   NEXTAUTH_SECRET=your-super-secure-secret-key-here
   ```

2. **使用强密码**（如果使用PostgreSQL）：
   ```env
   POSTGRES_PASSWORD=your-secure-password-here
   ```

3. **限制API访问**（可选）：
   ```env
   ALLOWED_ORIGINS=https://your-domain.com
   ```

### 性能优化
1. **调整资源限制**：
   在 `docker-compose.yml` 中添加资源限制：
   ```yaml
   app:
     # ... other config
     deploy:
       resources:
         limits:
           cpus: '2.0'
           memory: 2G
         reservations:
           cpus: '1.0'
           memory: 1G
   ```

2. **启用Redis缓存**（如上所述）

3. **使用SSD存储**以获得更好的数据库性能

### 监控
1. **健康检查**：
   应用提供健康检查端点：`http://localhost:3000/api/health`

2. **日志监控**：
   ```bash
   # 查看实时日志
   docker-compose logs -f

   # 查看特定服务的日志
   docker-compose logs -f app
   ```

3. **系统监控**：
   ```bash
   # 查看容器状态
   docker-compose ps

   # 查看资源使用情况
   docker stats
   ```

## 故障排除

### 常见问题

1. **端口冲突**：
   ```
   Error: Port 3000 is already allocated
   ```
   解决方案：更改 `docker-compose.yml` 中的端口映射

2. **权限问题**：
   ```
   Permission denied: ./data
   ```
   解决方案：
   ```bash
   sudo chown -R $USER:$USER data uploads logs
   ```

3. **API密钥错误**：
   ```
   Error: Invalid API key
   ```
   解决方案：检查 `.env` 文件中的API密钥是否正确

4. **内存不足**：
   ```
   Error: JavaScript heap out of memory
   ```
   解决方案：增加系统内存或调整Node.js内存限制

### 调试模式
启用调试模式：
```bash
# 设置调试环境变量
export DEBUG=true

# 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 查看详细日志
```bash
# 查看应用日志
docker-compose logs app

# 查看数据库日志
docker-compose logs postgres  # 如果使用PostgreSQL

# 实时跟踪日志
docker-compose logs -f --tail=100
```

## 更新和维护

### 更新应用
```bash
# 使用脚本自动更新
./scripts/deploy.sh update

# 或手动更新
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 定期维护任务
1. **清理Docker资源**：
   ```bash
   docker system prune -f
   ```

2. **备份数据**：
   ```bash
   # 设置定期备份（可选）
   crontab -e
   # 添加以下行（每天凌晨2点备份）：
   # 0 2 * * * /path/to/sillytavern-perfect-clone/scripts/deploy.sh backup
   ```

3. **监控磁盘使用情况**：
   ```bash
   df -h
   du -sh data/
   ```

## 支持和帮助

如果您遇到问题：

1. 查看 [故障排除](#故障排除) 部分
2. 检查 [GitHub Issues](https://github.com/your-username/sillytavern-perfect-clone/issues)
3. 提交新的Issue并包含：
   - 错误信息
   - 系统信息
   - Docker和Docker Compose版本
   - 相关日志

## 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。