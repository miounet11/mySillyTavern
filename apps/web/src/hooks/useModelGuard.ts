import { useCallback, useMemo } from 'react'
import { useAIModelStore } from '@/stores/aiModelStore'
import { useSettingsUIStore } from '@/stores/settingsUIStore'

export function useModelGuard() {
  const { activeModel, hydrated } = useAIModelStore()
  const { openSettings } = useSettingsUIStore()

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
      // 直接打开设置中心的模型配置标签
      openSettings('models')
      return false
    }
    return true
  }, [isModelReady, openSettings])

  return { isModelReady, assertModelReady }
}


