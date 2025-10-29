/**
 * 内置上下文模板库
 * 提供 SillyTavern 兼容的 Handlebars 模板
 */

export const BUILTIN_TEMPLATES = {
  // 默认模板（ST 兼容）
  default: `{{#if jailbreak}}{{jailbreak}}

{{/if}}{{#if system_prompt}}{{system_prompt}}

{{/if}}{{#if wiBefore}}{{wiBefore}}

{{/if}}{{description}}
{{#if personality}}

{{personality}}{{/if}}
{{#if scenario}}

Scenario: {{scenario}}{{/if}}

{{#if mesExamples}}{{example_separator}}
{{mesExamples}}
{{example_separator}}
{{/if}}

{{chat_start}}
{{chat_history}}

{{#if wiAfter}}{{wiAfter}}
{{/if}}{{#if author_note}}
[Author's Note: {{author_note}}]
{{/if}}{{#if post_history_instructions}}

{{post_history_instructions}}{{/if}}`,

  // 简洁模板
  minimal: `{{description}}

{{chat_history}}

{{author_note}}`,

  // 角色扮演优化模板
  roleplay_optimized: `{{system_prompt}}

=== CHARACTER ===
{{description}}
{{personality}}

{{#if wiBefore}}=== WORLD INFO ===
{{wiBefore}}

{{/if}}=== SCENARIO ===
{{scenario}}

{{mesExamples}}

{{chat_start}}
{{chat_history}}

{{#if wiAfter}}[Active Context]
{{wiAfter}}

{{/if}}[Instruction: {{author_note}}]
{{post_history_instructions}}`,

  // 故事模式模板
  story_mode: `{{#if jailbreak}}{{jailbreak}}

{{/if}}[Story Setting]
{{scenario}}

[Characters]
{{description}}

{{#if wiBefore}}[World Details]
{{wiBefore}}

{{/if}}[Story So Far]
{{chat_history}}

{{#if wiAfter}}[Current Context]
{{wiAfter}}

{{/if}}{{#if author_note}}[Narration Style: {{author_note}}]{{/if}}`,

  // 问答模式模板
  qa_mode: `System: {{system_prompt}}

{{#if wiBefore}}Knowledge Base:
{{wiBefore}}

{{/if}}{{description}}

Conversation:
{{chat_history}}

{{#if wiAfter}}Additional Context:
{{wiAfter}}
{{/if}}`,
}

// 插入位置映射（WorldInfo position 到模板占位符）
export const INSERTION_POSITIONS = {
  before_char: 'wiBefore',
  after_char: 'wiBefore',
  after_example: 'wiBefore',
  after_history: 'wiAfter',
  in_chat: 'chat_history',
  author_note_top: 'author_note',
  author_note_bottom: 'post_history_instructions'
} as const

// 模板元数据
export interface TemplateMetadata {
  id: string
  name: string
  description: string
  category: 'general' | 'roleplay' | 'story' | 'qa'
  template: string
  isBuiltin: boolean
}

export const TEMPLATE_METADATA: TemplateMetadata[] = [
  {
    id: 'default',
    name: '默认模板',
    description: 'SillyTavern 标准模板，兼容所有场景',
    category: 'general',
    template: BUILTIN_TEMPLATES.default,
    isBuiltin: true
  },
  {
    id: 'minimal',
    name: '简洁模板',
    description: '最小化模板，适合快速对话',
    category: 'general',
    template: BUILTIN_TEMPLATES.minimal,
    isBuiltin: true
  },
  {
    id: 'roleplay_optimized',
    name: '角色扮演优化',
    description: '专为角色扮演场景优化，结构化上下文',
    category: 'roleplay',
    template: BUILTIN_TEMPLATES.roleplay_optimized,
    isBuiltin: true
  },
  {
    id: 'story_mode',
    name: '故事模式',
    description: '叙事风格模板，适合故事创作',
    category: 'story',
    template: BUILTIN_TEMPLATES.story_mode,
    isBuiltin: true
  },
  {
    id: 'qa_mode',
    name: '问答模式',
    description: '知识库问答模板',
    category: 'qa',
    template: BUILTIN_TEMPLATES.qa_mode,
    isBuiltin: true
  }
]

/**
 * 获取模板
 */
export function getTemplate(id: string): string | undefined {
  return BUILTIN_TEMPLATES[id as keyof typeof BUILTIN_TEMPLATES]
}

/**
 * 获取默认模板
 */
export function getDefaultTemplate(): string {
  return BUILTIN_TEMPLATES.default
}

/**
 * 获取所有模板元数据
 */
export function getAllTemplates(): TemplateMetadata[] {
  return TEMPLATE_METADATA
}

/**
 * 根据类别获取模板
 */
export function getTemplatesByCategory(category: TemplateMetadata['category']): TemplateMetadata[] {
  return TEMPLATE_METADATA.filter(t => t.category === category)
}

