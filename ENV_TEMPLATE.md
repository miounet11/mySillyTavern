# 环境变量配置模板

## 项目根目录 `.env`

创建文件：`/www/wwwroot/jiuguanmama/mySillyTavern/.env`

```env
# ===========================================
# Database Configuration
# ===========================================
# PostgreSQL 连接字符串
# 格式: postgresql://用户名:密码@主机:端口/数据库名?schema=public
DATABASE_URL="postgresql://sillytavern_prod:YOUR_PASSWORD_HERE@localhost:5432/sillytavern_prod?schema=public"

# ===========================================
# Application Settings
# ===========================================
NODE_ENV=production
PORT=3000

# ===========================================
# API Configuration
# ===========================================
# 公开访问的 URL
NEXT_PUBLIC_API_URL=https://www.isillytavern.com

# ===========================================
# File Upload
# ===========================================
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760

# ===========================================
# Security
# ===========================================
# Session 密钥 (生成方式: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=GENERATE_A_RANDOM_32_CHARACTER_STRING_HERE

# ===========================================
# Optional: AI Provider API Keys
# ===========================================
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=...
# GOOGLE_AI_API_KEY=...
```

---

## Web 应用 `.env.production`

创建文件：`/www/wwwroot/jiuguanmama/mySillyTavern/apps/web/.env.production`

```env
# ===========================================
# Production Environment Configuration
# ===========================================
NODE_ENV=production

# ===========================================
# Database
# ===========================================
# 确保与根目录的 DATABASE_URL 一致
DATABASE_URL="postgresql://sillytavern_prod:YOUR_PASSWORD_HERE@localhost:5432/sillytavern_prod?schema=public"

# ===========================================
# Application
# ===========================================
PORT=3000
NEXT_PUBLIC_API_URL=https://www.isillytavern.com

# ===========================================
# File Upload
# ===========================================
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760

# ===========================================
# Security
# ===========================================
# 使用与根目录相同的 SESSION_SECRET
SESSION_SECRET=GENERATE_A_RANDOM_32_CHARACTER_STRING_HERE

# ===========================================
# Logging
# ===========================================
LOG_LEVEL=info
```

---

## 生成安全密钥的方法

### 1. 使用 Node.js 生成随机密钥

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 使用 OpenSSL 生成

```bash
openssl rand -hex 32
```

### 3. 使用在线工具

访问 https://randomkeygen.com/ 生成强随机密钥

---

## 配置步骤

### 1. 创建 .env 文件

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 复制模板
cp ENV_TEMPLATE.md .env.temp

# 编辑并填写实际值
nano .env

# 同样为 web 应用创建
cd apps/web
nano .env.production
```

### 2. 替换占位符

需要替换以下占位符：

- `YOUR_PASSWORD_HERE`: PostgreSQL 数据库密码
- `GENERATE_A_RANDOM_32_CHARACTER_STRING_HERE`: 随机生成的 SESSION_SECRET

### 3. 设置文件权限

```bash
# 保护 .env 文件，只有所有者可读写
chmod 600 /www/wwwroot/jiuguanmama/mySillyTavern/.env
chmod 600 /www/wwwroot/jiuguanmama/mySillyTavern/apps/web/.env.production
```

---

## 数据库设置

### 1. 创建 PostgreSQL 用户和数据库

```bash
# 切换到 postgres 用户
sudo -i -u postgres

# 进入 PostgreSQL
psql

# 创建用户（替换密码）
CREATE USER sillytavern_prod WITH PASSWORD 'YOUR_SECURE_PASSWORD';

# 创建数据库
CREATE DATABASE sillytavern_prod OWNER sillytavern_prod;

# 授予权限
GRANT ALL PRIVILEGES ON DATABASE sillytavern_prod TO sillytavern_prod;

# 退出
\q
exit
```

### 2. 测试数据库连接

```bash
# 使用环境变量测试连接
psql "postgresql://sillytavern_prod:YOUR_PASSWORD@localhost:5432/sillytavern_prod"
```

---

## 备份脚本环境变量

在 `~/.bashrc` 或 `~/.bash_profile` 中添加：

```bash
# PostgreSQL 备份密码
export PGPASSWORD='YOUR_DATABASE_PASSWORD'
```

然后执行：

```bash
source ~/.bashrc
```

---

## 安全提示

⚠️ **重要安全建议：**

1. **永远不要提交 `.env` 文件到 Git**
   - 已在 `.gitignore` 中排除
   - 定期检查确认未被追踪

2. **使用强密码**
   - 数据库密码至少 16 个字符
   - 包含大小写字母、数字和特殊字符

3. **定期更换密钥**
   - SESSION_SECRET 每 3-6 个月更换一次
   - 数据库密码每年更换一次

4. **限制文件访问权限**
   ```bash
   chmod 600 .env
   chown your_user:your_user .env
   ```

5. **使用环境变量管理工具**
   - 考虑使用 Vault、AWS Secrets Manager 等
   - 或使用 Docker secrets（如使用 Docker）

---

## 验证配置

### 1. 检查环境变量是否正确加载

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database

# 验证数据库连接
npx prisma studio
```

### 2. 测试应用启动

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 构建应用
pnpm build

# 启动应用
cd apps/web
npm start
```

访问 http://localhost:3000 验证应用是否正常运行。

---

## 故障排除

### 数据库连接错误

如果遇到 `connection refused` 错误：

1. 检查 PostgreSQL 是否运行：
   ```bash
   sudo systemctl status postgresql
   ```

2. 检查 `pg_hba.conf` 配置：
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```
   
   确保有以下行：
   ```
   local   all             all                                     md5
   host    all             all             127.0.0.1/32            md5
   ```

3. 重启 PostgreSQL：
   ```bash
   sudo systemctl restart postgresql
   ```

### 环境变量未加载

如果应用无法读取环境变量：

1. 确认文件位置正确
2. 检查文件名是否正确（`.env` 而不是 `.env.txt`）
3. 确认 PM2 配置中是否正确指定环境变量

---

**配置完成后，继续查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 进行部署。**

