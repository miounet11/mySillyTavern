# 角色卡格式兼容性支持

## 概述

本系统现已支持多种角色卡和预设格式的导入和导出，包括：

1. **SillyTavern 预设格式** - 完整的预设配置，包含提示词、模型参数等
2. **QuackAI/Narratium 格式** - promptList、regexList、modelList 结构
3. **标准 CharacterCard V2** - 传统的角色卡格式

## 支持的格式

### 1. SillyTavern 预设格式

这是 SillyTavern 使用的完整预设配置格式，包含：

- **提示词列表** (`prompts`): 包含 injection_position、injection_depth、injection_order 等字段
- **模型参数**: temperature、top_p、top_k、frequency_penalty 等
- **格式化选项**: wi_format、scenario_format 等

示例文件：`【MoM】极光海域 2.4.3 Ver @电波系.json`

**特征字段**:
```json
{
  "prompts": [
    {
      "identifier": "...",
      "injection_position": 0,
      "injection_depth": 4,
      "injection_order": 100
    }
  ],
  "genamt": 350,
  "temperature": 1.3
}
```

### 2. QuackAI/Narratium 格式

这是 QuackAI 和 Narratium 平台使用的角色卡格式，包含：

- **提示词列表** (`promptList`): 角色描述、文风、世界书等
- **正则规则** (`regexList`): 文本处理规则
- **模型列表** (`modelList`): 支持的模型和参数

示例文件：`☆Healer☆1.3.json`

**特征字段**:
```json
{
  "id": "...",
  "name": "角色名称",
  "intro": "角色介绍",
  "promptList": [...],
  "regexList": [...],
  "modelList": [...]
}
```

### 3. 标准 CharacterCard V2

传统的角色卡格式，被广泛使用：

```json
{
  "spec": "chara_card_v2",
  "spec_version": "2.0",
  "data": {
    "name": "角色名称",
    "description": "角色描述",
    "first_mes": "第一条消息",
    "personality": "性格描述",
    "scenario": "场景设定"
  }
}
```

## 使用方法

### 导入角色卡

#### 通过 API 导入

```bash
curl -X POST http://your-domain/api/characters/import \
  -F "file=@path/to/character.json"
```

系统会自动检测格式并进行相应的解析。

#### 通过 Web 界面导入

1. 进入角色管理页面
2. 点击"导入角色"按钮
3. 选择 JSON 文件
4. 系统自动识别格式并导入

### 导出角色卡

#### 导出为预设格式

```bash
# 导出为 SillyTavern 格式
curl http://your-domain/api/characters/{id}/export-preset?format=sillytavern

# 导出为 QuackAI 格式
curl http://your-domain/api/characters/{id}/export-preset?format=quackai
```

**注意**: 只有从预设格式导入的角色才能导出为预设格式。

#### 导出为标准格式

```bash
# 导出为 JSON
curl http://your-domain/api/characters/{id}/export?format=json

# 导出为 PNG（嵌入数据）
curl http://your-domain/api/characters/{id}/export?format=png
```

## 格式转换流程

### 导入流程

```
原始文件 (JSON)
    ↓
格式检测 (detectPresetFormat)
    ↓
┌─────────────┬──────────────┬────────────────┐
│ SillyTavern │   QuackAI    │ CharacterCard │
│   Format    │    Format    │      V2       │
└─────────────┴──────────────┴────────────────┘
    ↓               ↓                ↓
统一格式 (UnifiedCharacterPreset)
    ↓
角色信息提取 (extractCharacterInfo)
    ↓
内部数据模型 (Character)
    ↓
保存到数据库
```

### 关键转换点

1. **格式检测**: 通过特征字段识别格式
2. **统一解析**: 将不同格式转换为统一的内部表示
3. **信息提取**: 从提示词中提取角色基本信息
4. **数据保存**: 保留原始预设信息，以便后续导出

## 保留的预设信息

导入预设格式的角色时，系统会在 `settings` 字段中保存完整的预设配置：

```json
{
  "settings": {
    "cardVersion": "unknown",
    "preset": {
      "format": "quackai",
      "prompts": [...],
      "regexRules": [...],
      "modelConfig": {...}
    }
  }
}
```

这确保了：
- 可以将角色导出回原格式
- 保留所有高级配置（正则规则、模型参数等）
- 支持格式间的转换

## API 端点

### 导入

- **POST** `/api/characters/import`
  - 参数: `file` (multipart/form-data)
  - 支持格式: JSON, PNG
  - 自动检测并解析格式

### 导出

- **GET** `/api/characters/{id}/export`
  - 查询参数: `format=json|png|tavernai`
  - 导出为标准格式

- **GET** `/api/characters/{id}/export-preset`
  - 查询参数: `format=sillytavern|quackai`
  - 导出为预设格式（仅适用于从预设导入的角色）

## 开发者指南

### 添加新格式支持

1. **定义类型**
   
   在 `packages/shared/src/types/preset-formats.ts` 中添加新格式的类型定义。

2. **实现检测逻辑**
   
   在 `detectPresetFormat()` 函数中添加新格式的检测规则。

3. **实现解析器**
   
   创建 `parseXXXFormat()` 函数，将新格式转换为 `UnifiedCharacterPreset`。

4. **实现导出器**
   
   在 `convertToOriginalFormat()` 中添加导出逻辑。

### 测试

运行测试套件：

```bash
cd apps/web
pnpm test src/lib/characters/__tests__/presetParser.test.ts
```

### 示例代码

```typescript
import { 
  detectPresetFormat, 
  parsePreset, 
  extractCharacterInfo 
} from '@/lib/characters/presetParser'

// 检测格式
const detection = detectPresetFormat(jsonData)
console.log(`Format: ${detection.format}, Confidence: ${detection.confidence}`)

// 解析
const unified = parsePreset(jsonData)
const charInfo = extractCharacterInfo(unified)

console.log(`Character: ${charInfo.name}`)
console.log(`Description: ${charInfo.description}`)
console.log(`Prompts: ${unified.prompts.length}`)
```

## 常见问题

### Q: 导入的角色缺少某些信息？

A: 不同格式存储信息的方式不同。对于预设格式（SillyTavern/QuackAI），角色信息通常分散在多个提示词中。系统会尝试从以下位置提取信息：

- 名为"角色"、"character"的提示词 → 描述
- 名为"人设"、"personality"的提示词 → 性格
- 名为"场景"、"scenario"的提示词 → 场景设定

### Q: 能否将标准角色卡导出为预设格式？

A: 不推荐。预设格式包含大量提示词和配置信息，从简单的角色卡无法准确重建这些信息。只有从预设格式导入的角色才建议导出回预设格式。

### Q: 正则规则和模型配置会保留吗？

A: 是的。所有预设信息（包括正则规则、模型配置）都会保存在角色的 `settings.preset` 字段中，可以在导出时完整恢复。

## 兼容性测试

已测试的文件：
- ✅ 【MoM】极光海域 2.4.3 Ver @电波系.json (SillyTavern 格式)
- ✅ ☆Healer☆1.3.json (QuackAI 格式)
- ✅ 标准 CharacterCard V2 格式

## 更新日志

### 2025-10-27
- ✅ 添加 SillyTavern 预设格式支持
- ✅ 添加 QuackAI/Narratium 格式支持
- ✅ 实现统一格式转换
- ✅ 创建测试套件
- ✅ 添加导出预设功能

## 技术栈

- **类型系统**: TypeScript with Zod validation
- **解析器**: Custom JSON parsers for each format
- **存储**: PostgreSQL with JSON fields for preset data
- **测试**: Vitest

## 贡献

欢迎提交 PR 添加更多格式支持！请确保：

1. 添加完整的类型定义
2. 实现检测、解析、导出逻辑
3. 编写测试用例
4. 更新文档

## 许可

本项目使用 MIT 许可证。

