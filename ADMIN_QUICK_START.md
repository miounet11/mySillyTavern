# 🚀 管理员系统快速启动指南

## ⏱️ 5分钟快速部署

### 步骤 1: 配置环境变量（2分钟）

编辑项目根目录的 `.env` 文件：

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern
nano .env  # 或使用其他编辑器
```

添加以下内容：

```bash
# 管理员密码（修改为你自己的密码！）
ADMIN_PASSWORD=your-secure-password-here

# Session密钥（生成一个随机字符串）
SESSION_SECRET=your-random-secret-key-here

# 数据库连接（如果已有则跳过）
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

**生成随机Session密钥：**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 2: 运行数据库迁移（1分钟）

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database

# 方式1：使用Prisma（推荐）
npx prisma db push

# 方式2：手动执行SQL
psql -U your_user -d your_database -f prisma/migrations/20251101_add_category_and_sort/migration.sql
```

### 步骤 3: 重新构建应用（2分钟）

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 安装依赖（如果需要）
pnpm install

# 构建
pnpm build

# 重启服务
pm2 restart sillytavern

# 查看日志确认启动成功
pm2 logs sillytavern
```

## ✅ 验证安装

### 1. 访问管理登录页

打开浏览器访问：

```
https://your-domain.com/admin/characters/login
```

### 2. 输入管理员密码

- 输入你在环境变量中配置的 `ADMIN_PASSWORD`
- 确保使用强密码（至少16个字符，包含大小写、数字、符号）

### 3. 进入管理界面

登录成功后，你应该看到三个Tab：
- ⚙️ **设置**：配置LLM
- ✨ **LLM生成**：生成角色卡
- 📋 **角色管理**：管理所有角色

## 🎯 首次使用流程

### 1. 配置LLM（必需）

1. 点击 **"设置"** Tab
2. 填写表单：
   ```
   配置名称：我的GPT-4
   Provider：openai
   Model：gpt-4
   API Key：sk-xxxxxxxxxxxxxxx
   Base URL：https://api.openai.com/v1（可选）
   Temperature：0.8
   Max Tokens：2000
   ```
3. 点击 **"保存配置"**

### 2. 生成第一个角色

1. 点击 **"LLM生成"** Tab
2. 输入角色描述：
   ```
   一个温柔可爱的猫娘，喜欢撒娇，性格温顺乖巧
   ```
3. 选择分类：**可爱**
4. 选择标签：**温柔、猫娘、可爱**
5. 选择LLM配置：**我的GPT-4**
6. 点击 **"生成角色卡"**
7. 等待10-30秒
8. 预览生成结果
9. 点击 **"发布到社区"**

### 3. 查看社区

访问：`https://your-domain.com/characters/community`

你应该能看到刚才发布的角色！

## 🔧 常见问题

### Q: 忘记管理员密码怎么办？

**A:** 修改 `.env` 文件中的 `ADMIN_PASSWORD`，然后重启应用。

```bash
nano /www/wwwroot/jiuguanmama/mySillyTavern/.env
# 修改 ADMIN_PASSWORD=new-password
pm2 restart sillytavern
```

### Q: 提示"未找到LLM配置"

**A:** 你需要先在"设置"Tab中添加至少一个LLM配置。

### Q: 生成失败，返回JSON解析错误

**A:** 可能的原因：
1. API Key无效或配额用完
2. 模型不支持JSON格式输出
3. Temperature设置过高

**解决方案**：
- 检查API Key是否有效
- 尝试降低Temperature到0.7
- 使用支持JSON的模型（如gpt-4、claude-3）

### Q: 数据库迁移失败

**A:** 手动执行SQL：

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database

# 查看迁移文件内容
cat prisma/migrations/20251101_add_category_and_sort/migration.sql

# 手动执行
psql -U your_user -d your_database -f prisma/migrations/20251101_add_category_and_sort/migration.sql
```

### Q: 社区页面看不到生成的角色

**A:** 检查：
1. 是否点击了"发布到社区"
2. 刷新社区页面
3. 检查角色名称是否重复（不能重复发布）

## 📱 访问路径

| 功能 | 路径 | 说明 |
|------|------|------|
| 管理登录 | `/admin/characters/login` | 首次访问需登录 |
| 管理主页 | `/admin/characters` | 登录后自动跳转 |
| 社区页面 | `/characters/community` | 查看已发布角色 |
| 用户页面 | `/characters` | 用户自己的角色 |

## 🎨 LLM配置建议

### OpenAI（推荐）

```
Provider: openai
Model: gpt-4 或 gpt-3.5-turbo
Temperature: 0.8
Max Tokens: 2000
```

### Anthropic Claude

```
Provider: anthropic
Model: claude-3-opus-20240229
Temperature: 0.8
Max Tokens: 2000
```

### Google Gemini

```
Provider: google
Model: gemini-pro
Temperature: 0.8
Max Tokens: 2000
```

### 自定义（兼容OpenAI API）

```
Provider: openai
Model: 你的模型名称
Base URL: https://your-api-endpoint.com/v1
Temperature: 0.8
Max Tokens: 2000
```

## 💡 生成技巧

### 好的描述示例

✅ **具体详细**：
```
一个温柔可爱的猫娘，有着柔软的猫耳和毛茸茸的尾巴，
喜欢撒娇和陪伴主人，性格温顺乖巧但偶尔会有点小傲娇
```

✅ **包含关键特征**：
```
冷静理智的深海守护者，拥有控制海洋的能力，外表冷酷
但对信任的人会展现温柔的一面
```

❌ **太简单**：
```
一个角色
```

❌ **太模糊**：
```
一个人
```

### 分类和标签建议

| 分类 | 适合的标签 |
|------|-----------|
| 可爱 | 温柔、治愈、萌、甜美、软糯 |
| 冷酷 | 高冷、霸气、强大、理智、冷静 |
| 智慧 | 博学、睿智、导师、学者、聪明 |
| 历史 | 古代、历史人物、传统、文化 |
| 奇幻 | 魔法、冒险、精灵、魔法师 |
| 科幻 | 未来、AI、机器人、太空、科技 |

## 📊 系统状态检查

### 检查服务是否运行

```bash
pm2 list
# 应该看到 sillytavern 状态为 online
```

### 检查日志

```bash
pm2 logs sillytavern --lines 100
```

### 检查数据库

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database
npx prisma studio
# 打开 http://localhost:5555 查看数据库
```

## 🎉 完成！

现在你可以：

- ✅ 通过LLM快速生成角色卡
- ✅ 为角色设置分类和标签
- ✅ 一键发布到社区
- ✅ 统一管理所有角色

**开始使用：** 访问 `/admin/characters` 并登录！

---

## 📚 更多文档

- 完整使用指南：[ADMIN_CHARACTER_SYSTEM.md](./ADMIN_CHARACTER_SYSTEM.md)
- 项目主文档：[README.md](./README.md)

**需要帮助？** 查看日志或检查配置文件。

