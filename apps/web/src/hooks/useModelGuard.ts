import { useCallback, useMemo, useState } from 'react'
import { useAIModelStore } from '@/stores/aiModelStore'

export function useModelGuard() {
  const { activeModel, hydrated } = useAIModelStore()
  const [modelNotSetOpen, setModelNotSetOpen] = useState(false)

  const isModelReady = useMemo(() => {
    if (!hydrated) return false
    if (!activeModel) return false
    const provider = (activeModel as any).provider
    const model = (activeModel as any).model
    const apiKey = (activeModel as any).apiKey
    if (!provider || !model) return false
    // 本地模型可不需要 apiKey
    if (provider !== 'local' && !apiKey) return false
    return true
  }, [hydrated, activeModel])

  const assertModelReady = useCallback(() => {
    if (!isModelReady) {
      setModelNotSetOpen(true)
      try {
        // 同时打开右侧设置抽屉，便于用户立即配置
        window.dispatchEvent(new CustomEvent('open-settings'))
      } catch {}
      return false
    }
    return true
  }, [isModelReady])

  return { isModelReady, assertModelReady, modelNotSetOpen, setModelNotSetOpen }
}


