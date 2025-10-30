/**
 * 性能监控工具
 * 用于测量和记录关键路径的性能
 */

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000 // 最多保留 1000 条记录

  /**
   * 测量异步函数执行时间
   */
  async measure<T>(
    name: string, 
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now()
    try {
      return await fn()
    } finally {
      const duration = performance.now() - start
      this.recordMetric({ name, duration, timestamp: Date.now(), metadata })
      console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`, metadata || '')
    }
  }

  /**
   * 测量同步函数执行时间
   */
  measureSync<T>(
    name: string, 
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      this.recordMetric({ name, duration, timestamp: Date.now(), metadata })
      console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`, metadata || '')
    }
  }

  /**
   * 记录性能指标
   */
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // 限制记录数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * 获取性能统计
   */
  getStats(name?: string) {
    const filtered = name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics

    if (filtered.length === 0) {
      return null
    }

    const durations = filtered.map(m => m.duration)
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)
    const p50 = this.percentile(durations, 0.5)
    const p95 = this.percentile(durations, 0.95)
    const p99 = this.percentile(durations, 0.99)

    return {
      name: name || 'all',
      count: filtered.length,
      avg: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      p50: p50.toFixed(2),
      p95: p95.toFixed(2),
      p99: p99.toFixed(2),
    }
  }

  /**
   * 计算百分位数
   */
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil(sorted.length * p) - 1
    return sorted[Math.max(0, index)]
  }

  /**
   * 获取最近的性能记录
   */
  getRecent(count: number = 10, name?: string) {
    const filtered = name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics

    return filtered.slice(-count)
  }

  /**
   * 清除所有记录
   */
  clear() {
    this.metrics = []
  }

  /**
   * 获取性能摘要
   */
  getSummary() {
    const names = [...new Set(this.metrics.map(m => m.name))]
    return names.map(name => this.getStats(name))
  }
}

// 单例实例
export const performanceMonitor = new PerformanceMonitor()

// 便捷函数
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measure(name, fn, metadata)
}

export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  return performanceMonitor.measureSync(name, fn, metadata)
}

export function getPerformanceStats(name?: string) {
  return performanceMonitor.getStats(name)
}

export function getPerformanceSummary() {
  return performanceMonitor.getSummary()
}

export function clearPerformanceMetrics() {
  performanceMonitor.clear()
}

// 性能标记点（用于前端）
export class PerformanceMark {
  private marks: Map<string, number> = new Map()

  mark(name: string) {
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark)
    if (!start) {
      console.warn(`[Perf] Start mark "${startMark}" not found`)
      return 0
    }

    const end = endMark ? this.marks.get(endMark) : performance.now()
    if (endMark && !end) {
      console.warn(`[Perf] End mark "${endMark}" not found`)
      return 0
    }

    const duration = (end || performance.now()) - start
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  clear() {
    this.marks.clear()
  }
}

export const perfMark = new PerformanceMark()

