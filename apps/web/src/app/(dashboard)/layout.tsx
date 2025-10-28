'use client'

import { ReactNode, useState, useEffect } from 'react'
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
    <div className="flex flex-col min-h-screen bg-gray-950">
      <TopNavigation />
      <main className="flex-1">
        {children}
      </main>
      
      {/* Settings Drawer - Fixed on right as overlay */}
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  )
}