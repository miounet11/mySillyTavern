# 🚀 生产环境部署检查清单

## 域名信息
- **生产域名**: https://www.isillytavern.com/
- **部署日期**: 2025-10-25
- **项目状态**: ✅ 就绪

---

## ✅ 必须完成的项目

### 1. 环境变量配置 🔧

#### 必需配置
```bash
# .env.local 或 .env.production
DATABASE_URL=file:/data/prod.db  # 生产数据库路径
NODE_ENV=production
```

#### 强烈推荐配置
```bash
# JWT密钥（用于会话管理）
JWT_SECRET=<生成一个强随机字符串>

# 生成命令：
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 可选配置（有默认值）
```bash
OPENAI_API_BASE_URL=https://api.openai.com/v1
ANTHROPIC_API_BASE_URL=https://api.anthropic.com
LOCAL_AI_BASE_URL=http://localhost:8080/v1
LOG_LEVEL=info
```

**状态**: ⚠️ 需要检查

---

### 2. 数据库初始化 🗄️

```bash
# 确保数据库目录存在
mkdir -p /data

# 运行数据库迁移
npm run db:migrate

# (可选) 填充初始数据
npm run db:seed
```

**注意事项**:
- 确保数据库文件路径有写权限
- 建议使用持久化存储卷
- 定期备份数据库

**状态**: ⚠️ 需要执行

---

### 3. HTTPS/SSL配置 🔒

你的域名需要HTTPS配置。推荐使用Nginx作为反向代理：

```nginx
# /etc/nginx/sites-available/isillytavern.com
server {
    listen 80;
    server_name www.isillytavern.com isillytavern.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.isillytavern.com isillytavern.com;
    
    # SSL证书配置
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # SSL优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 文件上传大小限制
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
}
```

**获取免费SSL证书**:
```bash
# 使用Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d www.isillytavern.com -d isillytavern.com
```

**状态**: ⚠️ 需要配置

---

### 4. 构建生产版本 📦

```bash
# 安装依赖
npm install --production=false

# 构建应用
npm run build

# 检查构建产物
ls -la apps/web/.next/
```

**状态**: ⚠️ 需要执行

---

### 5. 进程管理 ⚙️

使用PM2管理Node.js进程：

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js --env production

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# 查看日志
pm2 logs sillytavern-clone

# 监控
pm2 monit
```

**PM2配置已存在**: `ecosystem.config.js`

**状态**: ⚠️ 需要执行

---

### 6. 文件上传目录 📁

```bash
# 创建上传目录
mkdir -p public/uploads
chmod 755 public/uploads

# 确保目录可写
chown -R www-data:www-data public/uploads  # 或你的用户
```

**状态**: ⚠️ 需要检查

---

### 7. 安全配置 🛡️

#### 防火墙设置
```bash
# 只允许80和443端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 隐藏内部端口
确保3000端口不对外开放，只通过Nginx代理访问

#### 环境变量保护
```bash
# 设置.env文件权限
chmod 600 .env.local
chown root:root .env.local
```

**状态**: ⚠️ 需要配置

---

## ⚠️ 重要注意事项

### 🔴 必须修改的配置

1. **生成JWT_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
2. **数据库路径改为绝对路径**
   ```bash
   DATABASE_URL=file:/var/www/data/prod.db
   ```

3. **NODE_ENV设置为production**
   ```bash
   NODE_ENV=production
   ```

### 🟡 强烈建议

1. **设置备份策略**
   ```bash
   # 每天自动备份数据库
   0 2 * * * cp /var/www/data/prod.db /var/www/backups/prod-$(date +\%Y\%m\%d).db
   ```

2. **配置日志轮转**
   ```bash
   # /etc/logrotate.d/sillytavern
   /var/log/sillytavern/*.log {
       daily
       rotate 14
       compress
       delaycompress
       notifempty
       create 0640 www-data www-data
   }
   ```

3. **监控和告警**
   - 使用PM2监控进程状态
   - 配置磁盘空间告警
   - 配置内存使用告警

---

## 🧪 上线前测试

### 功能测试清单

```bash
# 1. 健康检查
curl https://www.isillytavern.com/api/health

# 2. 测试角色创建
# 通过UI创建一个测试角色

# 3. 测试AI对话
# 配置一个AI模型并测试对话

# 4. 测试文件上传
# 上传一个角色卡图片

# 5. 测试角色卡导入导出
# 导入一个JSON/PNG角色卡，然后导出

# 6. 检查响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://www.isillytavern.com/
```

**状态**: ⚠️ 需要测试

---

## 📊 性能优化

### Next.js优化

已在 `next.config.js` 中配置：
- ✅ 图片优化
- ✅ 代码分割
- ✅ 压缩

### 数据库优化

```bash
# SQLite优化
# 在数据库连接中添加
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
```

### CDN配置（可选）

考虑使用CDN加速静态资源：
- Cloudflare
- AWS CloudFront
- 阿里云CDN

---

## 📝 上线后监控

### 需要监控的指标

1. **应用状态**
   - 进程运行状态
   - 内存使用率
   - CPU使用率

2. **数据库**
   - 数据库大小
   - 查询性能
   - 连接数

3. **网络**
   - 响应时间
   - 错误率
   - 流量

4. **业务指标**
   - 用户数量
   - 对话数量
   - API调用次数

### 监控命令

```bash
# PM2监控
pm2 monit

# 系统资源
htop

# 磁盘使用
df -h

# 数据库大小
du -sh /var/www/data/

# Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 应用日志
pm2 logs
```

---

## 🚨 应急预案

### 回滚步骤

```bash
# 1. 停止当前版本
pm2 stop sillytavern-clone

# 2. 恢复数据库备份
cp /var/www/backups/prod-backup.db /var/www/data/prod.db

# 3. 切换代码版本
git checkout <previous-version>
npm install
npm run build

# 4. 重启应用
pm2 restart sillytavern-clone
```

### 常见问题排查

1. **应用无法启动**
   - 检查环境变量
   - 检查数据库连接
   - 查看PM2日志

2. **文件上传失败**
   - 检查目录权限
   - 检查磁盘空间
   - 检查Nginx配置

3. **AI调用失败**
   - 检查API密钥
   - 检查网络连接
   - 查看API配置

---

## ✅ 最终检查清单

上线前请确认：

- [ ] 环境变量已配置（特别是JWT_SECRET）
- [ ] 数据库已初始化
- [ ] HTTPS/SSL证书已配置
- [ ] 应用已构建为生产版本
- [ ] PM2进程管理已配置
- [ ] 文件上传目录已创建
- [ ] 防火墙规则已设置
- [ ] 备份策略已配置
- [ ] 功能测试已通过
- [ ] 监控已配置
- [ ] 应急预案已准备

---

## 🎉 上线命令

当所有检查项都完成后，执行以下命令上线：

```bash
# 1. 最后一次构建
npm run build

# 2. 启动生产服务
pm2 start ecosystem.config.js --env production

# 3. 保存进程
pm2 save

# 4. 查看状态
pm2 status

# 5. 查看日志
pm2 logs --lines 50

# 6. 验证服务
curl https://www.isillytavern.com/api/health
```

---

## 📞 支持和反馈

- 项目文档: `/www/wwwroot/jiuguanmama/mySillyTavern/`
- 配置指南: `CONFIGURATION.md`
- 部署指南: `DEPLOYMENT.md`
- 功能列表: `FEATURES.md`

---

**部署准备时间**: 预计30-60分钟
**建议上线时间**: 非高峰时段（如凌晨2-4点）

祝上线顺利！🚀

