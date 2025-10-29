/**
 * Token 计数工具
 * 使用快速估算方法（服务器端友好）
 */

export class TokenCounter {
  /**
   * 智能 token 计数（基于规则的估算）
   * 在服务器端使用，避免 WASM 依赖
   */
  countTokens(text: string, model: string = 'gpt-3.5-turbo'): number {
    if (!text) return 0
    
    // 改进的估算算法
    // 英文：平均 4 字符 = 1 token
    // 中文：平均 1.5 字符 = 1 token
    // 代码/特殊字符：平均 3 字符 = 1 token
    
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const codeChars = (text.match(/[{}()\[\]<>;:]/g) || []).length
    const otherChars = text.length - chineseChars - codeChars
    
    const estimatedTokens = Math.ceil(
      chineseChars / 1.5 +
      codeChars / 3 +
      otherChars / 4
    )
    
    return estimatedTokens
  }
  
  /**
   * 快速估算（text.length / 4）
   * 适用于实时 UI 显示
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }
  
  /**
   * 批量计数
   */
  countBatch(texts: string[], model?: string): number {
    return texts.reduce((sum, text) => sum + this.countTokens(text, model), 0)
  }
  
  /**
   * 计数消息数组
   */
  countMessages(messages: Array<{ role: string; content: string }>, model?: string): number {
    // 添加角色前缀和分隔符的额外 tokens
    const roleOverhead = messages.length * 4 // 估算每条消息的 role/name/分隔符等开销
    const contentTokens = messages.reduce(
      (sum, msg) => sum + this.countTokens(msg.content, model),
      0
    )
    return contentTokens + roleOverhead
  }
  
  /**
   * 检查文本是否超出限制
   */
  exceedsLimit(text: string, limit: number, model?: string): boolean {
    return this.countTokens(text, model) > limit
  }
  
  /**
   * 裁剪文本到指定 token 限制
   */
  truncateToLimit(text: string, limit: number, model?: string): string {
    const tokens = this.countTokens(text, model)
    
    if (tokens <= limit) {
      return text
    }
    
    // 二分搜索找到合适的截断点
    let left = 0
    let right = text.length
    let result = text
    
    while (left < right) {
      const mid = Math.floor((left + right + 1) / 2)
      const chunk = text.substring(0, mid)
      const chunkTokens = this.countTokens(chunk, model)
      
      if (chunkTokens <= limit) {
        result = chunk
        left = mid
      } else {
        right = mid - 1
      }
    }
    
    return result
  }
  
  /**
   * 清理（无操作，兼容旧代码）
   */
  cleanup() {
    // 基于规则的估算无需清理
  }
  
  /**
   * 获取支持的模型列表
   */
  static getSupportedModels(): string[] {
    return [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-32k',
      'gpt-4-turbo',
      'gpt-4o',
      'text-davinci-003',
      'text-davinci-002',
      'claude-2',
      'claude-3-opus',
      'claude-3-sonnet',
    ]
  }
}

// 单例导出（用于全局共享）
export const tokenCounter = new TokenCounter()

// 便捷函数
export function countTokens(text: string, model?: string): number {
  return tokenCounter.countTokens(text, model)
}

export function estimateTokens(text: string): number {
  return tokenCounter.estimateTokens(text)
}

export function countMessages(
  messages: Array<{ role: string; content: string }>,
  model?: string
): number {
  return tokenCounter.countMessages(messages, model)
}

