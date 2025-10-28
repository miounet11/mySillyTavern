# AI 模型 localStorage 持久化修复报告

## 🎯 问题描述

用户配置了 AI 模型后，从角色页面点击角色卡进入对话时，系统始终提示"请先配置 AI 模型"。

## 🔍 根本原因

1. **Zustand persist 配置错误**：使用了错误的属性名 `partializeState` 而非正确的 `partialize`
2. **localStorage 持久化失败**：导致 AI 模型配置无法保存到浏览器本地存储
3. **编辑模型时数据丢失**：编辑已有模型时，API 密钥和设置被清空

## ✅ 修复内容

### 1. 修复 localStorage 持久化（`aiModelStore.ts`）

**修复前：**
```typescript
partializeState: (state) => ({  // ❌ 错误的属性名
  models: state.models,
  activeModel: state.activeModel,
}),
```

**修复后：**
```typescript
partialize: (state) => ({  // ✅ 正确的属性名
  models: state.models,
  activeModel: state.activeModel,
}),
```

### 2. 改为本地优先策略（`aiModelStore.ts`）

- ✅ **createModel**：优先保存到 localStorage，可选同步到服务器
- ✅ **updateModel**：优先更新 localStorage，可选同步到服务器
- ✅ **deleteModel**：优先删除 localStorage，可选同步到服务器
- ✅ **fetchModels**：从 localStorage 加载，可选合并服务器数据

### 3. 修复编辑模型预填充（`AIModelModal.tsx` & `AIModelDrawer.tsx`）

**修复前：**
```typescript
apiKey: '', // ❌ 编辑时清空 API 密钥
```

**修复后：**
```typescript
apiKey: editingModel.apiKey || '', // ✅ 保留已有的 API 密钥
```

### 4. 优化验证逻辑

**修复后：**
```typescript
// 创建新模型时：API 密钥必填（本地模型除外）
// 编辑模型时：API 密钥可选（不修改则保留原有值）
if (!editingModel && !formData.apiKey.trim() && formData.provider !== 'local') {
  toast.error('API密钥是必填项')
  return
}
```

### 5. 简化对话页面模型检查（`ChatInterface.tsx`）

**修复后：**
```typescript
// 直接从 localStorage 读取活跃模型
if (!hasActiveModel || !activeModel) {
  toast.error('请先配置 AI 模型')
  window.dispatchEvent(new CustomEvent('open-settings'))
  return
}
```

## 📋 修改文件列表

1. `apps/web/src/stores/aiModelStore.ts` - AI 模型状态管理
2. `apps/web/src/components/ai/AIModelModal.tsx` - AI 模型配置弹窗
3. `apps/web/src/components/ai/AIModelDrawer.tsx` - AI 模型配置抽屉
4. `apps/web/src/components/chat/ChatInterface.tsx` - 对话界面

## 🚀 部署步骤

1. ✅ 停止应用：`pm2 stop sillytavern-web`
2. ✅ 清理缓存：`rm -rf apps/web/.next`
3. ✅ 重新构建：`npm run build`
4. ✅ 启动应用：`pm2 start sillytavern-web`

## 📝 使用说明

### 首次配置

1. 访问 `https://www.isillytavern.com/chat`
2. 点击右上角设置图标 ⚙️
3. 点击"添加 AI 模型"
4. 填写配置信息：
   - 提供商：选择 `OpenAI` 或其他
   - API 地址：填写 API 端点
   - API 密钥：填写您的密钥
   - 模型：填写模型名称（如 `grok-3`）
   - **勾选"设为活跃模型"**
5. 点击保存

### 验证配置

打开浏览器控制台（F12），执行：
```javascript
JSON.parse(localStorage.getItem('ai-models-storage'))
```

应该能看到已保存的模型配置。

### 编辑模型

1. 点击模型列表中的"编辑"按钮
2. 所有已保存的信息会自动填充
3. 修改需要更改的字段
4. API 密钥可选（不修改则保留原值）
5. 点击保存

## 🎉 修复效果

- ✅ AI 模型配置永久保存在浏览器 localStorage
- ✅ 刷新页面后配置自动恢复
- ✅ 编辑模型时所有信息预填充
- ✅ API 密钥安全存储在本地浏览器
- ✅ 点击角色卡可以直接进入对话界面
- ✅ 无需每次重新配置

## 📅 修复日期

2025-10-27

## 👨‍💻 技术栈

- Next.js 14
- Zustand (状态管理)
- Zustand Persist (localStorage 持久化)
- TypeScript

