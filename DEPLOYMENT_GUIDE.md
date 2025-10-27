# SillyTavern 生产环境部署指南

## 目录
1. [前置要求](#前置要求)
2. [数据库配置](#数据库配置)
3. [应用配置](#应用配置)
4. [构建和部署](#构建和部署)
5. [Nginx 配置](#nginx-配置)
6. [SSL 证书配置](#ssl-证书配置)
7. [备份配置](#备份配置)
8. [监控和维护](#监控和维护)
9. [故障排除](#故障排除)

---

## 前置要求

### 系统要求
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Node.js 18+
- PostgreSQL 14+
- Nginx 1.18+
- PM2
- 至少 2GB RAM
- 至少 20GB 磁盘空间

### 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装 Nginx
sudo apt install -y nginx

# 安装 Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

---

## 数据库配置

### 1. 创建 PostgreSQL 数据库和用户

```bash
# 切换到 postgres 用户
sudo -i -u postgres

# 进入 PostgreSQL
psql

# 创建数据库用户
CREATE USER sillytavern_prod WITH PASSWORD 'your_secure_password_here';

# 创建数据库
CREATE DATABASE sillytavern_prod OWNER sillytavern_prod;

# 授予权限
GRANT ALL PRIVILEGES ON DATABASE sillytavern_prod TO sillytavern_prod;

# 退出
\q
exit
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Database
DATABASE_URL="postgresql://sillytavern_prod:your_secure_password_here@localhost:5432/sillytavern_prod?schema=public"

# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://www.isillytavern.com

# Security
SESSION_SECRET=generate_a_random_32_character_string
```

同样在 `apps/web` 目录创建 `.env.production`：

```bash
cd apps/web
nano .env.production
```

### 3. 运行数据库迁移

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 安装依赖
pnpm install

# 生成 Prisma Client
cd packages/database
npx prisma generate

# 运行迁移
npx prisma migrate deploy

# 导入种子数据（包含11个高质量角色）
npx prisma db seed
```

### 4. 验证数据库

```bash
# 打开 Prisma Studio 查看数据
npx prisma studio
```

访问 http://localhost:5555 查看数据库内容。

---

## 应用配置

### 1. 构建应用

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 安装所有依赖
pnpm install

# 构建应用
pnpm build
```

### 2. 创建日志目录

```bash
sudo mkdir -p /var/log/sillytavern
sudo chown -R $USER:$USER /var/log/sillytavern
```

### 3. 创建备份目录

```bash
mkdir -p /www/wwwroot/jiuguanmama/mySillyTavern/backups
```

---

## 构建和部署

### 使用 PM2 部署

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 启动应用
pm2 start ecosystem.production.config.js --env production

# 保存 PM2 配置
pm2 save

# 设置 PM2 开机自启
pm2 startup
# 按照输出的命令执行
```

### PM2 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs sillytavern-web

# 重启应用
pm2 restart sillytavern-web

# 停止应用
pm2 stop sillytavern-web

# 监控
pm2 monit

# 查看详细信息
pm2 info sillytavern-web
```

---

## Nginx 配置

### 1. 复制 Nginx 配置文件

```bash
# 复制配置文件
sudo cp /www/wwwroot/jiuguanmama/mySillyTavern/nginx/isillytavern.com.conf /etc/nginx/sites-available/

# 创建符号链接
sudo ln -s /etc/nginx/sites-available/isillytavern.com.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

### 2. 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## SSL 证书配置

### 使用 Let's Encrypt (Certbot)

```bash
# 获取 SSL 证书
sudo certbot --nginx -d www.isillytavern.com -d isillytavern.com

# 测试自动续期
sudo certbot renew --dry-run
```

Certbot 会自动修改 Nginx 配置文件并添加 SSL 证书路径。

### 验证 SSL

访问 https://www.isillytavern.com 检查证书是否正常。

---

## 备份配置

### 1. 设置数据库自动备份

```bash
# 给备份脚本添加执行权限
chmod +x /www/wwwroot/jiuguanmama/mySillyTavern/scripts/backup-db.sh

# 设置数据库密码环境变量
echo "export PGPASSWORD='your_secure_password_here'" >> ~/.bashrc
source ~/.bashrc

# 测试备份脚本
/www/wwwroot/jiuguanmama/mySillyTavern/scripts/backup-db.sh
```

### 2. 配置 Crontab 定时任务

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天凌晨 2 点备份）
0 2 * * * /www/wwwroot/jiuguanmama/mySillyTavern/scripts/backup-db.sh
```

### 3. 备份应用文件

```bash
# 创建应用备份脚本
cat > /www/wwwroot/jiuguanmama/mySillyTavern/scripts/backup-app.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/www/wwwroot/backups/sillytavern"
mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='backups' \
  /www/wwwroot/jiuguanmama/mySillyTavern/

echo "Application backup completed: app_backup_$DATE.tar.gz"
EOF

chmod +x /www/wwwroot/jiuguanmama/mySillyTavern/scripts/backup-app.sh
```

---

## 监控和维护

### 1. 系统监控

```bash
# 安装 htop
sudo apt install -y htop

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 2. 应用日志

```bash
# PM2 日志
pm2 logs sillytavern-web --lines 100

# Nginx 访问日志
sudo tail -f /var/log/nginx/sillytavern_access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/sillytavern_error.log

# 数据库日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 3. 性能监控

```bash
# PM2 监控
pm2 monit

# 查看 Node.js 内存使用
pm2 list

# 数据库性能
sudo -u postgres psql -d sillytavern_prod -c "SELECT * FROM pg_stat_activity;"
```

---

## 故障排除

### 应用无法启动

```bash
# 检查日志
pm2 logs sillytavern-web --lines 50

# 检查端口占用
sudo netstat -tulpn | grep :3000

# 检查数据库连接
cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database
npx prisma studio
```

### 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 重启 PostgreSQL
sudo systemctl restart postgresql

# 检查数据库连接
psql -U sillytavern_prod -d sillytavern_prod -h localhost
```

### Nginx 502 错误

```bash
# 检查应用是否运行
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/sillytavern_error.log
```

### SSL 证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 强制更新证书
sudo certbot renew --force-renewal

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 更新部署

### 应用更新流程

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 1. 备份数据库
./scripts/backup-db.sh

# 2. 拉取最新代码
git pull

# 3. 安装新依赖
pnpm install

# 4. 运行数据库迁移
cd packages/database
npx prisma migrate deploy
npx prisma generate

# 5. 重新构建
cd ../..
pnpm build

# 6. 重启应用
pm2 restart sillytavern-web

# 7. 验证部署
pm2 logs sillytavern-web --lines 20
```

---

## 安全建议

1. **定期更新系统和软件包**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **使用强密码**
   - 数据库密码至少 16 个字符
   - SESSION_SECRET 使用随机 32 字符串

3. **限制 SSH 访问**
   - 使用 SSH 密钥认证
   - 禁用 root 登录
   - 更改默认 SSH 端口

4. **配置防火墙**
   ```bash
   sudo ufw status
   ```

5. **定期备份**
   - 数据库每天备份
   - 应用文件每周备份
   - 备份文件异地存储

6. **监控日志**
   - 定期检查错误日志
   - 设置异常告警

---

## 性能优化

1. **数据库优化**
   ```sql
   -- 创建必要的索引
   CREATE INDEX IF NOT EXISTS idx_characters_name ON "Character"(name);
   CREATE INDEX IF NOT EXISTS idx_chats_character ON "Chat"("characterId");
   ```

2. **Nginx 缓存配置**
   - 静态文件使用长时间缓存
   - 启用 gzip 压缩

3. **PM2 集群模式**
   - 根据 CPU 核心数调整实例数量
   - 监控内存使用，适时调整 `max_memory_restart`

4. **CDN 加速**
   - 使用 CDN 分发静态资源
   - 配置正确的 Cache-Control 头

---

## 联系和支持

- 文档：查看项目 README 和其他文档
- 日志：`/var/log/sillytavern/`
- 备份：`/www/wwwroot/jiuguanmama/mySillyTavern/backups/`

---

**部署完成！** 🎉

访问 https://www.isillytavern.com 查看您的 SillyTavern 实例！

