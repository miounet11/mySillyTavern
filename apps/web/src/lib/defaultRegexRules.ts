/**
 * Default regex rules for chat message formatting
 * These rules automatically detect and style different text types:
 * - Dialogue (对话)
 * - Actions (动作)
 * - Thoughts (思考)
 * - Emphasis (强调)
 * - And clean up special tags
 */

export interface RegexScript {
  id: string
  name: string
  enabled: boolean
  findRegex: string
  replaceWith: string
  priority: number
  scriptType: 'input' | 'output' | 'display' | 'all'
}

export const DEFAULT_REGEX_RULES: RegexScript[] = [
  // 清理规则 - 最高优先级，先移除不需要显示的内容
  {
    id: 'default-remove-ttl',
    name: '删除状态栏标签',
    enabled: true,
    findRegex: '<TTL>[\\s\\S]*?</TTL>',
    replaceWith: '',
    priority: 1000,
    scriptType: 'display'
  },
  {
    id: 'default-remove-cg',
    name: 'CG插图隐藏',
    enabled: true,
    findRegex: '<CG([\\s\\S]*?)>',
    replaceWith: '',
    priority: 999,
    scriptType: 'display'
  },
  
  // 手动标签识别 - 高优先级
  {
    id: 'default-talk-tag',
    name: '对话标签（talk）',
    enabled: true,
    findRegex: '<talk>(.*?)</talk>',
    replaceWith: '<span class="text-dialogue">"$1"</span>',
    priority: 900,
    scriptType: 'display'
  },
  {
    id: 'default-action-tag',
    name: '动作标签（action）',
    enabled: true,
    findRegex: '<action>(.*?)</action>',
    replaceWith: '<em class="text-action">*$1*</em>',
    priority: 890,
    scriptType: 'display'
  },
  {
    id: 'default-think-tag',
    name: '思考标签（think）',
    enabled: true,
    findRegex: '<think>(.*?)</think>',
    replaceWith: '<em class="text-thought">($1)</em>',
    priority: 880,
    scriptType: 'display'
  },
  {
    id: 'default-emphasis-tag',
    name: '强调标签（em）',
    enabled: true,
    findRegex: '<em>(.*?)</em>',
    replaceWith: '<em class="text-emphasis">$1</em>',
    priority: 870,
    scriptType: 'display'
  },
  
  // 自动识别 - 中等优先级
  {
    id: 'default-auto-dialogue-quotes',
    name: '自动识别对话（引号）',
    enabled: true,
    findRegex: '"([^"]+)"',
    replaceWith: '<span class="text-dialogue">"$1"</span>',
    priority: 500,
    scriptType: 'display'
  },
  {
    id: 'default-auto-dialogue-chinese',
    name: '自动识别对话（中文引号）',
    enabled: true,
    findRegex: '"([^"]+)"',
    replaceWith: '<span class="text-dialogue">"$1"</span>',
    priority: 499,
    scriptType: 'display'
  },
  {
    id: 'default-auto-action-asterisk',
    name: '自动识别动作（单星号）',
    enabled: true,
    findRegex: '\\*([^*\\n]+)\\*',
    replaceWith: '<em class="text-action">*$1*</em>',
    priority: 490,
    scriptType: 'display'
  },
  {
    id: 'default-auto-emphasis-double',
    name: '自动识别强调（双星号）',
    enabled: true,
    findRegex: '\\*\\*([^*]+)\\*\\*',
    replaceWith: '<strong class="text-emphasis">$1</strong>',
    priority: 495,
    scriptType: 'display'
  },
  {
    id: 'default-auto-thought-parenthesis',
    name: '自动识别思考（圆括号）',
    enabled: true,
    findRegex: '\\(([^()]{10,})\\)',
    replaceWith: '<em class="text-thought">($1)</em>',
    priority: 480,
    scriptType: 'display'
  },
  
  // 代码和特殊格式 - 低优先级
  {
    id: 'default-code-inline',
    name: '行内代码',
    enabled: true,
    findRegex: '`([^`]+)`',
    replaceWith: '<code class="bg-gray-800/60 text-teal-300 px-2 py-0.5 rounded text-sm font-mono border border-gray-700">$1</code>',
    priority: 100,
    scriptType: 'display'
  }
]

/**
 * Get default regex rules
 */
export function getDefaultRegexRules(): RegexScript[] {
  return [...DEFAULT_REGEX_RULES]
}

/**
 * Check if default rules have been initialized
 */
export function hasDefaultRulesInitialized(): boolean {
  if (typeof window === 'undefined') return false
  
  const stored = localStorage.getItem('regex_scripts_initialized')
  return stored === 'true'
}

/**
 * Mark default rules as initialized
 */
export function markDefaultRulesInitialized(): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('regex_scripts_initialized', 'true')
}

