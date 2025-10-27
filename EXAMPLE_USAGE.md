# 角色卡格式兼容 - 使用示例

## 快速开始

### 1. 导入示例角色卡

#### 使用命令行

```bash
# 导入 SillyTavern 预设
curl -X POST http://localhost:3000/api/characters/import \
  -F "file=@【MoM】极光海域 2.4.3 Ver @电波系.json"

# 导入 QuackAI 角色卡
curl -X POST http://localhost:3000/api/characters/import \
  -F "file=@☆Healer☆1.3.json"
```

#### 使用 JavaScript/TypeScript

```typescript
// 导入角色卡
async function importCharacter(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/characters/import', {
    method: 'POST',
    body: formData,
  })
  
  const result = await response.json()
  console.log('Imported character:', result.character)
  return result
}

// 使用
const file = document.querySelector('input[type="file"]').files[0]
const character = await importCharacter(file)
```

### 2. 检测格式

```typescript
import { detectPresetFormat } from '@/lib/characters/presetParser'

// 读取 JSON 文件
const jsonData = JSON.parse(fileContent)

// 检测格式
const detection = detectPresetFormat(jsonData)

console.log(`格式: ${detection.format}`)
console.log(`置信度: ${detection.confidence}`)
console.log(`原因: ${detection.reasons.join(', ')}`)

// 输出示例:
// 格式: quackai
// 置信度: 0.9
// 原因: 含有 promptList 数组, 含有 regexList 数组, 含有 id、name、intro 基本信息字段
```

### 3. 解析和提取信息

```typescript
import { parsePreset, extractCharacterInfo } from '@/lib/characters/presetParser'

// 解析为统一格式
const unified = parsePreset(jsonData)

console.log('预设名称:', unified.name)
console.log('提示词数量:', unified.prompts.length)
console.log('正则规则数量:', unified.regexRules?.length || 0)

// 提取角色信息
const charInfo = extractCharacterInfo(unified)

console.log('角色名称:', charInfo.name)
console.log('角色描述:', charInfo.description)
console.log('性格:', charInfo.personality)
console.log('场景设定:', charInfo.scenario)
console.log('第一条消息:', charInfo.firstMessage)
console.log('示例对话数:', charInfo.exampleMessages.length)
```

### 4. 格式转换

```typescript
import { convertToOriginalFormat } from '@/lib/characters/presetParser'

// 从数据库加载角色
const character = await db.findUnique('Character', { id: characterId })
const settings = JSON.parse(character.settings)
const preset = settings.preset

if (!preset) {
  console.error('This character was not imported from a preset format')
  return
}

// 重建统一格式
const unified = {
  name: character.name,
  description: character.description,
  prompts: preset.prompts,
  regexRules: preset.regexRules,
  modelConfig: preset.modelConfig,
  sourceFormat: preset.format,
}

// 转换为 SillyTavern 格式
const sillyTavernData = convertToOriginalFormat(unified, 'sillytavern')

// 转换为 QuackAI 格式
const quackAIData = convertToOriginalFormat(unified, 'quackai')

// 保存为文件
const blob = new Blob([JSON.stringify(sillyTavernData, null, 2)], {
  type: 'application/json',
})
const url = URL.createObjectURL(blob)
```

## 实际应用场景

### 场景 1: 批量导入角色

```typescript
async function importMultipleCharacters(files: File[]) {
  const results = []
  
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/characters/import', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      results.push({
        file: file.name,
        success: true,
        character: result.character,
      })
    } catch (error) {
      results.push({
        file: file.name,
        success: false,
        error: error.message,
      })
    }
  }
  
  return results
}
```

### 场景 2: 格式预览

```typescript
async function previewCharacter(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  // 使用 commit=false 参数进行预览
  const response = await fetch('/api/characters/import?commit=false', {
    method: 'POST',
    body: formData,
  })
  
  const { preview } = await response.json()
  
  // 显示预览信息
  return {
    name: preview.mapping.name,
    description: preview.mapping.description,
    promptCount: preview.normalized._unifiedPreset?.prompts?.length || 0,
    regexCount: preview.normalized._unifiedPreset?.regexRules?.length || 0,
    format: preview.normalized._unifiedPreset?.sourceFormat,
  }
}
```

### 场景 3: 角色迁移工具

```typescript
/**
 * 将角色从一个格式迁移到另一个格式
 */
async function migrateCharacterFormat(
  sourceFile: File,
  targetFormat: 'sillytavern' | 'quackai'
) {
  // 1. 读取源文件
  const content = await sourceFile.text()
  const data = JSON.parse(content)
  
  // 2. 解析为统一格式
  const unified = parsePreset(data)
  
  // 3. 转换为目标格式
  const converted = convertToOriginalFormat(unified, targetFormat)
  
  // 4. 返回新文件
  const blob = new Blob([JSON.stringify(converted, null, 2)], {
    type: 'application/json',
  })
  
  return new File(
    [blob],
    `${unified.name}_${targetFormat}.json`,
    { type: 'application/json' }
  )
}

// 使用示例
const quackAIFile = new File([...], 'healer.json')
const sillyTavernFile = await migrateCharacterFormat(quackAIFile, 'sillytavern')
// 下载转换后的文件
```

### 场景 4: 自定义提示词管理

```typescript
/**
 * 管理角色的提示词
 */
class PromptManager {
  constructor(private characterId: string) {}
  
  async getPrompts() {
    const character = await db.findUnique('Character', { id: this.characterId })
    const settings = JSON.parse(character.settings)
    return settings.preset?.prompts || []
  }
  
  async updatePrompt(promptId: string, content: string) {
    const character = await db.findUnique('Character', { id: this.characterId })
    const settings = JSON.parse(character.settings)
    
    const prompt = settings.preset.prompts.find((p: any) => p.id === promptId)
    if (prompt) {
      prompt.content = content
      await db.update('Character', {
        where: { id: this.characterId },
        data: { settings: JSON.stringify(settings) },
      })
    }
  }
  
  async addPrompt(name: string, content: string, role: 'system' | 'user' | 'assistant') {
    const character = await db.findUnique('Character', { id: this.characterId })
    const settings = JSON.parse(character.settings)
    
    settings.preset.prompts.push({
      id: `custom-${Date.now()}`,
      name,
      role,
      content,
      enabled: true,
    })
    
    await db.update('Character', {
      where: { id: this.characterId },
      data: { settings: JSON.stringify(settings) },
    })
  }
  
  async togglePrompt(promptId: string) {
    const character = await db.findUnique('Character', { id: this.characterId })
    const settings = JSON.parse(character.settings)
    
    const prompt = settings.preset.prompts.find((p: any) => p.id === promptId)
    if (prompt) {
      prompt.enabled = !prompt.enabled
      await db.update('Character', {
        where: { id: this.characterId },
        data: { settings: JSON.stringify(settings) },
      })
    }
  }
}

// 使用示例
const manager = new PromptManager('char-123')
const prompts = await manager.getPrompts()

// 更新提示词
await manager.updatePrompt('char-desc', '新的角色描述')

// 添加新提示词
await manager.addPrompt('自定义规则', '一些自定义的行为规则', 'system')

// 切换提示词启用状态
await manager.togglePrompt('writing-style')
```

### 场景 5: React 组件集成

```tsx
import React, { useState } from 'react'
import { detectPresetFormat, extractCharacterInfo } from '@/lib/characters/presetParser'

export function CharacterImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    setFile(selectedFile)
    
    // 读取并预览
    const text = await selectedFile.text()
    const data = JSON.parse(text)
    
    const detection = detectPresetFormat(data)
    
    if (detection.format !== 'unknown') {
      const unified = parsePreset(data)
      const charInfo = extractCharacterInfo(unified)
      
      setPreview({
        format: detection.format,
        confidence: detection.confidence,
        name: charInfo.name,
        description: charInfo.description,
        promptCount: unified.prompts.length,
      })
    }
  }

  const handleImport = async () => {
    if (!file) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/characters/import', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      alert(`成功导入角色: ${result.character.name}`)
    } catch (error) {
      alert('导入失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="block w-full"
      />
      
      {preview && (
        <div className="border p-4 rounded-lg">
          <h3 className="font-bold mb-2">预览</h3>
          <div className="space-y-1 text-sm">
            <p><strong>格式:</strong> {preview.format}</p>
            <p><strong>置信度:</strong> {(preview.confidence * 100).toFixed(0)}%</p>
            <p><strong>角色名:</strong> {preview.name}</p>
            <p><strong>描述:</strong> {preview.description.slice(0, 100)}...</p>
            <p><strong>提示词数:</strong> {preview.promptCount}</p>
          </div>
        </div>
      )}
      
      <button
        onClick={handleImport}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? '导入中...' : '导入角色'}
      </button>
    </div>
  )
}
```

## API 参考

### 导入 API

**POST** `/api/characters/import`

**参数:**
- `file`: 角色卡文件（JSON 或 PNG）
- `commit`: 是否提交（默认 true，设为 false 可预览）

**响应:**
```json
{
  "character": {
    "id": "...",
    "name": "角色名称",
    "description": "角色描述",
    ...
  },
  "message": "Character imported successfully"
}
```

### 导出预设 API

**GET** `/api/characters/{id}/export-preset?format=sillytavern|quackai`

**响应:**
- Content-Type: `application/json`
- Content-Disposition: `attachment; filename="角色名_preset.json"`

## 故障排除

### 问题: 导入时提示"无法识别的格式"

**解决方案:**
1. 检查 JSON 文件是否有效
2. 使用 `detectPresetFormat()` 查看检测结果
3. 确认文件包含必要的字段

```typescript
const detection = detectPresetFormat(jsonData)
console.log('检测详情:', detection)
```

### 问题: 导入的角色信息不完整

**解决方案:**
预设格式的信息可能分散在多个提示词中。检查原始文件中的提示词内容。

```typescript
const unified = parsePreset(jsonData)
unified.prompts.forEach((p) => {
  console.log(`提示词: ${p.name}`)
  console.log(`内容: ${p.content.slice(0, 100)}...`)
})
```

### 问题: 无法导出为预设格式

**解决方案:**
只有从预设格式导入的角色才能导出为预设格式。检查角色的 settings:

```typescript
const character = await db.findUnique('Character', { id })
const settings = JSON.parse(character.settings)
if (!settings.preset) {
  console.log('此角色不是从预设格式导入的')
}
```

## 最佳实践

1. **始终验证格式**: 使用 `detectPresetFormat()` 验证文件格式
2. **保留原始数据**: 系统会自动保留完整的预设信息
3. **使用预览模式**: 导入前先使用 `commit=false` 预览
4. **定期备份**: 导出角色为预设格式进行备份
5. **版本控制**: 在文件名中包含版本号，便于追踪

## 更多资源

- [完整 API 文档](./PRESET_FORMAT_SUPPORT.md)
- [类型定义](./packages/shared/src/types/preset-formats.ts)
- [测试用例](./apps/web/src/lib/characters/__tests__/presetParser.test.ts)

