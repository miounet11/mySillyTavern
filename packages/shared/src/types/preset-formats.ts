/**
 * SillyTavern Preset and QuackAI Character Card Format Types
 * 支持多种角色卡格式的类型定义
 */

// ===== SillyTavern 预设格式 =====

export interface SillyTavernPrompt {
  identifier: string
  name: string
  enabled: boolean
  injection_position: number
  injection_depth: number
  injection_order: number
  role: 'system' | 'user' | 'assistant'
  content: string
  system_prompt?: boolean
  marker?: boolean
  forbid_overrides?: boolean
  i18nName?: Record<string, string> | null
  extra?: Record<string, any>
}

export interface SillyTavernPreset {
  // 模型参数
  genamt?: number
  max_length?: number
  temperature?: number
  frequency_penalty?: number
  presence_penalty?: number
  top_p?: number
  top_k?: number
  top_a?: number
  min_p?: number
  repetition_penalty?: number
  openai_max_context?: number
  openai_max_tokens?: number
  
  // 格式化选项
  wrap_in_quotes?: boolean
  names_behavior?: number
  send_if_empty?: string
  impersonation_prompt?: string
  new_chat_prompt?: string
  new_group_chat_prompt?: string
  new_example_chat_prompt?: string
  continue_nudge_prompt?: string
  group_nudge_prompt?: string
  
  // 其他配置
  bias_preset_selected?: string
  max_context_unlocked?: boolean
  wi_format?: string
  scenario_format?: string
  personality_format?: string
  stream_openai?: boolean
  
  // 提示词列表
  prompts: SillyTavernPrompt[]
  
  // 元数据（可选）
  name?: string
  description?: string
  author?: string
  version?: string
}

// ===== QuackAI/Narratium 格式 =====

export interface QuackAIPrompt {
  marker?: boolean
  name: string
  i18nName?: Record<string, string> | null
  role: 'system' | 'user' | 'assistant'
  content: string
  enabled: boolean
  identifier: string
  controllers?: Array<{
    id: string
    value: any[]
  }>
}

export interface QuackAIRegex {
  id: string
  name: string
  i18nName?: Record<string, string> | null
  enabled: boolean
  findRegex: string
  replaceString: string
  minDepth?: number | null
  maxDepth?: number | null
  placement?: number[]
  effectScope?: string[]
  testMode?: boolean
  inputRegexText?: string
  outpubRegexText?: string
  controllers?: any[]
}

export interface QuackAIModelParam {
  key: string
  label: string
  i18nName?: Record<string, string> | null
  min: number
  max: number
  step: number
  value: number
}

export interface QuackAIModel {
  value: string
  name: string
  i18nName?: Record<string, string> | null
  paramsTuneList: QuackAIModelParam[]
}

export interface QuackAICharacterCard {
  id: string
  isOfficial?: boolean
  name: string
  i18nName?: string | null
  intro: string
  i18nIntro?: string | null
  promptList: QuackAIPrompt[]
  regexList?: QuackAIRegex[]
  controllerList?: any[]
  modelList?: QuackAIModel[]
  showInvisible?: boolean
  [key: string]: any // 允许其他自定义字段
}

// ===== 统一的内部格式 =====

export interface UnifiedPrompt {
  id: string
  name: string
  role: 'system' | 'user' | 'assistant'
  content: string
  enabled: boolean
  order?: number
  depth?: number
  position?: number
  isMarker?: boolean
  metadata?: Record<string, any>
}

export interface UnifiedRegexRule {
  id: string
  name: string
  enabled: boolean
  pattern: string
  replacement: string
  scope?: string[]
  placement?: number[]
  minDepth?: number
  maxDepth?: number
}

export interface UnifiedModelConfig {
  name: string
  provider: string
  parameters: {
    temperature?: number
    max_tokens?: number
    top_p?: number
    top_k?: number
    frequency_penalty?: number
    presence_penalty?: number
    [key: string]: any
  }
}

export interface UnifiedCharacterPreset {
  // 基本信息
  name: string
  description?: string
  author?: string
  version?: string
  
  // 提示词
  prompts: UnifiedPrompt[]
  
  // 正则规则
  regexRules?: UnifiedRegexRule[]
  
  // 模型配置
  modelConfig?: UnifiedModelConfig
  
  // 原始格式标识
  sourceFormat: 'sillytavern' | 'quackai' | 'standard'
  
  // 原始数据（用于导出回原格式）
  rawData?: any
}

// ===== 格式检测 =====

export type PresetFormat = 'sillytavern' | 'quackai' | 'charactercard-v2' | 'unknown'

export interface FormatDetectionResult {
  format: PresetFormat
  confidence: number // 0-1
  reasons: string[]
}

