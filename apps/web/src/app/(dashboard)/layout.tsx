'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSettings = () => {
    router.push('/settings')
  }

  const handleNewChat = () => {
    // If not on chat page, navigate to it
    if (pathname !== '/chat') {
      router.push('/chat')
    }
    // Dispatch event to trigger new chat creation
    window.dispatchEvent(new CustomEvent('create-new-chat'))
  }

  return (
    <div className="flex h-screen bg-tavern-dark">
      <Sidebar onSettings={handleSettings} onNewChat={handleNewChat} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}