# LLM角色卡管理系统 - 使用指南

## 🎯 系统概述

这是一个基于LLM的角色卡管理系统，可以通过AI自动生成角色卡并发布到社区。

### 核心功能

- ✨ **LLM自动生成**：输入简短描述，AI生成完整角色卡
- 🏷️ **分类标签系统**：角色支持分类和多标签
- 🌐 **社区发布**：一键发布角色到社区
- 📊 **统一管理**：管理所有用户角色和社区角色
- 🔐 **密码保护**：简单密码验证，无需额外管理员系统

## 📦 安装步骤

### 1. 配置环境变量

创建或编辑项目根目录的 `.env` 文件，添加以下内容：

```bash
# 管理员密码（必需）
ADMIN_PASSWORD=your-secure-password

# Session 密钥（必需）
# 生成方法: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your-random-secret-key

# 默认LLM配置（可选，也可以在管理界面配置）
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4
DEFAULT_LLM_BASE_URL=https://api.openai.com/v1
DEFAULT_LLM_API_KEY=sk-xxx
```

### 2. 运行数据库迁移

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database

# 应用迁移
npx prisma migrate dev

# 或者手动执行SQL
psql -U your_user -d your_database -f prisma/migrations/20251101_add_category_and_sort/migration.sql
```

### 3. 重新构建并启动应用

```bash
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 构建
pnpm build

# 重启服务
pm2 restart sillytavern
```

## 🚀 使用指南

### 访问管理界面

1. 打开浏览器访问：`https://your-domain.com/admin/characters`
2. 输入管理员密码（已在环境变量中配置的 ADMIN_PASSWORD）
3. 登录成功后进入管理系统

### Tab 1: 设置（LLM配置）

**首次使用必须先配置LLM！**

1. 点击"设置"Tab
2. 填写LLM配置信息：
   - **配置名称**：例如 "GPT-4 生产环境"
   - **Provider**：选择提供商（OpenAI、Anthropic等）
   - **Model**：填写模型名称（如 gpt-4、claude-3-opus）
   - **API Key**：填写你的API密钥
   - **Base URL**：可选，使用自定义API端点
   - **Temperature**：建议 0.7-0.9（创造性参数）
   - **Max Tokens**：建议 2000
3. 点击"保存配置"

### Tab 2: LLM生成

**快速生成角色卡：**

1. 点击"LLM生成"Tab
2. 填写表单：
   - **角色描述***：简短描述（1-2句话）
     - 例如：`一个温柔可爱的猫娘，喜欢撒娇，性格温顺乖巧`
   - **分类**：选择分类（可爱、冷酷、智慧等）
   - **LLM配置***：选择使用哪个LLM配置
   - **标签**：选择或输入标签（多选）
3. 点击"生成角色卡"按钮
4. 等待AI生成（通常10-30秒）
5. 预览生成结果：
   - 查看名称、描述、个性、开场白
   - 确认无误后点击"发布到社区"
   - 或点击"重新生成"重新创建

**批量生成技巧：**

- 可以连续生成多个角色
- 每次生成后可选择发布或重新生成
- 建议先生成预览，确认满意再发布

### Tab 3: 角色管理

**管理所有角色：**

1. 点击"角色管理"Tab
2. 查看所有角色列表（用户角色 + 社区角色）
3. 使用搜索框搜索角色
4. 筛选类型：全部 / 用户角色 / 社区角色

**操作功能：**

- 🚀 **发布到社区**：将用户角色发布到社区
- 📥 **从社区移除**：取消发布社区角色
- 🗑️ **删除角色**：永久删除角色

**发布规则：**

- 用户角色：可以发布到社区
- 社区角色：已在社区，可以移除
- 发布后角色会出现在 `/characters/community` 页面

## 🎨 角色卡字段说明

LLM会自动生成以下字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| **name** | 角色名称 | 甜云、极光海域 |
| **description** | 角色描述 | 外貌、身份、特点（200-300字） |
| **personality** | 个性特点 | 温柔、可爱、傲娇、聪明 |
| **firstMessage** | 开场白 | 角色的第一句话（50-100字） |
| **exampleMessages** | 示例对话 | 3-5条对话示例 |
| **background** | 背景故事 | 角色的背景和经历 |
| **scenario** | 互动场景 | 角色出现的场景设定 |
| **systemPrompt** | 系统提示词 | 指导AI如何扮演角色 |
| **tags** | 标签 | 可爱、猫娘、治愈等 |
| **category** | 分类 | 可爱、冷酷、智慧等 |

## 🔒 安全建议

1. **使用强密码**
   - 在 `.env` 或 PM2 配置中设置 `ADMIN_PASSWORD`
   - 建议至少16个字符，包含大小写字母、数字和符号

2. **保护 API Key**
   - API Key 会加密存储在数据库
   - 不要在代码中硬编码 API Key

3. **限制访问**
   - Session 有效期 24 小时
   - 定期检查管理日志

## 📊 数据库变更

本系统添加了以下数据库变更：

### Character 表新增字段

```sql
ALTER TABLE "Character" ADD COLUMN "category" TEXT;
ALTER TABLE "Character" ADD COLUMN "sortOrder" INTEGER DEFAULT 0;
```

### 新增 CharacterCategory 表

```sql
CREATE TABLE "CharacterCategory" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 默认分类

系统预置了8个分类：
- 🐱 可爱
- ❄️ 冷酷
- 🧠 智慧
- 📜 历史
- 🔮 奇幻
- 🚀 科幻
- 🏠 日常
- 🤖 助手

## 🛠️ 故障排除

### 问题1：无法访问管理页面

**解决方案**：
- 检查是否已登录
- 清除浏览器 Cookie
- 检查 SESSION_SECRET 是否配置

### 问题2：生成失败，提示"未找到LLM配置"

**解决方案**：
- 进入"设置"Tab
- 添加至少一个LLM配置
- 确保API Key有效

### 问题3：生成返回格式错误

**解决方案**：
- 检查LLM模型是否支持JSON格式
- 尝试降低Temperature（如0.7）
- 查看浏览器控制台的详细错误

### 问题4：发布到社区失败

**解决方案**：
- 检查角色名称是否重复
- 确保角色数据完整
- 查看服务器日志

## 📝 最佳实践

### 生成高质量角色

1. **描述清晰具体**
   - ✅ "一个温柔可爱的猫娘，喜欢撒娇，性格温顺乖巧"
   - ❌ "一个角色"

2. **选择合适的分类和标签**
   - 分类：角色的主要特征
   - 标签：角色的多个属性

3. **Temperature 设置**
   - 0.7-0.8：更一致的风格
   - 0.8-1.0：更有创造性

### 管理角色库

1. 定期清理不需要的角色
2. 为角色添加准确的分类和标签
3. 发布前预览确认质量
4. 避免重复发布相似角色

## 🔗 API端点

如果需要通过API访问：

### 认证

```bash
POST /api/admin/auth/login
Body: { "password": "your-password" }
```

### 生成角色

```bash
POST /api/admin/characters/generate
Headers: Cookie: admin_session=xxx
Body: {
  "description": "角色描述",
  "category": "可爱",
  "tags": ["温柔", "猫娘"],
  "llmConfigId": "config-id"
}
```

### 发布到社区

```bash
POST /api/admin/characters/publish
Headers: Cookie: admin_session=xxx
Body: {
  "characterId": "character-id",
  "author": "作者名"
}
```

## 🎉 总结

现在你可以：

1. ✅ 通过LLM快速生成角色卡
2. ✅ 为角色设置分类和标签
3. ✅ 一键发布到社区
4. ✅ 统一管理所有角色
5. ✅ 简单密码保护，安全便捷

**开始使用：** 访问 `/admin/characters` 并登录！

---

**遇到问题？** 请查看日志或联系技术支持。

