# 用户设置更新说明

## 更新日期
2025-10-29

## 更新内容

### 1. 新增字段

在"设置中心"的"常规"标签页中，新增了以下字段：

#### 用户ID
- **位置**: 常规设置顶部
- **类型**: 只读显示
- **说明**: 显示当前用户的唯一标识符
- **特性**: 灰色背景，禁用状态，不可编辑

#### 用户名
- **位置**: 用户ID下方
- **类型**: 可编辑输入框
- **说明**: 用户可以设置个性化的用户名
- **提示**: 带有黄色星号标记，鼓励用户设置
- **验证**: 会检查用户名是否已被使用
- **提示文字**: "建议设置一个个性化的用户名"

#### 绑定邮箱
- **位置**: 用户名下方
- **类型**: 邮箱输入框
- **说明**: 用户可以绑定邮箱地址
- **验证**: 无需邮箱验证，填写即可
- **用途**: 用于找回账号和接收通知
- **提示文字**: "用于找回账号和接收通知（无需验证）"

### 2. 数据存储

所有用户信息都会保存到数据库中：

- **用户ID**: 自动生成，存储在 `User` 表的 `id` 字段
- **用户名**: 存储在 `User` 表的 `username` 字段
- **邮箱**: 存储在 `User` 表的 `email` 字段（可为空）

数据库表结构（User表）：
```prisma
model User {
  id               String   @id @default(cuid())
  username         String
  email            String?  @unique
  settings         String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  ...
}
```

### 3. API更新

#### GET /api/users/current
返回当前用户的完整信息：
```json
{
  "success": true,
  "data": {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱地址",
    "settings": {},
    "createdAt": "创建时间",
    "updatedAt": "更新时间"
  }
}
```

#### PATCH /api/users/current
更新用户信息，支持以下字段：
```json
{
  "username": "新用户名",
  "email": "新邮箱地址"
}
```

### 4. 修改的文件

1. **前端组件**
   - `/apps/web/src/components/settings/SettingsDrawer.tsx`
     - 添加了用户ID、邮箱状态变量
     - 新增 `loadUserData()` 函数从API获取用户信息
     - 更新 `saveGeneralSettings()` 函数将数据保存到数据库
     - 更新UI界面，添加用户ID、邮箱输入框

2. **后端API**
   - `/apps/web/src/app/api/users/current/route.ts`
     - 更新验证schema，支持email字段
     - 更新PATCH方法处理email参数

3. **用户管理工具**
   - `/apps/web/src/lib/auth/userManager.ts`
     - 更新 `updateUser()` 函数类型定义，支持 `email?: string | null`

### 5. 功能特性

- ✅ 用户ID自动生成，永不改变
- ✅ 用户名支持自定义，带重复检查
- ✅ 邮箱绑定无需验证，可随时修改
- ✅ 所有信息实时保存到PostgreSQL数据库
- ✅ 界面友好，带有清晰的提示信息
- ✅ 支持邮箱清空（设为null）

### 6. 使用说明

1. 打开应用，点击右上角的设置图标
2. 在"常规"标签页中查看：
   - 用户ID：查看您的唯一标识
   - 用户名：设置或修改您的用户名
   - 绑定邮箱：输入您的邮箱地址
3. 点击"保存设置"按钮保存更改
4. 系统会显示"设置已保存"的提示

### 7. 验证测试

构建状态: ✅ 成功
```bash
npm run build
# Tasks: 4 successful, 4 total
# Time: 1m4.562s
```

服务状态: ✅ 运行中
```bash
pm2 restart all
# [PM2] [sillytavern-web](0) ✓
# status: online
```

## 技术栈

- **前端**: React + Next.js 14 + TypeScript
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **验证**: Zod Schema Validation
- **UI组件**: Tailwind CSS + Custom Components
- **状态管理**: React Hooks

## 安全说明

- 用户ID使用CUID生成，保证唯一性和安全性
- 邮箱字段在数据库中有唯一索引，防止重复
- 用户名检查防止冲突
- 所有API请求都经过Cookie验证

---

**开发完成**: 2025-10-29
**状态**: ✅ 已部署上线

