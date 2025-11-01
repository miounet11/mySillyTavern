# 📋 管理系统部署检查清单

## ✅ 部署前检查（必需）

### 1. 环境变量配置

- [ ] 已创建或更新 `.env` 文件
- [ ] 设置了 `ADMIN_PASSWORD`（不是默认的admin123）
- [ ] 设置了 `SESSION_SECRET`（随机生成的32字符）
- [ ] 数据库连接 `DATABASE_URL` 正确

### 2. 数据库迁移

- [ ] 执行了数据库迁移SQL
  ```bash
  cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database
  npx prisma db push
  ```
- [ ] 确认 Character 表有 `category` 和 `sortOrder` 字段
- [ ] 确认 CharacterCategory 表已创建
- [ ] 确认有8个预设分类数据

### 3. 应用构建

- [ ] 运行了 `pnpm build`
- [ ] 构建成功无错误
- [ ] 重启了服务 `pm2 restart sillytavern`
- [ ] 服务状态正常 `pm2 list`

## ✅ 部署后测试（推荐）

### 1. 登录测试

- [ ] 访问 `/admin/characters/login`
- [ ] 页面正常显示
- [ ] 输入正确密码可以登录
- [ ] 输入错误密码显示错误提示
- [ ] 登录后跳转到管理页面

### 2. LLM配置测试

- [ ] 进入"设置"Tab
- [ ] 可以添加新的LLM配置
- [ ] 填写表单正常
- [ ] 保存成功后配置出现在列表中
- [ ] 可以删除配置

### 3. 角色生成测试

- [ ] 进入"LLM生成"Tab
- [ ] 输入描述后可以点击生成
- [ ] 生成过程显示加载状态
- [ ] 生成成功后显示预览
- [ ] 预览内容完整（名称、描述、个性等）
- [ ] 可以发布到社区
- [ ] 可以重新生成

### 4. 角色管理测试

- [ ] 进入"角色管理"Tab
- [ ] 可以看到角色列表
- [ ] 搜索功能正常
- [ ] 类型筛选正常
- [ ] 可以发布用户角色到社区
- [ ] 可以从社区移除角色
- [ ] 可以删除角色

### 5. 社区展示测试

- [ ] 访问 `/characters/community`
- [ ] 可以看到刚才发布的角色
- [ ] 角色信息显示正确
- [ ] 可以下载角色（现有功能）

## 🔍 故障排查检查表

### 如果无法访问登录页

- [ ] 检查路由：`/admin/characters/login`
- [ ] 检查服务是否运行：`pm2 list`
- [ ] 检查日志：`pm2 logs sillytavern`
- [ ] 检查构建是否成功

### 如果登录失败

- [ ] 检查 `.env` 中的 `ADMIN_PASSWORD`
- [ ] 检查 `SESSION_SECRET` 是否设置
- [ ] 清除浏览器Cookie
- [ ] 检查浏览器控制台错误

### 如果生成失败

- [ ] 检查LLM配置是否存在
- [ ] 检查API Key是否有效
- [ ] 检查API配额是否用完
- [ ] 检查网络连接
- [ ] 查看浏览器控制台详细错误
- [ ] 查看服务器日志

### 如果无法发布到社区

- [ ] 检查角色名称是否重复
- [ ] 检查数据库中的 CommunityCharacter 表
- [ ] 检查日志中的错误信息

## 📝 创建的文件列表

### API文件（10个）
- [x] `/app/api/admin/auth/login/route.ts`
- [x] `/app/api/admin/auth/check/route.ts`
- [x] `/app/api/admin/auth/logout/route.ts`
- [x] `/app/api/admin/config/llm/route.ts`
- [x] `/app/api/admin/config/categories/route.ts`
- [x] `/app/api/admin/characters/route.ts`
- [x] `/app/api/admin/characters/generate/route.ts`
- [x] `/app/api/admin/characters/publish/route.ts`

### 页面文件（2个）
- [x] `/app/admin/characters/page.tsx`
- [x] `/app/admin/characters/login/page.tsx`

### 组件文件（3个）
- [x] `/components/admin/CharacterGenerateForm.tsx`
- [x] `/components/admin/LLMConfigPanel.tsx`
- [x] `/components/admin/CharacterManageTable.tsx`

### 数据库文件（2个）
- [x] `/packages/database/prisma/schema.prisma` (更新)
- [x] `/packages/database/prisma/migrations/20251101_add_category_and_sort/migration.sql`

### 文档文件（4个）
- [x] `ADMIN_CHARACTER_SYSTEM.md` (完整指南)
- [x] `ADMIN_QUICK_START.md` (快速启动)
- [x] `IMPLEMENTATION_SUMMARY_ADMIN_SYSTEM.md` (实施总结)
- [x] `DEPLOYMENT_CHECKLIST_ADMIN.md` (本文档)

**总计：21个文件**

## 🎯 功能验证矩阵

| 功能 | 测试内容 | 状态 |
|------|----------|------|
| 登录认证 | 密码验证、Session管理 | ⬜ |
| LLM配置 | CRUD操作、参数设置 | ⬜ |
| 分类系统 | 分类列表、选择 | ⬜ |
| 角色生成 | 描述输入、LLM调用、预览 | ⬜ |
| 社区发布 | 发布、取消发布 | ⬜ |
| 角色管理 | 列表、搜索、删除 | ⬜ |
| UI响应 | 移动端、桌面端 | ⬜ |

**提示**: 在上表中打勾 [✓] 表示已测试通过

## 🚀 上线准备

### 安全检查

- [ ] 修改了默认管理员密码
- [ ] SESSION_SECRET 使用随机生成的值
- [ ] API Key 不在代码中硬编码
- [ ] `.env` 文件未提交到Git
- [ ] Cookie 使用 httpOnly
- [ ] 生产环境使用 secure cookies

### 性能检查

- [ ] 数据库索引已创建
- [ ] LLM调用有超时设置
- [ ] 图片优化（如果有）
- [ ] 构建产物已优化

### 文档检查

- [ ] 团队成员知道管理员密码
- [ ] 文档已分享给相关人员
- [ ] 备份了环境变量配置

## 📞 支持联系

如果所有检查都通过，但仍有问题：

1. **查看日志**
   ```bash
   pm2 logs sillytavern --lines 100
   ```

2. **检查数据库**
   ```bash
   cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database
   npx prisma studio
   ```

3. **重新构建**
   ```bash
   cd /www/wwwroot/jiuguanmama/mySillyTavern
   pnpm build
   pm2 restart sillytavern
   ```

## ✨ 快速命令参考

### 启动相关
```bash
# 查看服务状态
pm2 list

# 重启服务
pm2 restart sillytavern

# 查看日志
pm2 logs sillytavern

# 查看错误日志
pm2 logs sillytavern --err
```

### 数据库相关
```bash
# 进入数据库目录
cd /www/wwwroot/jiuguanmama/mySillyTavern/packages/database

# 应用迁移
npx prisma db push

# 打开数据库管理界面
npx prisma studio

# 查看数据库状态
npx prisma db pull
```

### 构建相关
```bash
# 进入项目根目录
cd /www/wwwroot/jiuguanmama/mySillyTavern

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 查看构建输出
ls -la apps/web/.next
```

## 🎉 部署成功标志

当以下所有项都完成时，部署成功：

- ✅ 可以正常登录管理界面
- ✅ LLM配置可以保存和使用
- ✅ 角色生成功能正常
- ✅ 生成的角色可以发布到社区
- ✅ 在社区页面可以看到发布的角色
- ✅ 角色管理功能正常

---

**部署完成后**，访问 `/admin/characters` 开始使用！

更多帮助请查看：
- [快速启动指南](./ADMIN_QUICK_START.md)
- [完整使用指南](./ADMIN_CHARACTER_SYSTEM.md)

