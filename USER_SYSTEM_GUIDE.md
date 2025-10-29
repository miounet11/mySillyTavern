# 用户系统使用指南

## 概述

本系统实现了基于 Cookie 的无注册用户系统，具有以下特点：

- **无需注册**：用户首次访问自动创建账号
- **自动识别**：通过 Cookie 自动识别返回用户
- **独立数据**：每个用户拥有独立的角色卡和 AI 配置
- **本地聊天**：聊天记录存储在浏览器 IndexedDB 中
- **账号找回**：支持通过邮箱找回账号

## 核心功能

### 1. 自动用户创建

用户首次访问时，系统会：
1. 自动生成用户名（格式：`访客_xxxxx`）
2. 创建用户记录存储到数据库
3. 设置 Cookie（有效期 1 年）

### 2. 用户数据隔离

#### 数据库存储（服务端）
- **用户信息**：用户名、邮箱、设置
- **角色卡**：每个用户的角色卡独立存储
- **AI 配置**：每个用户的 API 密钥等配置独立存储

#### 本地存储（客户端）
- **聊天记录**：存储在浏览器 IndexedDB
- **消息内容**：按用户 ID 隔离
- **支持导入导出**：可备份和恢复聊天记录

### 3. 用户管理

#### 修改用户名
1. 进入"设置" → "用户信息"
2. 点击用户名旁的"编辑"按钮
3. 输入新用户名并保存

#### 绑定邮箱
1. 进入"设置" → "用户信息"
2. 点击邮箱旁的"绑定"按钮
3. 输入邮箱地址并保存

#### 账号找回
1. 在设置页面点击"找回账号"
2. 输入之前绑定的邮箱地址
3. 系统将自动切换到该账号

## 技术架构

### Cookie 管理
- **Cookie 名称**：`st_user_id`
- **有效期**：1 年
- **安全性**：HttpOnly + Secure（生产环境）
- **作用域**：SameSite=Lax

### 数据存储

#### 数据库（PostgreSQL + Prisma）
```
User 表
├─ id (主键)
├─ username (用户名)
├─ email (邮箱，可选)
└─ settings (JSON 配置)

Character 表
├─ id
├─ userId (外键 → User.id)
└─ ... (角色信息)

AIModelConfig 表
├─ id
├─ userId (外键 → User.id)
└─ ... (模型配置)
```

#### IndexedDB（客户端）
```
sillytavern_chats 数据库
├─ chats 对象存储
│  ├─ 索引：userId, characterId, updatedAt
│  └─ 数据：{id, userId, characterId, title, ...}
└─ messages 对象存储
   ├─ 索引：chatId, userId, timestamp
   └─ 数据：{id, chatId, userId, role, content, ...}
```

### API 路由

#### 用户相关 API
- `GET /api/users/current` - 获取当前用户信息
- `PATCH /api/users/current` - 更新用户信息
- `POST /api/users/bind-email` - 绑定邮箱
- `POST /api/users/recover` - 通过邮箱找回账号

#### 数据 API（自动过滤用户）
- `GET /api/characters` - 获取当前用户的角色列表
- `POST /api/characters` - 创建角色（自动关联到当前用户）
- `GET /api/ai-models` - 获取当前用户的 AI 配置
- `POST /api/ai-models` - 创建 AI 配置（自动关联到当前用户）

## 部署和迁移

### 1. 数据库迁移

首次部署或更新数据库结构时，执行：

```bash
# 生成 Prisma 迁移
cd packages/database
npx prisma migrate dev --name add_user_system

# 应用到生产环境
npx prisma migrate deploy
```

### 2. 数据迁移

将现有数据迁移到新用户系统：

```bash
# 在项目根目录执行
pnpm run db:migrate-user-system
```

迁移脚本会：
1. 创建默认用户
2. 将现有角色关联到默认用户
3. 将现有 AI 配置关联到默认用户
4. 迁移提示词模板

### 3. 安装依赖

```bash
# 安装新依赖（idb 用于 IndexedDB）
cd apps/web
pnpm install idb
```

### 4. 环境变量

确保 `.env` 文件包含以下配置：

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/sillytavern"
NODE_ENV="production" # 或 "development"
```

## 使用示例

### 前端：获取当前用户

```typescript
import { useUserStore } from '@/stores/userStore'

function MyComponent() {
  const { user, fetchCurrentUser } = useUserStore()
  
  useEffect(() => {
    fetchCurrentUser()
  }, [])
  
  return <div>欢迎，{user?.username}</div>
}
```

### 前端：使用 IndexedDB 存储聊天

```typescript
import { saveChat, getMessagesByChatId } from '@/lib/storage/indexedDB'

// 保存聊天
await saveChat({
  id: 'chat-123',
  userId: user.id,
  characterId: 'char-456',
  title: '与 AI 的对话',
  // ...
})

// 获取消息
const messages = await getMessagesByChatId('chat-123')
```

### 后端：API 自动过滤用户

```typescript
// /api/characters/route.ts
import { getUserIdFromCookie } from '@/lib/auth/cookies'
import { ensureUser } from '@/lib/auth/userManager'

export async function GET(request: NextRequest) {
  // 获取或创建用户
  const userId = await getUserIdFromCookie()
  const user = await ensureUser(userId)
  
  // 只查询当前用户的角色
  const characters = await db.findMany('Character', {
    where: { userId: user.id }
  })
  
  return NextResponse.json({ characters })
}
```

## 安全注意事项

1. **Cookie 安全**
   - 生产环境使用 HTTPS
   - 启用 HttpOnly 防止 XSS 攻击
   - 启用 Secure 属性

2. **API 验证**
   - 所有 API 都会验证用户 ID
   - 防止用户访问他人数据

3. **敏感信息**
   - API Key 存储在数据库（建议加密）
   - 用户 ID 部分脱敏显示

4. **本地数据**
   - IndexedDB 数据存储在用户浏览器
   - 清除浏览器数据会删除聊天记录
   - 建议定期导出备份

## 故障排查

### 问题：用户信息加载失败

**解决方案**：
1. 检查数据库连接
2. 查看浏览器 Console 错误
3. 确认 Cookie 是否正确设置

### 问题：聊天记录丢失

**原因**：IndexedDB 被清除

**预防**：
- 使用导出功能定期备份
- 提醒用户不要清除浏览器数据

### 问题：找不到用户账号

**解决方案**：
1. 确认邮箱是否已绑定
2. 检查数据库中的 email 字段
3. 联系管理员手动恢复

## 后续优化建议

1. **邮箱验证**：发送验证码验证邮箱所有权
2. **数据同步**：将 IndexedDB 数据同步到云端
3. **多设备支持**：通过账号登录实现多设备访问
4. **数据加密**：加密存储敏感的 API Key
5. **访问统计**：记录用户活跃度和使用情况

