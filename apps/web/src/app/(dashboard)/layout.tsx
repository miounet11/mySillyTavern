'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppShell } from '@mantine/core'
import TopNavigation from '@/components/layout/TopNavigation'
import BottomNavigation from '@/components/layout/BottomNavigation'
import SettingsDrawer from '@/components/settings/SettingsDrawer'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const isChatPage = pathname === '/chat'

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      styles={{
        main: {
          backgroundColor: 'var(--mantine-color-dark-8)',
          minHeight: '100vh'
        }
      }}
    >
      <AppShell.Header>
        <TopNavigation />
      </AppShell.Header>

      <AppShell.Main className="pb-16 md:pb-0">
        {children}
      </AppShell.Main>
      
      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
      
      {/* Settings Drawer - Fixed on right as overlay - Uses global state */}
      {/* Only render in layout for non-chat pages; chat page renders its own */}
      {!isChatPage && <SettingsDrawer />}
    </AppShell>
  )
}