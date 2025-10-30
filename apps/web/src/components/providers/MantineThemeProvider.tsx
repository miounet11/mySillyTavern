/**
 * Mantine Theme Provider - Client Component Wrapper
 */

'use client'

import { MantineProvider } from '@mantine/core'
import { mantineTheme } from '@/lib/mantine-theme'
import '@mantine/core/styles.css'

export function MantineThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      {children}
    </MantineProvider>
  )
}

