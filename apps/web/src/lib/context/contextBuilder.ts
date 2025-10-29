/**
 * 智能上下文构建器
 * 实现 Token 预算管理、优先级排序和渐进式裁剪
 */

import type { Character, Message } from '@prisma/client'
import type { AIMessage } from '@sillytavern-clone/ai-providers'
import { TokenCounter } from '@sillytavern-clone/shared/src/utils/tokenCounter'
import { HandlebarsEngine, type ContextData } from '@sillytavern-clone/shared/src/utils/handlebarsEngine'
import type { ActivatedEntry } from '../worldinfo/activationEngine'
import { BUILTIN_TEMPLATES, INSERTION_POSITIONS } from './templates'

export interface ContextBuildOptions {
  maxContextTokens: number      // 模型上下文窗口
  reserveTokens: number          // 预留给生成
  model: string                  // 用于 token 计数
  templateName?: string          // 使用的模板
  enableSummary?: boolean        // 启用自动总结
}

export class ContextBuilder {
  private tokenCounter: TokenCounter
  private handlebars: HandlebarsEngine
  
  constructor() {
    this.tokenCounter = new TokenCounter()
    this.handlebars = new HandlebarsEngine()
  }
  
  /**
   * 构建最终上下文
   */
  async buildContext(
    character: any, // Character type
    messages: Message[],
    activatedEntries: ActivatedEntry[],
    userMessage: string,
    options: ContextBuildOptions
  ): Promise<AIMessage[]> {
    const availableTokens = options.maxContextTokens - options.reserveTokens
    
    // 1. 准备各组件（按 token 预算分配）
    const components = await this.prepareComponents(
      character,
      messages,
      activatedEntries,
      userMessage,
      availableTokens,
      options
    )
    
    // 2. 应用 Handlebars 模板
    const template = BUILTIN_TEMPLATES[options.templateName as keyof typeof BUILTIN_TEMPLATES] || BUILTIN_TEMPLATES.default
    const contextData = this.buildContextData(components, character)
    const finalPrompt = this.handlebars.compile(template, contextData)
    
    // 3. 转换为 AIMessage 格式
    return this.convertToMessages(finalPrompt, character, userMessage)
  }
  
  /**
   * 准备上下文组件（智能裁剪，动态预算分配）
   */
  private async prepareComponents(
    character: any,
    messages: Message[],
    activatedEntries: ActivatedEntry[],
    userMessage: string,
    availableTokens: number,
    options: ContextBuildOptions
  ) {
    // 动态 Token 预算分配
    // 如果 World Info 条目少，把更多 token 分配给历史消息
    const hasWorldInfo = activatedEntries.length > 0
    const budgets = {
      character: Math.floor(availableTokens * 0.15),  // 15% - 角色核心
      worldInfo: hasWorldInfo 
        ? Math.floor(availableTokens * 0.25)  // 25% - 有 World Info
        : Math.floor(availableTokens * 0.05), // 5% - 无 World Info
      history: hasWorldInfo
        ? Math.floor(availableTokens * 0.50)  // 50% - 有 World Info 时减少历史
        : Math.floor(availableTokens * 0.70), // 70% - 无 World Info 时增加历史
      system: Math.floor(availableTokens * 0.10)      // 10% - 系统提示和示例
    }
    
    console.log(`[Context Builder] Token budgets: char=${budgets.character}, WI=${budgets.worldInfo}, history=${budgets.history}, system=${budgets.system}, total=${availableTokens}`)
    
    // 角色核心（最高优先级，永不裁剪）
    const characterCore = this.buildCharacterCore(character)
    const coreTokens = this.tokenCounter.countTokens(characterCore, options.model)
    
    // World Info（按 insertionOrder 排序后裁剪）
    const worldInfo = await this.injectWorldInfo(
      activatedEntries,
      budgets.worldInfo,
      options.model
    )
    
    // 聊天历史（保留最近的，必要时总结旧的）
    const history = await this.trimHistory(
      messages,
      budgets.history,
      options.model,
      options.enableSummary || false
    )
    
    // 示例对话
    const examples = this.buildExamples(character, budgets.system, options.model)
    
    // 计算实际使用的 token 数
    const actualWorldInfoTokens = Object.values(worldInfo)
      .map(text => this.tokenCounter.countTokens(text, options.model))
      .reduce((a, b) => a + b, 0)
    const actualHistoryTokens = this.tokenCounter.countTokens(history, options.model)
    const actualExamplesTokens = this.tokenCounter.countTokens(examples, options.model)
    const totalUsedTokens = coreTokens + actualWorldInfoTokens + actualHistoryTokens + actualExamplesTokens
    
    console.log(`[Context Builder] Actual usage: char=${coreTokens}, WI=${actualWorldInfoTokens}, history=${actualHistoryTokens}, examples=${actualExamplesTokens}, total=${totalUsedTokens}/${availableTokens}`)
    
    return {
      characterCore,
      worldInfo,
      history,
      examples,
      coreTokens,
      stats: {
        totalTokens: totalUsedTokens,
        availableTokens,
        utilizationRate: (totalUsedTokens / availableTokens * 100).toFixed(2) + '%'
      }
    }
  }
  
  /**
   * 构建角色核心内容
   */
  private buildCharacterCore(character: any): string {
    const parts: string[] = []
    
    if (character.description) parts.push(character.description)
    if (character.personality) parts.push(`Personality: ${character.personality}`)
    if (character.scenario) parts.push(`Scenario: ${character.scenario}`)
    
    return parts.join('\n\n')
  }
  
  /**
   * 构建示例对话
   */
  private buildExamples(character: any, maxTokens: number, model: string): string {
    if (!character.mesExample && !character.exampleMessages) return ''
    
    let examples: Array<{ user: string; assistant: string }> = []
    
    try {
      // 尝试解析 mesExample（SillyTavern v2 格式）
      if (character.mesExample) {
        const lines = character.mesExample.split('\n').filter((l: string) => l.trim())
        for (let i = 0; i < lines.length; i += 2) {
          const userLine = lines[i]
          const botLine = lines[i + 1]
          if (userLine && botLine) {
            examples.push({
              user: userLine.replace(/^<USER>:?\s*/i, '').replace(/^{{user}}:?\s*/i, '').trim(),
              assistant: botLine.replace(/^<BOT>:?\s*/i, '').replace(/^{{char}}:?\s*/i, '').trim()
            })
          }
        }
      }
      
      // 或者使用 exampleMessages
      if (examples.length === 0 && character.exampleMessages) {
        const parsed = typeof character.exampleMessages === 'string' 
          ? JSON.parse(character.exampleMessages) 
          : character.exampleMessages
        
        if (Array.isArray(parsed)) {
          examples = parsed
        }
      }
    } catch (error) {
      console.warn('Failed to parse example messages:', error)
    }
    
    if (examples.length === 0) return ''
    
    // 格式化并应用 token 限制
    const formatted: string[] = []
    let usedTokens = 0
    
    for (const ex of examples) {
      const line = `User: ${ex.user}\nAssistant: ${ex.assistant}`
      const tokens = this.tokenCounter.countTokens(line, model)
      
      if (usedTokens + tokens <= maxTokens) {
        formatted.push(line)
        usedTokens += tokens
      } else {
        break
      }
    }
    
    return formatted.join('\n\n')
  }
  
  /**
   * World Info 注入（按位置分组）
   */
  private async injectWorldInfo(
    entries: ActivatedEntry[],
    maxTokens: number,
    model: string
  ): Promise<Record<string, string>> {
    const grouped: Record<string, ActivatedEntry[]> = {}
    
    // 按位置分组
    for (const entry of entries) {
      if (!grouped[entry.position]) grouped[entry.position] = []
      grouped[entry.position].push(entry)
    }
    
    // 每个位置应用 token 预算
    const result: Record<string, string> = {}
    const positionCount = Object.keys(grouped).length
    const positionBudget = positionCount > 0 ? Math.floor(maxTokens / positionCount) : maxTokens
    
    for (const [position, posEntries] of Object.entries(grouped)) {
      const texts: string[] = []
      let usedTokens = 0
      
      // 已经按 insertionOrder 排序
      for (const { entry } of posEntries) {
        // 使用自定义模板或默认格式
        let formatted = entry.insertionTemplate
          ? entry.insertionTemplate
              .replace('{name}', entry.name)
              .replace('{content}', entry.content)
          : `[${entry.name}]\n${entry.content}`
        
        const tokens = this.tokenCounter.countTokens(formatted, model)
        
        // 检查单个条目的 tokenBudget
        if (entry.tokenBudget && tokens > entry.tokenBudget) {
          // 裁剪内容
          formatted = this.tokenCounter.truncateToLimit(formatted, entry.tokenBudget, model)
        }
        
        // 检查总预算
        if (usedTokens + tokens <= positionBudget || texts.length === 0) {
          texts.push(formatted)
          usedTokens += tokens
        } else {
          break // 预算用完
        }
      }
      
      result[position] = texts.join('\n\n')
    }
    
    return result
  }
  
  /**
   * 聊天历史裁剪（保留最近 + 总结旧的，改进连贯性）
   */
  private async trimHistory(
    messages: Message[],
    maxTokens: number,
    model: string,
    enableSummary: boolean
  ): Promise<string> {
    if (messages.length === 0) return ''
    
    const formatted: string[] = []
    let usedTokens = 0
    let includedCount = 0
    
    // 从最新消息开始倒序添加
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      const roleName = msg.role === 'user' ? 'User' : 'Assistant'
      const line = `${roleName}: ${msg.content}`
      const tokens = this.tokenCounter.countTokens(line, model)
      
      if (usedTokens + tokens <= maxTokens) {
        formatted.unshift(line)
        usedTokens += tokens
        includedCount++
      } else {
        // 预算用完，如果启用总结，对剩余消息生成摘要
        if (enableSummary && i > 0) {
          const oldMessages = messages.slice(0, i + 1)
          const summary = await this.generateSummary(oldMessages)
          const summaryLine = `[Earlier conversation (${i + 1} messages): ${summary}]`
          formatted.unshift(summaryLine)
        } else if (i > 0) {
          // 未启用总结时，至少显示被截断的消息数
          formatted.unshift(`[Earlier conversation: ${i + 1} messages not shown]`)
        }
        break
      }
    }
    
    console.log(`[Context Builder] History: included ${includedCount}/${messages.length} messages, ${usedTokens} tokens`)
    
    return formatted.join('\n')
  }
  
  /**
   * 自动总结（暂时简化实现）
   */
  private async generateSummary(messages: Message[]): Promise<string> {
    // TODO: 调用 AI 生成总结
    // 暂时返回简单统计
    const userCount = messages.filter(m => m.role === 'user').length
    const assistantCount = messages.filter(m => m.role === 'assistant').length
    return `${messages.length} messages exchanged (${userCount} user, ${assistantCount} assistant)`
  }
  
  /**
   * 构建 Handlebars 上下文数据
   */
  private buildContextData(components: any, character: any): ContextData {
    return {
      char: character.name || 'Character',
      user: 'User',
      description: components.characterCore,
      personality: character.personality || '',
      scenario: character.scenario || '',
      chat_history: components.history,
      mesExamples: components.examples,
      wiBefore: components.worldInfo['before_char'] || components.worldInfo['after_char'] || components.worldInfo['after_example'] || '',
      wiAfter: components.worldInfo['after_history'] || '',
      author_note: character.authorNote || components.worldInfo['author_note_top'] || '',
      post_history_instructions: character.postHistoryInstructions || components.worldInfo['author_note_bottom'] || '',
      system_prompt: character.systemPrompt || '',
      jailbreak: character.jailbreakPrompt || '',
      world_info: Object.keys(components.worldInfo).length > 0,
      example_separator: character.exampleSeparator || '###',
      chat_start: character.chatStart || '<START>'
    }
  }
  
  /**
   * 转换为 AIMessage 格式
   */
  private convertToMessages(
    finalPrompt: string,
    character: any,
    userMessage: string
  ): AIMessage[] {
    const messages: AIMessage[] = []
    
    // System prompt（包含完整上下文）
    messages.push({
      role: 'system',
      content: finalPrompt
    })
    
    // 用户当前消息
    messages.push({
      role: 'user',
      content: userMessage
    })
    
    return messages
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    this.tokenCounter.cleanup()
  }
}

