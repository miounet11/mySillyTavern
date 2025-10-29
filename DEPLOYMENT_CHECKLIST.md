# Cookie 用户系统部署检查清单

## 部署前检查

### 1. 环境准备 ☐

- [ ] Node.js >= 18.0.0 已安装
- [ ] pnpm >= 9.0.0 已安装
- [ ] PostgreSQL 数据库已准备
- [ ] 数据库连接字符串已配置在 `.env`
- [ ] `NODE_ENV` 环境变量已设置

### 2. 依赖安装 ☐

```bash
# 在项目根目录执行
pnpm install

# 确认 idb 包已安装
cd apps/web
pnpm list idb
```

- [ ] 所有依赖包安装成功
- [ ] `idb@8.0.0` 已安装
- [ ] 没有依赖冲突警告

### 3. 数据库迁移 ☐

```bash
# 生成 Prisma Client
cd packages/database
npx prisma generate

# 开发环境：创建迁移
npx prisma migrate dev --name add_user_system

# 生产环境：应用迁移
npx prisma migrate deploy

# 验证迁移
npx prisma db push --preview-feature
```

- [ ] Prisma 迁移文件已生成
- [ ] User 表已创建
- [ ] Character 表添加了 userId 字段
- [ ] AIModelConfig 表添加了 userId 字段
- [ ] 所有外键约束已建立
- [ ] 索引已创建

### 4. 数据迁移 ☐

```bash
# 返回项目根目录
cd ../..

# 执行数据迁移脚本
pnpm run db:migrate-user-system
```

- [ ] 迁移脚本执行成功
- [ ] 默认用户已创建
- [ ] 现有角色已关联到用户
- [ ] 现有 AI 配置已关联到用户
- [ ] 迁移统计信息正确

### 5. 代码检查 ☐

#### 类型检查
```bash
pnpm run type-check
```
- [ ] 无 TypeScript 错误

#### Lint 检查
```bash
pnpm run lint
```
- [ ] 无 ESLint 错误或警告

#### 构建测试
```bash
pnpm run build
```
- [ ] 构建成功
- [ ] 无构建错误或警告

### 6. 功能测试 ☐

#### 用户创建和识别
- [ ] 首次访问自动创建用户
- [ ] Cookie 正确设置（有效期 1 年）
- [ ] 刷新页面后用户信息保持
- [ ] 清除 Cookie 后创建新用户

#### 用户信息管理
- [ ] 可以访问设置页面的"用户信息" Tab
- [ ] 可以修改用户名
- [ ] 用户名唯一性验证正常
- [ ] 用户 ID 正确脱敏显示

#### 邮箱绑定
- [ ] 可以绑定邮箱
- [ ] 邮箱格式验证正常
- [ ] 邮箱唯一性验证正常
- [ ] 绑定后可以修改邮箱

#### 账号找回
- [ ] 可以通过邮箱找回账号
- [ ] 找回后 Cookie 更新
- [ ] 页面自动刷新并切换用户

#### 数据隔离
- [ ] 不同用户看到不同的角色列表
- [ ] 不同用户看到不同的 AI 配置
- [ ] 用户 A 无法访问用户 B 的数据

#### 角色管理
- [ ] 创建角色自动关联到当前用户
- [ ] 只能看到自己的角色
- [ ] 角色名称唯一性按用户范围验证

#### AI 模型配置
- [ ] 创建 AI 配置自动关联到当前用户
- [ ] 只能看到自己的 AI 配置
- [ ] 设置活跃模型只影响当前用户

#### IndexedDB 存储
- [ ] IndexedDB 数据库成功创建
- [ ] 聊天记录可以保存到 IndexedDB
- [ ] 可以从 IndexedDB 读取聊天记录
- [ ] 可以导出聊天数据
- [ ] 可以导入聊天数据
- [ ] 数据统计功能正常

### 7. 安全检查 ☐

#### Cookie 安全
- [ ] 生产环境 Cookie 设置了 Secure 属性
- [ ] Cookie 设置了 HttpOnly 属性
- [ ] SameSite 设置为 Lax
- [ ] Cookie 有效期设置正确（1 年）

#### API 安全
- [ ] 所有 API 都验证用户身份
- [ ] 无法通过修改请求访问他人数据
- [ ] API Key 等敏感信息不会泄露到前端

#### 数据安全
- [ ] 用户密码（如有）已加密存储
- [ ] API Key 考虑加密存储
- [ ] 用户 ID 在前端适当脱敏

### 8. 性能检查 ☐

#### 数据库性能
- [ ] 所有查询都使用了索引
- [ ] userId 字段已建立索引
- [ ] 查询响应时间合理（< 100ms）

#### IndexedDB 性能
- [ ] IndexedDB 查询使用了索引
- [ ] 大量数据时查询性能可接受
- [ ] 考虑实现分页或虚拟滚动

#### 前端性能
- [ ] 页面加载时间合理
- [ ] 用户信息加载不阻塞页面渲染
- [ ] 没有明显的性能瓶颈

### 9. 浏览器兼容性 ☐

- [ ] Chrome/Edge 最新版本
- [ ] Firefox 最新版本
- [ ] Safari 最新版本
- [ ] 移动端浏览器

### 10. 错误处理 ☐

#### 后端错误处理
- [ ] 数据库连接失败有适当提示
- [ ] API 错误返回有意义的错误信息
- [ ] 错误日志记录完整

#### 前端错误处理
- [ ] 网络错误有用户友好提示
- [ ] Loading 状态显示正常
- [ ] 错误不会导致应用崩溃

## 部署步骤

### 生产环境部署

1. **环境变量配置**
```bash
# .env.production
DATABASE_URL="postgresql://user:password@host:5432/database"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

2. **构建应用**
```bash
pnpm run build
```

3. **应用数据库迁移**
```bash
cd packages/database
npx prisma migrate deploy
cd ../..
pnpm run db:migrate-user-system
```

4. **启动应用**
```bash
pnpm run start
```

5. **使用 PM2（推荐）**
```bash
pm2 start ecosystem.production.config.js
pm2 save
pm2 startup
```

### 使用 Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 部署后验证

### 1. 健康检查 ☐

```bash
# 检查应用是否运行
curl https://your-domain.com/api/health

# 检查用户 API
curl https://your-domain.com/api/users/current
```

- [ ] 应用正常运行
- [ ] API 正常响应
- [ ] 数据库连接正常

### 2. 功能验证 ☐

- [ ] 在生产环境访问应用
- [ ] 首次访问自动创建用户
- [ ] Cookie 正常设置
- [ ] 所有功能正常工作

### 3. 监控设置 ☐

- [ ] 错误日志监控
- [ ] 性能监控
- [ ] 用户活跃度监控
- [ ] 数据库性能监控

## 回滚计划

如果部署出现问题，按以下步骤回滚：

1. **停止应用**
```bash
pm2 stop all
# 或
docker-compose down
```

2. **恢复数据库**
```bash
# 恢复最近的备份
psql -U user -d database < backup.sql
```

3. **回滚代码**
```bash
git checkout <previous-commit>
pnpm install
pnpm run build
```

4. **重启应用**
```bash
pm2 restart all
# 或
docker-compose up -d
```

## 备份建议

### 数据库备份
```bash
# 手动备份
pg_dump -U user database > backup_$(date +%Y%m%d_%H%M%S).sql

# 设置自动备份（crontab）
0 2 * * * /path/to/scripts/backup-db.sh
```

### 用户数据备份
- 提醒用户定期导出 IndexedDB 数据
- 考虑实现自动云端备份功能

## 支持和维护

### 常见问题

1. **用户报告数据丢失**
   - 检查 IndexedDB 是否被清除
   - 查看浏览器控制台错误
   - 检查是否更换了浏览器/设备

2. **Cookie 无法设置**
   - 检查 HTTPS 配置
   - 验证 Secure 和 SameSite 设置
   - 检查浏览器 Cookie 策略

3. **数据库连接失败**
   - 检查 DATABASE_URL 配置
   - 验证数据库服务运行状态
   - 检查网络连接

### 日志位置

- 应用日志：`logs/sillytavern-out.log`
- 错误日志：`logs/sillytavern-error.log`
- PM2 日志：`~/.pm2/logs/`

## 完成确认

部署完成后，请确认以下内容：

- [ ] 所有检查项均已通过
- [ ] 生产环境功能正常
- [ ] 监控和日志已配置
- [ ] 备份策略已实施
- [ ] 团队成员已了解新系统
- [ ] 用户文档已更新

---

**部署负责人**：_______________

**部署日期**：_______________

**审核人**：_______________

**备注**：_______________

