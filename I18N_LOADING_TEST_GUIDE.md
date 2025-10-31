# i18n 翻译加载修复 - 测试指南

## 快速测试（2分钟）

### 1. 清除缓存测试

```bash
# 方法 A: 使用浏览器隐私/无痕模式
# Chrome: Ctrl+Shift+N (Windows) / Cmd+Shift+N (Mac)
# Firefox: Ctrl+Shift+P (Windows) / Cmd+Shift+P (Mac)

# 方法 B: 清除浏览器缓存
# Chrome: F12 -> Network -> 勾选 "Disable cache"
```

**操作步骤：**
1. 打开无痕窗口
2. 访问应用 URL
3. 观察页面加载过程

**预期结果：**
- ✅ 看到简洁的加载指示器（旋转图标 + "加载中..."）
- ✅ 加载完成后，所有文本直接显示为中文
- ❌ **不应该**看到任何翻译键（如 `chat.settingsPanel.title`）
- ❌ **不应该**有文本从英文闪烁变为中文的现象

### 2. 设置面板测试

**操作步骤：**
1. 进入任意聊天界面
2. 点击左侧侧边栏按钮
3. 观察设置面板内容

**预期结果：**
设置面板应显示：
- ✅ "对话设置" 而不是 `chat.settingsPanel.title`
- ✅ "返回角色列表" 而不是 `chat.settingsPanel.backToCharacters`
- ✅ "剧情分支管理" 而不是 `chat.settingsPanel.branches.title`
- ✅ 所有其他按钮和文本都应该是中文

### 3. 页面导航测试

**操作步骤：**
1. 访问首页
2. 依次访问：角色管理 -> 聊天 -> 设置
3. 观察每个页面的文本显示

**预期结果：**
- ✅ 所有页面标题和按钮文本都应该是中文
- ✅ 页面切换流畅，无文本闪烁
- ✅ 没有翻译键显示

## 深度测试（5分钟）

### 4. 慢网络测试

**操作步骤：**
1. 打开浏览器开发工具 (F12)
2. 切换到 Network 标签
3. 将网络限速设置为 "Slow 3G"
4. 刷新页面

**预期结果：**
- ✅ 加载指示器显示时间较长（3-5秒）
- ✅ 加载完成后，所有文本正确显示为中文
- ✅ 在 Network 标签中应该看到 `/locales/zh-CN/common.json` 请求成功

### 5. 语言切换测试

**操作步骤：**
1. 打开设置页面
2. 找到语言设置
3. 切换语言：中文 -> 英文 -> 日文 -> 中文

**预期结果：**
- ✅ 语言切换立即生效
- ✅ 所有文本正确切换到目标语言
- ✅ 刷新页面后，语言偏好被保持
- ✅ 没有翻译键显示

### 6. 控制台检查

**操作步骤：**
1. 打开浏览器控制台 (F12 -> Console)
2. 刷新页面
3. 检查控制台输出

**预期结果：**
- ✅ 没有翻译加载错误
- ❌ **不应该**看到 `Failed to load translations` 错误
- ✅ 应该看到 `/locales/zh-CN/common.json` 成功加载（200 状态码）

## 高级测试（10分钟）

### 7. 多组件并发测试

**操作步骤：**
1. 同时打开多个使用 i18n 的组件：
   - 聊天设置面板
   - 世界书面板
   - 分支管理面板
   - 正则脚本编辑器
2. 观察所有面板的文本显示

**预期结果：**
- ✅ 所有组件的文本都正确显示为中文
- ✅ 没有组件显示翻译键
- ✅ 组件加载顺序不影响翻译显示

### 8. 性能测试

**操作步骤：**
1. 打开 Network 标签
2. 刷新页面多次（5-10次）
3. 观察翻译文件的加载情况

**预期结果：**
- ✅ 翻译文件只在首次加载时请求
- ✅ 后续刷新使用浏览器缓存（304 状态或从缓存加载）
- ✅ 页面加载时间没有明显增加

### 9. 边缘情况测试

**A. 翻译文件404测试（模拟）**
```bash
# 临时重命名翻译文件进行测试
# 不要在生产环境执行！
```

**操作步骤：**
1. 在开发环境中，临时移除翻译文件
2. 刷新页面
3. 观察应用行为

**预期结果：**
- ✅ 控制台显示错误：`Failed to load translations for locale: zh-CN`
- ✅ 应用不崩溃，降级显示翻译键
- ✅ 加载指示器最终消失

**B. 切换到未加载的语言**

**操作步骤：**
1. 切换到日文（ja）
2. 观察加载过程

**预期结果：**
- ✅ 自动加载日文翻译文件
- ✅ 加载完成后正确显示日文文本
- ✅ 没有翻译键闪烁

## 自动化测试（可选）

### 使用 Playwright 进行自动化测试

```typescript
import { test, expect } from '@playwright/test'

test('i18n loads before content renders', async ({ page }) => {
  // 访问应用
  await page.goto('/')
  
  // 等待加载指示器消失
  await page.waitForSelector('[data-testid="loading-indicator"]', { 
    state: 'hidden',
    timeout: 10000 
  })
  
  // 检查是否有翻译键显示
  const translationKeys = await page.locator('[text*="chat."]').count()
  expect(translationKeys).toBe(0)
  
  // 检查中文文本是否存在
  const chineseText = await page.locator('text=/[\u4e00-\u9fa5]+/').count()
  expect(chineseText).toBeGreaterThan(0)
})

test('settings panel shows translated text', async ({ page }) => {
  await page.goto('/chat/test-character')
  
  // 打开设置面板
  await page.click('[data-testid="settings-panel-toggle"]')
  
  // 检查设置面板标题
  await expect(page.locator('text=对话设置')).toBeVisible()
  await expect(page.locator('text=chat.settingsPanel.title')).not.toBeVisible()
})
```

## 问题排查

### 问题 1: 仍然看到翻译键

**可能原因：**
- 浏览器缓存了旧的 JavaScript 文件
- 翻译文件路径不正确
- 翻译键在 JSON 文件中不存在

**解决方法：**
1. 强制刷新页面 (Ctrl+Shift+R / Cmd+Shift+R)
2. 清除浏览器缓存
3. 检查控制台错误信息
4. 验证 `/locales/zh-CN/common.json` 文件存在且可访问

### 问题 2: 加载指示器一直显示

**可能原因：**
- 翻译文件加载失败
- 网络请求被阻止
- CORS 问题

**解决方法：**
1. 打开 Network 标签，查看翻译文件请求状态
2. 检查控制台错误
3. 验证服务器配置允许访问 `/locales/` 路径

### 问题 3: 切换语言后翻译键出现

**可能原因：**
- 目标语言的翻译文件缺失
- 翻译键不完整

**解决方法：**
1. 检查 `/public/locales/{locale}/common.json` 文件是否存在
2. 对比不同语言文件的键值完整性
3. 添加缺失的翻译

## 性能指标

### 预期性能表现

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 首次内容渲染 (FCP) | < 1.5s | 包括加载指示器 |
| 翻译加载时间 | < 200ms | 正常网络条件 |
| 语言切换时间 | < 100ms | 已缓存的语言 |
| 内存占用 | < 500KB | 所有翻译文件 |

### 测量方法

```javascript
// 在浏览器控制台执行
performance.mark('i18n-start')
await i18n.waitForInitialization()
performance.mark('i18n-end')
performance.measure('i18n-load', 'i18n-start', 'i18n-end')
console.table(performance.getEntriesByType('measure'))
```

## 测试通过标准

全部测试通过需满足：

- ✅ 清除缓存测试通过（无翻译键显示）
- ✅ 设置面板测试通过（所有文本为中文）
- ✅ 页面导航测试通过（无闪烁）
- ✅ 慢网络测试通过（加载指示器正常）
- ✅ 语言切换测试通过（立即生效）
- ✅ 控制台检查通过（无错误）
- ✅ 多组件并发测试通过（所有组件正确显示）
- ✅ 性能测试通过（缓存生效）

## 报告问题

如果发现问题，请提供以下信息：

1. 浏览器类型和版本
2. 操作系统
3. 失败的测试用例
4. 控制台错误信息（如有）
5. Network 标签截图
6. 问题复现步骤

---

**测试完成日期：** _________

**测试人员：** _________

**测试结果：** ⬜ 通过 / ⬜ 失败

**备注：** _________

