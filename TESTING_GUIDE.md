# 功能测试指南

## 🎯 测试 SillyTavern 兼容功能

### 1. 角色导入测试

#### 测试 JSON 格式导入

1. **访问角色列表页面**
   - 打开 https://www.isillytavern.com/characters
   - 点击 **"Import Character"** 按钮

2. **导入测试角色**
   - 从 https://sillytavernchat.com 下载角色 JSON 文件
   - 拖放或选择文件上传
   - 验证预览信息显示正确
   - 点击 **"Import Character"** 完成导入

3. **验证导入结果**
   - 检查角色名称、描述、性格
   - 查看角色头像
   - 确认标签正确显示

#### 测试 PNG 格式导入

1. **下载 PNG 格式角色卡**
   - 从 SillyTavern 社区或其他来源获取 PNG 角色卡
   - 确保 PNG 包含嵌入的角色数据

2. **导入 PNG 角色卡**
   - 上传 PNG 文件
   - 系统应自动提取嵌入的角色数据
   - 验证预览信息

3. **检查头像**
   - PNG 图片应该作为角色头像
   - 确认头像清晰显示

### 2. 角色导出测试

#### 导出为 JSON

1. **选择已有角色**
   - 在角色列表中选择一个角色
   - 点击角色卡片右上角的菜单
   - 选择 **"Export as JSON"**

2. **验证导出文件**
   - 下载的文件命名格式: `角色名.json`
   - 用文本编辑器打开验证 JSON 格式
   - 检查必要字段存在

3. **重新导入测试**
   - 将导出的 JSON 重新导入
   - 验证所有字段保持一致

#### 导出为 PNG

1. **导出 PNG 角色卡**
   - 选择角色 → 导出 → **"Export as PNG"**
   - 下载 PNG 文件

2. **验证 PNG 文件**
   - PNG 应包含角色头像
   - 使用文本编辑器/十六进制编辑器检查是否有 tEXt 块

3. **导入测试**
   - 重新导入 PNG 文件
   - 验证数据完整性

### 3. 对话初始化测试

#### 自动问候功能

1. **创建新对话**
   - 选择一个角色
   - 点击 **"Start Chat"** 或 **"New Chat"**

2. **验证自动问候**
   - 对话窗口应该立即显示角色的问候语
   - 问候语应该是角色的 `firstMessage` 字段内容
   - 消息标记为 `assistant` 角色

3. **测试用户开场白模板**
   - 如果启用，输入框应该预填充用户开场白模板
   - 模板应该替换 `{{user}}`, `{{char}}`, `{{scenario}}` 占位符
   - 例如: "你好，极光海域！我是用户。"

#### 设置自定义模板

1. **打开设置**
   - 点击右上角齿轮图标
   - 进入 **"界面"** 标签

2. **配置用户开场白模板**
   ```
   你好，{{char}}！我是{{user}}，很高兴认识你。{{scenario}}
   ```

3. **测试模板**
   - 创建新对话
   - 验证占位符被正确替换

#### 禁用自动问候

1. **关闭自动问候**
   - 设置 → 界面 → **"自动发送角色问候语"** → 关闭

2. **测试效果**
   - 创建新对话
   - 对话应该是空的，不自动发送问候
   - 仅显示用户开场白模板

### 4. 字段完整性测试

#### 验证 V2 字段支持

测试以下字段是否正确导入/导出:

- [x] **基础字段**
  - `name` - 角色名称
  - `description` - 角色描述
  - `personality` - 性格特征
  - `scenario` - 场景设定

- [x] **对话相关**
  - `first_mes` - 第一条消息/问候语
  - `mes_example` - 对话示例
  - `alternate_greetings` - 备用问候语

- [x] **高级字段**
  - `system_prompt` - 系统提示词
  - `post_history_instructions` - 历史后指令
  - `creator_notes` - 创作者备注

- [x] **角色书**
  - `character_book` - 世界信息/角色书
  - 检查 entries, name, description

- [x] **元数据**
  - `creator` - 创作者
  - `character_version` - 版本号
  - `tags` - 标签
  - `extensions` - 扩展字段

### 5. 兼容性测试

#### 从 SillyTavern 导入角色

测试以下来源的角色:

1. **sillytavernchat.com**
   - 下载官方社区角色
   - 导入到 isillytavern.com
   - 验证完整性

2. **本地 SillyTavern**
   - 从本地 SillyTavern 导出角色
   - 导入到 isillytavern.com
   - 创建对话测试

3. **第三方角色网站**
   - Chub.ai
   - character.ai 导出格式
   - 其他格式

### 6. 错误处理测试

#### 测试边界情况

1. **无效文件**
   - 上传空文件 → 应显示错误
   - 上传非 JSON/PNG 文件 → 应拒绝
   - 上传损坏的 JSON → 应显示解析错误

2. **缺失字段**
   - 导入缺少 `name` 字段的角色 → 应使用默认名称
   - 缺少 `description` → 应使用空描述
   - 缺少 `first_mes` → 应有默认问候

3. **重复角色名**
   - 导入已存在的角色名 → 应自动重命名 (例: "角色名 (1)")
   - 验证警告提示

4. **大文件**
   - 上传超大 PNG (>10MB) → 应有提示
   - 超长文本字段 → 应正确处理

## 🧪 API 测试

### 使用 curl 测试 API

#### 1. 健康检查
```bash
curl https://www.isillytavern.com/api/health
```

#### 2. 导入角色 (预览模式)
```bash
curl -X POST https://www.isillytavern.com/api/characters/import \
  -F "file=@character.json" \
  -F "commit=false"
```

#### 3. 导入角色 (提交)
```bash
curl -X POST https://www.isillytavern.com/api/characters/import \
  -F "file=@character.json" \
  -F "commit=true"
```

#### 4. 导出角色 (JSON)
```bash
curl "https://www.isillytavern.com/api/characters/{characterId}/export?format=json" \
  -o exported-character.json
```

#### 5. 导出角色 (PNG)
```bash
curl "https://www.isillytavern.com/api/characters/{characterId}/export?format=png" \
  -o exported-character.png
```

#### 6. 获取角色列表
```bash
curl https://www.isillytavern.com/api/characters
```

## 📊 测试检查清单

### 核心功能
- [ ] JSON 角色导入成功
- [ ] PNG 角色导入成功
- [ ] 预览模式工作正常
- [ ] 角色导出为 JSON
- [ ] 角色导出为 PNG
- [ ] 自动问候语发送
- [ ] 用户开场白模板渲染
- [ ] 占位符正确替换

### 字段验证
- [ ] 所有 v2 字段正确导入
- [ ] 所有 v2 字段正确导出
- [ ] 角色书数据保持完整
- [ ] 备用问候语列表正确
- [ ] 对话示例正确解析

### 用户体验
- [ ] 拖放上传流畅
- [ ] 预览信息清晰
- [ ] 错误提示友好
- [ ] 警告信息明确
- [ ] 加载状态显示

### 设置界面
- [ ] 自动问候开关工作
- [ ] 模板编辑保存成功
- [ ] 占位符说明清楚
- [ ] 设置持久化

### 兼容性
- [ ] SillyTavern 官方角色兼容
- [ ] 第三方角色兼容
- [ ] 旧版本格式兼容
- [ ] 导出格式可被 SillyTavern 识别

### 性能
- [ ] 大文件上传速度可接受
- [ ] 预览生成快速
- [ ] 导出下载速度正常
- [ ] UI 响应流畅

## 🐛 已知问题

### 警告 (不影响功能)
- Next.js config 中的 `CUSTOM_KEY` 和 `appDir` 警告
- Nginx 重复 server_name 警告

### 限制
- PNG 文件大小限制 (根据 Nginx 配置)
- 导入/导出需要浏览器支持 File API

## 📝 反馈收集

测试完成后，请记录:
1. 发现的 bug
2. 用户体验问题
3. 功能改进建议
4. 性能问题

---

**测试环境**: https://www.isillytavern.com
**测试版本**: 1.0.0 (2025-10-27)
**部署状态**: ✅ 生产环境运行中

