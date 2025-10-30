/**
 * World Info 超级激活引擎
 * 实现完整的 22 个技术环节中的动态触发部分
 */

import { db } from '@sillytavern-clone/database'
import type { WorldInfo, Message } from '@prisma/client'
import { nanoid } from 'nanoid'
import { TokenCounter } from '@sillytavern-clone/shared/src/utils/tokenCounter'

export interface ActivationOptions {
  enableRecursive: boolean
  enableVector: boolean
  maxRecursionDepth: number
  vectorThreshold: number
  maxActivatedEntries?: number  // 最多激活条目数
  maxTotalTokens?: number        // World Info 总 token 限制
  model?: string                 // 用于 token 计数
  preloadedEntries?: WorldInfo[] // 性能优化：预加载的条目，避免内部查询
}

export interface ActivatedEntry {
  entry: WorldInfo
  position: string
  order: number
  activatedBy: 'keyword' | 'regex' | 'vector' | 'recursive' | 'always'
  cascadeLevel: number
  estimatedTokens?: number  // 估算的 token 数
}

export class WorldInfoActivationEngine {
  private tokenCounter: TokenCounter

  constructor() {
    this.tokenCounter = new TokenCounter()
  }

  /**
   * 主激活方法 - 实现完整的触发逻辑（带限流）
   */
  async activateEntries(
    chatId: string,
    characterId: string,
    currentMessage: string,
    conversationHistory: Message[],
    options: ActivationOptions
  ): Promise<ActivatedEntry[]> {
    const activated: ActivatedEntry[] = []
    const visited = new Set<string>()
    
    // 从环境变量读取限流配置
    const maxActivatedEntries = options.maxActivatedEntries || 
      parseInt(process.env.WORLDINFO_MAX_ACTIVATED_ENTRIES || '15')
    const maxTotalTokens = options.maxTotalTokens || 
      parseInt(process.env.WORLDINFO_MAX_TOTAL_TOKENS || '20000')
    const model = options.model || 'gpt-3.5-turbo'
    
    // 1. 获取角色关联的所有 World Info（性能优化：优先使用预加载的条目）
    const allEntries = options.preloadedEntries || await this.getCharacterWorldInfo(characterId)
    
    if (options.preloadedEntries) {
      console.log(`[World Info Activation] Using preloaded entries (${allEntries.length}), skipping DB query`)
    }
    
    // 2. 关键词 + 正则 + 向量触发
    for (const entry of allEntries) {
      if (!entry.enabled) continue
      
      // 检查状态（sticky/cooldown/delay）
      const stateCheck = await this.checkStateEffects(entry, chatId)
      if (!stateCheck.canActivate) {
        // 如果是 sticky 状态，自动激活
        if (stateCheck.reason === 'sticky') {
          activated.push({
            entry,
            position: entry.position || 'after_char',
            order: entry.insertionOrder || 100,
            activatedBy: 'always',
            cascadeLevel: 0
          })
          visited.add(entry.id)
        }
        continue
      }
      
      let activatedBy: ActivatedEntry['activatedBy'] | null = null
      
      // Always 激活
      if (entry.activationType === 'always' || 
          (entry.keywords && (entry.keywords === '["always"]' || entry.keywords.includes('always')))) {
        activatedBy = 'always'
      }
      
      // 关键词匹配
      if (!activatedBy && entry.activationType === 'keyword') {
        if (await this.matchKeywords(entry, currentMessage, conversationHistory)) {
          activatedBy = 'keyword'
        }
      }
      
      // 正则匹配
      if (!activatedBy && entry.useRegex && entry.keywordsRegex) {
        if (this.matchRegex(entry.keywordsRegex, currentMessage)) {
          activatedBy = 'regex'
        }
      }
      
      // 向量相似度（需要后续实现 embeddingService）
      // TODO: 在数据库迁移完成后启用
      // if (!activatedBy && options.enableVector && entry.activationType === 'vector' && (entry as any).embeddingVector) {
      //   const embeddingService = new WorldInfoEmbeddingService()
      //   if (await embeddingService.matchVector(entry, currentMessage, options.vectorThreshold)) {
      //     activatedBy = 'vector'
      //   }
      // }
      
      if (activatedBy) {
        activated.push({
          entry,
          position: entry.position || 'after_char',
          order: entry.insertionOrder || 100,
          activatedBy,
          cascadeLevel: 0
        })
        visited.add(entry.id)
        
        // 更新激活状态
        await this.updateActivationState(entry, chatId)
        
        // 递归激活
        if (options.enableRecursive && entry.recursive && entry.cascadeTrigger) {
          const cascaded = await this.activateRecursive(
            entry,
            1,
            visited,
            options.maxRecursionDepth
          )
          activated.push(...cascaded)
        }
      }
    }
    
    // 3. 按 insertionOrder 排序（优先级）
    activated.sort((a, b) => a.order - b.order)
    
    // 4. 应用限流：限制条目数量和总 token 数
    const limited = this.applyRateLimits(
      activated,
      maxActivatedEntries,
      maxTotalTokens,
      model
    )
    
    console.log(`[World Info Activation] Activated ${activated.length} entries, after limits: ${limited.length}`)
    if (limited.length < activated.length) {
      console.log(`[World Info Activation] Truncated ${activated.length - limited.length} entries due to limits`)
    }
    
    return limited
  }
  
  /**
   * 应用限流：限制激活条目数和总 token 数
   */
  private applyRateLimits(
    activated: ActivatedEntry[],
    maxEntries: number,
    maxTokens: number,
    model: string
  ): ActivatedEntry[] {
    const result: ActivatedEntry[] = []
    let totalTokens = 0
    
    for (const entry of activated) {
      // 计算当前条目的 token 数
      const content = entry.entry.insertionTemplate
        ? entry.entry.insertionTemplate
            .replace('{name}', entry.entry.name)
            .replace('{content}', entry.entry.content)
        : `[${entry.entry.name}]\n${entry.entry.content}`
      
      const tokens = this.tokenCounter.countTokens(content, model)
      entry.estimatedTokens = tokens
      
      // 检查是否超过限制
      if (result.length >= maxEntries) {
        console.log(`[World Info Limit] Reached max entries (${maxEntries}), skipping: ${entry.entry.name}`)
        break
      }
      
      if (totalTokens + tokens > maxTokens) {
        console.log(`[World Info Limit] Reached max tokens (${maxTokens}/${totalTokens + tokens}), skipping: ${entry.entry.name}`)
        break
      }
      
      result.push(entry)
      totalTokens += tokens
    }
    
    console.log(`[World Info Stats] Total: ${result.length} entries, ${totalTokens} tokens`)
    return result
  }
  
  /**
   * 关键词匹配（支持逻辑组合）
   */
  private async matchKeywords(
    entry: WorldInfo,
    currentMessage: string,
    history: Message[]
  ): Promise<boolean> {
    let primaryKeys: string[] = []
    let secondaryKeys: string[] = []
    
    try {
      primaryKeys = entry.keywords ? JSON.parse(entry.keywords) : []
      secondaryKeys = entry.secondaryKeys ? JSON.parse(entry.secondaryKeys) : []
    } catch (error) {
      console.warn(`Failed to parse keywords for WorldInfo ${entry.id}:`, error)
      return false
    }
    
    if (primaryKeys.length === 0) return false
    
    // 构建搜索文本
    const searchText = currentMessage.toLowerCase()
    let historyText = ''
    
    const minActivations = entry.minActivations || 0
    if (minActivations > 0 && history.length > 0) {
      const recentMessages = history.slice(-minActivations)
      historyText = recentMessages.map(m => m.content).join(' ').toLowerCase()
    }
    
    const fullText = searchText + ' ' + historyText
    
    // 主关键词匹配
    const primaryMatches = primaryKeys.filter((key: string) => 
      fullText.includes(key.toLowerCase())
    )
    
    // 次要关键词匹配
    const secondaryMatches = secondaryKeys.filter((key: string) => 
      fullText.includes(key.toLowerCase())
    )
    
    // 应用逻辑规则
    switch (entry.selectiveLogic) {
      case 'AND_ALL':
        // 所有主关键词都必须匹配
        return primaryMatches.length === primaryKeys.length
      
      case 'NOT_ALL':
        // 主关键词匹配但次要关键词不匹配
        return primaryMatches.length > 0 && secondaryMatches.length === 0
      
      case 'AND_ANY':
      default:
        // 至少一个主关键词匹配
        return primaryMatches.length > 0
    }
  }
  
  /**
   * 正则表达式匹配
   */
  private matchRegex(regexStr: string, text: string): boolean {
    try {
      // 解析 /pattern/flags 格式
      const match = regexStr.match(/^\/(.+)\/([gimuy]*)$/)
      if (!match) {
        // 如果不是标准格式，尝试直接作为正则使用
        const regex = new RegExp(regexStr, 'i')
        return regex.test(text)
      }
      
      const [, pattern, flags] = match
      const regex = new RegExp(pattern, flags)
      return regex.test(text)
    } catch (error) {
      console.warn(`Invalid regex pattern: ${regexStr}`, error)
      return false
    }
  }
  
  /**
   * 递归激活（级联触发）
   */
  private async activateRecursive(
    parentEntry: WorldInfo,
    level: number,
    visited: Set<string>,
    maxDepth: number
  ): Promise<ActivatedEntry[]> {
    if (level > maxDepth) return []
    
    const cascaded: ActivatedEntry[] = []
    let triggerIds: string[] = []
    
    try {
      triggerIds = parentEntry.cascadeTrigger 
        ? JSON.parse(parentEntry.cascadeTrigger) 
        : []
    } catch (error) {
      console.warn(`Failed to parse cascadeTrigger for WorldInfo ${parentEntry.id}:`, error)
      return []
    }
    
    for (const triggerId of triggerIds) {
      if (visited.has(triggerId)) continue
      
      const entry = await db.findUnique('WorldInfo', { 
        where: { id: triggerId }
      })
      
      if (!entry || !entry.enabled) continue
      
      // 检查是否在指定级别激活
      if (entry.recursiveLevel === 0 || entry.recursiveLevel === level) {
        cascaded.push({
          entry,
          position: entry.position || 'after_char',
          order: entry.insertionOrder || 100,
          activatedBy: 'recursive',
          cascadeLevel: level
        })
        visited.add(entry.id)
        
        // 继续递归
        if (entry.recursive && entry.cascadeTrigger) {
          const deeper = await this.activateRecursive(
            entry,
            level + 1,
            visited,
            maxDepth
          )
          cascaded.push(...deeper)
        }
      }
    }
    
    return cascaded
  }
  
  /**
   * 状态效果检查（Sticky/Cooldown/Delay）
   */
  private async checkStateEffects(
    entry: WorldInfo,
    chatId: string
  ): Promise<{ canActivate: boolean; reason?: string }> {
    // 查找最近的激活记录
    const activation = await db.findFirst('WorldInfoActivation', {
      where: {
        worldInfoId: entry.id,
        chatId
      },
      orderBy: { activatedAt: 'desc' }
    })
    
    if (!activation) {
      // 首次激活，检查 delay
      const delay = entry.delay || 0
      if (delay > 0) {
        const messageCount = await db.count('Message', { where: { chatId } })
        if (messageCount < delay) {
          return { canActivate: false, reason: 'delayed' }
        }
      }
      return { canActivate: true }
    }
    
    const now = new Date()
    
    // Sticky 检查（仍在持续期内，自动激活）
    const sticky = entry.sticky || 0
    if (sticky > 0 && activation.expiresAt && activation.expiresAt > now) {
      return { canActivate: true, reason: 'sticky' }
    }
    
    // Cooldown 检查
    const cooldown = entry.cooldown || 0
    if (cooldown > 0 && activation.cooldownUntil && activation.cooldownUntil > now) {
      return { canActivate: false, reason: 'cooldown' }
    }
    
    return { canActivate: true }
  }
  
  /**
   * 更新激活状态
   */
  private async updateActivationState(entry: WorldInfo, chatId: string): Promise<void> {
    const now = new Date()
    const messageCount = await db.count('Message', { where: { chatId } })
    
    const sticky = entry.sticky || 0
    const cooldown = entry.cooldown || 0
    
    // 计算过期时间（sticky 按消息数，简化为时间）
    const expiresAt = sticky > 0 
      ? new Date(now.getTime() + sticky * 60000) // 每条消息约1分钟（简化）
      : null
    
    const cooldownUntil = cooldown > 0
      ? new Date(now.getTime() + cooldown * 60000)
      : null
    
    await db.create('WorldInfoActivation', {
      data: {
        id: nanoid(),
        worldInfoId: entry.id,
        chatId,
        activatedAt: now,
        expiresAt,
        cooldownUntil,
        messageCount
      }
    })
  }
  
  /**
   * 获取角色的所有 World Info
   */
  private async getCharacterWorldInfo(characterId: string): Promise<WorldInfo[]> {
    return db.findMany('WorldInfo', {
      where: {
        characters: {
          some: { characterId }
        }
      }
    })
  }
}

