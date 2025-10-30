# Tests

测试套件用于验证项目功能的正确性。

## 测试结构

```
tests/
├── unit/               # 单元测试
│   └── model-presets.test.ts
├── integration/        # 集成测试（待添加）
└── e2e/               # 端到端测试（待添加）
```

## 运行测试

### 安装测试依赖

```bash
pnpm add -D vitest @vitest/ui
```

### 运行单元测试

```bash
# 运行所有测试
pnpm test

# 运行单个测试文件
pnpm test unit/model-presets.test.ts

# 监听模式
pnpm test:watch

# UI 模式
pnpm test:ui
```

## 编写测试

### 单元测试

单元测试位于 `tests/unit/` 目录，用于测试独立的函数和模块。

示例：
```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@sillytavern-clone/shared'

describe('MyFunction', () => {
  it('should work correctly', () => {
    expect(myFunction()).toBe(expectedValue)
  })
})
```

### 集成测试

集成测试位于 `tests/integration/` 目录，用于测试多个模块的协作。

### E2E 测试

端到端测试位于 `tests/e2e/` 目录，使用 Playwright 测试完整的用户流程。

```bash
# 运行 E2E 测试
pnpm test:e2e

# 调试模式
pnpm test:e2e:debug
```

## 测试覆盖率

```bash
# 生成覆盖率报告
pnpm test:coverage
```

## 当前测试内容

### ✅ 已完成

- **Model Presets 单元测试** - 验证模型预设配置的正确性
  - `getModelPresetsForProvider()` - 获取特定提供商的预设
  - `getRecommendedModels()` - 获取推荐模型
  - `findModelPreset()` - 查找特定模型预设
  - 数据结构验证
  - 能力标记验证（Vision, Tools, Reasoning）

### 🚧 待添加

- API 路由测试
- 组件测试 (React Testing Library)
- Store 测试 (Zustand)
- E2E 测试 (Playwright)

## 注意事项

- 测试文件应该以 `.test.ts` 或 `.test.tsx` 结尾
- 测试应该独立运行，不依赖执行顺序
- 使用 describe/it 组织测试用例
- 保持测试简单、可读、可维护

