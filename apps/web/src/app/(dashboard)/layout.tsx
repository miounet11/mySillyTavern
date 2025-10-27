'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import SettingsDrawer from '@/components/settings/SettingsDrawer'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleNewChat = () => {
    // If not on chat page, navigate to it
    if (pathname !== '/chat') {
      router.push('/chat')
    }
    // Dispatch event to trigger new chat creation
    window.dispatchEvent(new CustomEvent('create-new-chat'))
  }

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
    <div className="flex h-screen bg-tavern-dark">
      <Sidebar onSettings={handleSettings} onNewChat={handleNewChat} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 min-h-0 overflow-y-auto tavern-scrollbar">
          {children}
        </main>
      </div>
      
      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  )
}