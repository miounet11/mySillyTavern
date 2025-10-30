'use client'

import { ReactNode, useState, useEffect } from 'react'
import { AppShell } from '@mantine/core'
import TopNavigation from '@/components/layout/TopNavigation'
import SettingsDrawer from '@/components/settings/SettingsDrawer'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Listen for open settings event from anywhere in the app
  useEffect(() => {
    const handleOpenSettings = () => {
      setIsSettingsOpen(true)
    }

    window.addEventListener('open-settings', handleOpenSettings)
    return () => {
      window.removeEventListener('open-settings', handleOpenSettings)
    }
  }, [])

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

      <AppShell.Main>
        {children}
      </AppShell.Main>
      
      {/* Settings Drawer - Fixed on right as overlay */}
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </AppShell>
  )
}