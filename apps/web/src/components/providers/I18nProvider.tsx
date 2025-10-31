'use client'

import { ReactNode, useEffect, useState } from 'react'
import { i18n } from '@/lib/i18n'
import { Center, Loader, Stack, Text } from '@mantine/core'

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(i18n.isReady())

  useEffect(() => {
    const initI18n = async () => {
      if (!i18n.isReady()) {
        await i18n.waitForInitialization()
        setIsReady(true)
      }
    }

    initI18n()
  }, [])

  if (!isReady) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">加载中...</Text>
        </Stack>
      </Center>
    )
  }

  return <>{children}</>
}

