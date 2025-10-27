# SillyTavern 快速开始指南

## 🚀 快速部署到生产环境

### 第一步：环境变量配置

1. 创建并配置数据库：
```bash
# 创建 PostgreSQL 用户和数据库
sudo -i -u postgres psql
CREATE USER sillytavern_prod WITH PASSWORD 'your_secure_password';
CREATE DATABASE sillytavern_prod OWNER sillytavern_prod;
GRANT ALL PRIVILEGES ON DATABASE sillytavern_prod TO sillytavern_prod;
\q
exit
```

2. 配置环境变量：
```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 创建 .env 文件
nano .env
```

复制以下内容并替换密码：
```env
DATABASE_URL="postgresql://sillytavern_prod:your_secure_password@localhost:5432/sillytavern_prod?schema=public"
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://www.isillytavern.com
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 第二步：数据库初始化

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client
cd packages/database
npx prisma generate

# 运行迁移（创建表结构）
npx prisma migrate deploy

# 导入示例数据（11个高质量角色）
npx prisma db seed

# 验证数据
npx prisma studio
# 访问 http://localhost:5555 查看数据
```

### 第三步：一键部署

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 运行部署脚本
./scripts/deploy.sh
```

部署脚本会自动完成：
- ✅ 备份现有数据
- ✅ 安装依赖
- ✅ 构建应用
- ✅ 启动 PM2
- ✅ 健康检查

### 第四步：配置 Nginx 和 SSL

```bash
# 复制 Nginx 配置
sudo cp nginx/isillytavern.com.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/isillytavern.com.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 获取 SSL 证书
sudo certbot --nginx -d www.isillytavern.com -d isillytavern.com

# 重新加载 Nginx
sudo systemctl reload nginx
```

### 第五步：配置自动备份

```bash
# 设置数据库密码环境变量
echo "export PGPASSWORD='your_secure_password'" >> ~/.bashrc
source ~/.bashrc

# 添加定时任务
crontab -e
# 添加这行（每天凌晨2点备份）：
# 0 2 * * * /www/wwwroot/jiuguanmama/mySillyTavern/scripts/backup-db.sh
```

---

## ✅ 验证部署

```bash
# 检查 PM2 状态
pm2 status

# 查看应用日志
pm2 logs sillytavern-web

# 测试访问
curl https://www.isillytavern.com

# 查看角色数量
cd packages/database
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Character\";"
```

应该看到 11 个角色已导入。

---

## 📦 已导入的角色列表

1. **AI 助手** - 通用智能助手
2. **甜云** - 可爱猫娘
3. **赛博侦探诺娃** - 冷酷侦探
4. **剑圣宫本** - 古代武士
5. **星辰法师艾莉娅** - 魔法师
6. **Unit-7 机器人** - 未来AI
7. **孔子** - 儒家思想家
8. **莎士比亚** - 文艺复兴诗人
9. **酒馆老板娘露西** - RPG NPC
10. **写作导师安娜** - 写作指导
11. **代码导师Alex** - 编程导师

---

## 🔧 常用命令

### 应用管理
```bash
pm2 start ecosystem.production.config.js --env production  # 启动
pm2 restart sillytavern-web                                # 重启
pm2 stop sillytavern-web                                   # 停止
pm2 logs sillytavern-web                                   # 查看日志
pm2 monit                                                  # 监控
```

### 数据库管理
```bash
npx prisma studio          # 打开数据库管理界面
npx prisma migrate deploy  # 运行迁移
npx prisma db seed         # 重新导入种子数据
./scripts/backup-db.sh     # 手动备份
```

### 更新部署
```bash
./scripts/deploy.sh        # 一键更新部署
```

---

## 📚 详细文档

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 完整部署指南
- **[ENV_TEMPLATE.md](./ENV_TEMPLATE.md)** - 环境变量配置详解
- **[PRODUCTION_DEPLOYMENT_COMPLETE.md](./PRODUCTION_DEPLOYMENT_COMPLETE.md)** - 部署完成报告
- **[FEATURE_GUIDE.md](./FEATURE_GUIDE.md)** - 功能使用指南

---

## 🆘 遇到问题？

### 数据库连接失败
```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试连接
psql -U sillytavern_prod -d sillytavern_prod
```

### 应用无法启动
```bash
# 查看详细日志
pm2 logs sillytavern-web --lines 100

# 检查端口占用
sudo netstat -tulpn | grep :3000
```

### Nginx 502 错误
```bash
# 确认应用正在运行
pm2 status

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/sillytavern_error.log
```

---

## 🎉 完成！

部署完成后访问：**https://www.isillytavern.com**

享受您的 SillyTavern 实例！

