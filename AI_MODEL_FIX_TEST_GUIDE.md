# AI模型配置功能修复 - 测试指南

## 修复内容总结

### ✅ 已完成的修复

1. **精简提供商列表** - 只保留7个主流提供商
   - 国外4个：OpenAI、Anthropic、Google、Azure
   - 国内2个：DeepSeek、智谱AI
   - 自定义1个：自定义OpenAI格式

2. **优化API地址自动填充**
   - 选择提供商后自动填充默认API地址
   - Azure和自定义需要手动填写（带*号标记）
   - 其他提供商显示默认地址提示

3. **修复"获取模型列表"功能**
   - 所有提供商都显示"Get Model List"按钮
   - 点击后从API获取模型列表
   - 成功后自动切换到选择模式并清空当前选择
   - 添加调试日志追踪数据流

4. **修复编辑模式回显**
   - 智能判断使用input/select模式
   - 如果模型在预设列表中，使用select模式
   - 如果模型不在预设列表，使用input模式直接显示

5. **增强localStorage持久化**
   - 添加详细的调试日志
   - 验证状态更新和持久化
   - 支持服务器API和本地存储双模式

## 测试步骤

### 测试1：创建新模型（使用预设提供商）

**步骤：**
1. 打开设置 → AI模型
2. 点击"添加模型"或"编辑模型"
3. 选择提供商：**OpenAI**
4. 验证API地址自动填充为：`https://api.openai.com/v1`
5. 输入API Key（测试用密钥）
6. 点击"Get Model List"按钮
7. **验证**：
   - 按钮显示"获取模型列表..."加载状态
   - 成功后显示toast提示："成功获取 X 个模型"
   - 模型下拉框自动切换为选择模式
   - 下拉框显示"从 API 获取 (X 个模型)"标题
   - 可以从列表中选择模型
8. 选择一个模型（如 gpt-4o）
9. 填写显示名称（可选）
10. 勾选"设为活跃模型"
11. 点击"创建配置"
12. **验证**：
    - 显示成功提示
    - 模型列表中出现新模型
    - 控制台输出创建日志

### 测试2：创建新模型（使用自定义）

**步骤：**
1. 点击"添加模型"
2. 选择提供商：**自定义 OpenAI 格式**
3. **验证**：
   - API地址字段带*号标记（必填）
   - 提示文本："请输入自定义的OpenAI兼容API地址"
4. 输入自定义API地址（如：`https://ttkk.inping.com/v1`）
5. 输入API Key
6. 点击"Get Model List"
7. 选择或手动输入模型名称
8. 点击"创建配置"
9. **验证**保存成功

### 测试3：编辑已有模型（预设模型）

**步骤：**
1. 点击已有的模型（使用预设模型名，如gpt-4o）
2. **验证编辑模式**：
   - 提供商正确回显
   - API地址正确回显
   - 模型名称正确显示在下拉框中（select模式）
   - 其他字段正确回显
3. 修改配置（如修改显示名称）
4. 点击保存
5. **验证**更新成功

### 测试4：编辑已有模型（自定义模型名）

**步骤：**
1. 点击使用自定义模型名的模型（如grok-4-mini-thinking-tahoe）
2. **验证编辑模式**：
   - 自动切换为input模式（因为不在预设列表）
   - 模型名称在输入框中正确显示
   - 控制台输出："编辑模式 - 模型: XXX 是否在预设列表: false"
3. 修改配置
4. 点击保存
5. **验证**更新成功

### 测试5：刷新页面验证持久化

**步骤：**
1. 创建或编辑一个模型并保存
2. 打开浏览器开发者工具 → Console
3. **查看控制台日志**：
   ```
   [AIModelStore] 开始创建模型: {...}
   [AIModelStore] 本地创建模型: {...}
   [AIModelStore] 本地创建后模型总数: X
   [AIModelStore] Rehydrating from localStorage... {models: X, activeModel: {...}}
   [AIModelStore] Hydration complete ✓
   ```
4. 刷新页面（F5）
5. **验证**：
   - 模型列表仍然存在
   - 活跃模型状态保持
   - 控制台显示"Rehydrating from localStorage..."和"Hydration complete ✓"
6. 打开开发者工具 → Application → Local Storage
7. 查看`ai-models-storage`键
8. **验证**：JSON数据包含所有模型配置

### 测试6：提供商特定功能

#### 6.1 Azure OpenAI
1. 选择Azure OpenAI
2. **验证**：
   - API地址带*号（必填）
   - 提示："请输入您的Azure资源地址"
3. 不填写API地址，点击保存
4. **验证**：显示错误提示"Azure OpenAI 需要提供资源地址"

#### 6.2 DeepSeek
1. 选择DeepSeek
2. **验证**：
   - API地址自动填充：`https://api.deepseek.com/v1`
   - 提示："默认：https://api.deepseek.com/v1"
3. 预设模型包含：deepseek-chat、deepseek-reasoner、deepseek-coder

#### 6.3 智谱AI
1. 选择智谱AI
2. **验证**：
   - API地址自动填充：`https://open.bigmodel.cn/api/paas/v4`
   - 预设模型包含：glm-4-plus、glm-4-0520、glm-4等

### 测试7：手动输入模式切换

**步骤：**
1. 在模型名称字段，点击"手动输入"按钮
2. **验证**：切换为输入框，可以手动输入
3. 点击"选择模型"按钮
4. **验证**：切换回下拉框选择模式

## 预期控制台日志

### 创建模型
```
[AIModelStore] 开始创建模型: {name: "xxx", provider: "openai", ...}
[AIModelStore] 服务器创建失败，使用本地存储
[AIModelStore] 本地创建模型: {id: "local-xxx", ...}
[AIModelStore] 本地创建后模型总数: 1
[AIModelStore] 活跃模型: "xxx"
```

### 获取模型列表
```
[AIModelDrawer] 获取到的模型列表: 50 个模型
[AIModelDrawer] 模型: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", ...] ...
```

### 编辑模型
```
[AIModelDrawer] 编辑模式 - 模型: gpt-4o 是否在预设列表: true
[AIModelDrawer] 选择模型: gpt-4o
[AIModelStore] 开始更新模型: local-xxx {...}
[AIModelStore] 本地更新模型: {...}
[AIModelStore] 本地更新后模型总数: 1
```

### 页面加载
```
[AIModelStore] Rehydrating from localStorage... {models: 1, activeModel: {...}}
[AIModelStore] Hydration complete ✓
```

## 常见问题排查

### Q1: 点击"Get Model List"没反应
**检查：**
- API地址是否正确填写
- API Key是否填写
- 控制台是否有错误日志
- 网络请求是否成功（Network标签）

### Q2: 获取的模型列表没有显示在下拉框
**检查：**
- 控制台日志是否显示"获取到的模型列表: X 个模型"
- availableModels状态是否更新
- 是否自动切换到select模式

### Q3: 保存后刷新页面数据丢失
**检查：**
- 控制台是否显示创建/更新日志
- localStorage中是否有`ai-models-storage`键
- Hydration日志是否正常
- 检查persist中间件配置

### Q4: 编辑时模型名称显示为空
**检查：**
- 控制台日志："编辑模式 - 模型: XXX 是否在预设列表: true/false"
- 是否正确判断input/select模式
- presetModels是否包含该模型

## 修复的文件清单

1. `/apps/web/src/components/ai/AIModelDrawer.tsx`
   - 精简提供商列表
   - 更新预设模型
   - 修复获取模型列表逻辑
   - 修复编辑回显逻辑
   - 优化API地址提示

2. `/apps/web/src/stores/aiModelStore.ts`
   - 添加详细调试日志
   - 验证持久化逻辑
   - 确保状态正确更新

## 下一步建议

1. ✅ 核心功能已修复
2. 🔄 建议进行完整的用户测试
3. 📊 收集用户反馈
4. 🎨 可选：进一步优化UI/UX
5. 🚀 可选：添加更多提供商支持

---

**修复完成时间**: 2025-10-29
**修复状态**: ✅ 已完成

