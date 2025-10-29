/**
 * Handlebars 模板引擎
 * 用于上下文模板的动态组装
 */

import Handlebars from 'handlebars'

// 上下文数据接口
export interface ContextData {
  // 系统
  system_prompt?: string
  jailbreak?: string
  
  // 角色
  char: string
  user: string
  description: string
  personality?: string
  scenario?: string
  
  // 世界信息
  wiBefore?: string       // 角色定义前的 WI
  wiAfter?: string        // 历史后的 WI
  world_info?: boolean    // 是否有 WI
  
  // 示例对话
  mesExamples?: string
  example_separator?: string
  
  // 聊天历史
  chat_history: string
  chat_start?: string
  
  // 指令
  author_note?: string    // Author's Note
  post_history_instructions?: string
  
  // 元数据
  [key: string]: any
}

export class HandlebarsEngine {
  private handlebars: typeof Handlebars
  
  constructor() {
    this.handlebars = Handlebars.create()
    this.registerHelpers()
  }
  
  /**
   * 注册内置 helpers
   */
  private registerHelpers() {
    // {{trim text}} - 去除多余换行和空白
    this.handlebars.registerHelper('trim', (str: string) => {
      return str?.trim() || ''
    })
    
    // {{upper text}} - 转大写
    this.handlebars.registerHelper('upper', (str: string) => {
      return str?.toUpperCase() || ''
    })
    
    // {{lower text}} - 转小写
    this.handlebars.registerHelper('lower', (str: string) => {
      return str?.toLowerCase() || ''
    })
    
    // {{#if condition}} ... {{/if}} - 条件判断（内置）
    // Handlebars 已经提供，这里不需要重新注册
    
    // {{#unless condition}} ... {{/unless}} - 反向条件（内置）
    
    // {{#each array}} ... {{/each}} - 循环（内置）
    
    // {{char}} 和 {{user}} 直接通过上下文数据提供
    
    // 自定义 helper: {{firstLine text}}
    this.handlebars.registerHelper('firstLine', (str: string) => {
      return str?.split('\n')[0] || ''
    })
    
    // 自定义 helper: {{truncate text length}}
    this.handlebars.registerHelper('truncate', (str: string, length: number) => {
      if (!str) return ''
      if (str.length <= length) return str
      return str.substring(0, length) + '...'
    })
    
    // 自定义 helper: {{json object}}
    this.handlebars.registerHelper('json', (obj: any) => {
      return JSON.stringify(obj, null, 2)
    })
  }
  
  /**
   * 编译模板并应用上下文数据
   */
  compile(template: string, context: ContextData): string {
    try {
      const compiled = this.handlebars.compile(template)
      return compiled(context)
    } catch (error) {
      console.error('Handlebars compilation error:', error)
      throw new Error(`Template compilation failed: ${error}`)
    }
  }
  
  /**
   * 验证模板语法
   */
  validate(template: string): { valid: boolean; error?: string } {
    try {
      this.handlebars.compile(template)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * 注册自定义 helper
   */
  registerHelper(name: string, fn: Handlebars.HelperDelegate) {
    this.handlebars.registerHelper(name, fn)
  }
  
  /**
   * 注销 helper
   */
  unregisterHelper(name: string) {
    this.handlebars.unregisterHelper(name)
  }
  
  /**
   * 预编译模板（性能优化）
   */
  precompile(template: string): Handlebars.TemplateDelegate<any> {
    return this.handlebars.compile(template)
  }
}

// 单例导出
export const handlebarsEngine = new HandlebarsEngine()

// 便捷函数
export function compileTemplate(template: string, context: ContextData): string {
  return handlebarsEngine.compile(template, context)
}

export function validateTemplate(template: string): { valid: boolean; error?: string } {
  return handlebarsEngine.validate(template)
}

